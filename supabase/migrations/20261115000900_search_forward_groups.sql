-- Recherche, transfert, édition des groupes, nettoyage des pièces jointes.

alter table public.messages add column forwarded boolean not null default false;
grant select (forwarded) on public.messages to authenticated;

-- Un fichier transféré est partagé entre plusieurs messages : plus d'unicité du chemin.
alter table public.message_attachments drop constraint message_attachments_storage_path_key;
create index message_attachments_storage_path on public.message_attachments (storage_path);

drop function public.get_messages(bigint, timestamptz, bigint, integer);
create or replace function public.get_messages(
  p_room_id bigint,
  p_before_created_at timestamptz default null,
  p_before_id bigint default null,
  p_limit integer default 50
)
returns table (
  id bigint,
  room_id bigint,
  user_id uuid,
  content text,
  reply_to_id bigint,
  client_id uuid,
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz,
  forwarded boolean,
  status text,
  read_count integer
)
language plpgsql stable security definer set search_path = ''
as $$
#variable_conflict use_column
declare
  v_me uuid := (select auth.uid());
  v_my_receipts boolean;
begin
  if not public.is_room_member(p_room_id) then
    raise exception 'not a member of this room' using errcode = '42501';
  end if;

  select pr.read_receipts into v_my_receipts from public.profiles pr where pr.id = v_me;

  return query
  with page as (
    select msg.*
    from public.messages msg
    where msg.room_id = p_room_id
      and public.can_see_message(msg.id)
      and (
        p_before_created_at is null
        or (msg.created_at, msg.id) < (p_before_created_at, coalesce(p_before_id, 9223372036854775807))
      )
    order by msg.created_at desc, msg.id desc
    limit least(greatest(p_limit, 1), 100)
  ),
  readers as (
    select page.id as message_id,
           count(*) filter (where rm.read_receipt_at >= page.created_at)::integer as n_read,
           count(*)::integer as n_total
    from page
    join public.room_members rm
      on rm.room_id = page.room_id
     and rm.user_id <> page.user_id
     and rm.joined_at <= page.created_at
    where page.user_id = v_me and not page.is_blocked
    group by page.id
  )
  select page.id, page.room_id, page.user_id, page.content, page.reply_to_id, page.client_id,
         page.edited_at, page.deleted_at, page.created_at, page.forwarded,
         case
           when page.user_id <> v_me then null
           when v_my_receipts and r.n_total > 0 and r.n_read = r.n_total then 'read'
           else 'sent'
         end,
         case when page.user_id = v_me and v_my_receipts then coalesce(r.n_read, 0) else null end
  from page
  left join readers r on r.message_id = page.id
  order by page.created_at desc, page.id desc;
end;
$$;

grant execute on function public.get_messages(bigint, timestamptz, bigint, integer) to authenticated;

-- Renvoie les fichiers qui ne sont plus utilisés par aucun message, pour que l'auteur les supprime du Storage.
drop function public.delete_message(bigint, boolean);
create or replace function public.delete_message(p_message_id bigint, p_for_everyone boolean)
returns text[]
language plpgsql security definer set search_path = ''
as $$
declare
  v_paths text[];
begin
  if not public.can_see_message(p_message_id) then
    raise exception 'message not found' using errcode = 'P0002';
  end if;

  if p_for_everyone then
    update public.messages
    set content = '', deleted_at = now(), reply_to_id = null
    where id = p_message_id and user_id = (select auth.uid()) and deleted_at is null;

    if not found then
      raise exception 'only the author can delete for everyone' using errcode = '42501';
    end if;

    with removed as (
      delete from public.message_attachments where message_id = p_message_id returning storage_path
    )
    select array_agg(storage_path) into v_paths from removed;

    -- Requête séparée : dans la précédente, les lignes supprimées seraient encore visibles.
    select array_agg(p) into v_paths
    from unnest(v_paths) p
    where not exists (select 1 from public.message_attachments a where a.storage_path = p);
    delete from public.message_reactions where message_id = p_message_id;
  else
    insert into public.hidden_messages (user_id, message_id)
    values ((select auth.uid()), p_message_id)
    on conflict do nothing;
  end if;

  return coalesce(v_paths, '{}');
end;
$$;

grant execute on function public.delete_message(bigint, boolean) to authenticated;

create or replace function public.search_messages(p_room_id bigint, p_query text, p_limit integer default 50)
returns table (id bigint, user_id uuid, content text, created_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select m.id, m.user_id, m.content, m.created_at
  from public.messages m
  where m.room_id = p_room_id
    and public.is_room_member(p_room_id)
    and char_length(btrim(p_query)) >= 2
    and m.deleted_at is null
    and public.can_see_message(m.id)
    and extensions.unaccent(lower(m.content)) like '%' || extensions.unaccent(lower(btrim(p_query))) || '%'
  order by m.created_at desc, m.id desc
  limit least(greatest(p_limit, 1), 100);
$$;

create or replace function public.forward_message(p_message_id bigint, p_room_ids bigint[])
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_source public.messages;
  v_room bigint;
  v_new bigint;
  v_count integer := 0;
begin
  if not public.can_see_message(p_message_id) then
    raise exception 'message not found' using errcode = 'P0002';
  end if;
  select * into v_source from public.messages where id = p_message_id;
  if v_source.deleted_at is not null then
    raise exception 'deleted messages cannot be forwarded' using errcode = '22023';
  end if;

  foreach v_room in array coalesce(p_room_ids, '{}') loop
    if not public.is_room_member(v_room) or public.i_blocked_peer(v_room) then
      raise exception 'cannot post in room %', v_room using errcode = '42501';
    end if;

    insert into public.messages (room_id, content, forwarded)
    values (v_room, v_source.content, true)
    returning id into v_new;

    insert into public.message_attachments
      (message_id, kind, storage_path, mime_type, size_bytes, width, height, duration_ms)
    select v_new, kind, storage_path, mime_type, size_bytes, width, height, duration_ms
    from public.message_attachments where message_id = p_message_id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

grant execute on function public.search_messages(bigint, text, integer), public.forward_message(bigint, bigint[]) to authenticated;

-- Un fichier se lit via un message visible qui le référence (y compris après un transfert).
create or replace function public.can_read_attachment(p_name text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.message_attachments a
    where a.storage_path = p_name and public.can_see_message(a.message_id)
  );
$$;

grant execute on function public.can_read_attachment(text) to authenticated;

drop policy "members read room attachments" on storage.objects;

create policy "members read visible attachments"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'attachments'
    and (owner_id = (select auth.uid())::text or public.can_read_attachment(name))
  );

create or replace function public.broadcast_room_update()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  perform realtime.send(jsonb_build_object('room_id', new.id), 'room_updated', 'room:' || new.id, true);
  return null;
end;
$$;

create trigger rooms_broadcast_update
  after update of name, avatar_url on public.rooms
  for each row execute function public.broadcast_room_update();
