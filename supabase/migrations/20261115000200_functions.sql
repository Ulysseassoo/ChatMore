-- =============================================================================
-- ChatMore — fonctions, triggers et RPC
-- Toutes les fonctions security definer ont search_path = '' et qualifient
-- chaque objet, pour qu'on ne puisse pas les détourner.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Fonctions utilitaires (utilisées par la RLS)
-- -----------------------------------------------------------------------------
create or replace function public.is_room_member(p_room_id bigint)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.room_members
    where room_id = p_room_id and user_id = (select auth.uid())
  );
$$;

create or replace function public.is_room_admin(p_room_id bigint)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.room_members
    where room_id = p_room_id and user_id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Date d'arrivée de l'utilisateur connecté : on ne voit pas l'historique d'avant.
create or replace function public.my_joined_at(p_room_id bigint)
returns timestamptz
language sql stable security definer set search_path = ''
as $$
  select joined_at from public.room_members
  where room_id = p_room_id and user_id = (select auth.uid());
$$;

-- L'autre membre d'une conversation privée.
create or replace function public.direct_peer(p_room_id bigint, p_user_id uuid)
returns uuid
language sql stable security definer set search_path = ''
as $$
  select m.user_id
  from public.room_members m
  join public.rooms r on r.id = m.room_id and r.type = 'direct'
  where m.room_id = p_room_id and m.user_id <> p_user_id
  limit 1;
$$;

-- Ai-je bloqué l'autre personne de cette conversation privée ?
create or replace function public.i_blocked_peer(p_room_id bigint)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.blocks
    where blocker_id = (select auth.uid())
      and blocked_id = public.direct_peer(p_room_id, (select auth.uid()))
  );
$$;

-- Un message est-il visible par l'utilisateur connecté ?
create or replace function public.can_see_message(p_message_id bigint)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.messages msg
    join public.room_members me
      on me.room_id = msg.room_id and me.user_id = (select auth.uid())
    where msg.id = p_message_id
      and msg.created_at >= me.joined_at
      and (not msg.is_blocked or msg.user_id = (select auth.uid()))
      and not exists (
        select 1 from public.hidden_messages h
        where h.message_id = msg.id and h.user_id = (select auth.uid())
      )
  );
$$;

-- -----------------------------------------------------------------------------
-- Inscription : le profil est créé par la base, dans la même transaction.
-- Si le pseudo est invalide ou déjà pris, toute l'inscription échoue.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, lower(new.raw_user_meta_data ->> 'username'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- Messages : ce que le client envoie n'est jamais cru sur parole.
-- -----------------------------------------------------------------------------
create or replace function public.prepare_message()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  -- Depuis l'API, l'auteur et la date viennent toujours de la base.
  -- (auth.uid() est nul dans seed.sql, qui peut alors fixer des dates passées.)
  if (select auth.uid()) is not null then
    new.user_id := (select auth.uid());
    new.created_at := now();
  end if;
  new.edited_at := null;
  new.deleted_at := null;

  -- Blocage silencieux : seulement en conversation privée, si l'autre m'a bloqué.
  new.is_blocked := exists (
    select 1 from public.blocks b
    where b.blocked_id = new.user_id
      and b.blocker_id = public.direct_peer(new.room_id, new.user_id)
  );

  -- On ne répond qu'à un message de la même conversation.
  if new.reply_to_id is not null and not exists (
    select 1 from public.messages
    where id = new.reply_to_id and room_id = new.room_id
  ) then
    raise exception 'reply_to_id must reference a message of the same room'
      using errcode = '22023';
  end if;

  return new;
end;
$$;

create trigger messages_prepare
  before insert on public.messages
  for each row execute function public.prepare_message();

create or replace function public.bump_room_activity()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if not new.is_blocked then
    update public.rooms set last_message_at = new.created_at
    where id = new.room_id
      and (last_message_at is null or last_message_at < new.created_at);
  end if;
  return null;
end;
$$;

create trigger messages_bump_room
  after insert on public.messages
  for each row execute function public.bump_room_activity();

-- -----------------------------------------------------------------------------
-- RPC : conversations
-- -----------------------------------------------------------------------------

-- Renvoie la conversation privée avec p_other, ou la crée. Sans doublon possible.
create or replace function public.get_or_create_direct_room(p_other uuid)
returns bigint
language plpgsql security definer set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_key text;
  v_room bigint;
begin
  if v_me is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_other is null or p_other = v_me then
    raise exception 'invalid peer' using errcode = '22023';
  end if;
  if not exists (select 1 from public.profiles where id = p_other) then
    raise exception 'unknown user' using errcode = 'P0002';
  end if;

  v_key := least(v_me::text, p_other::text) || ':' || greatest(v_me::text, p_other::text);

  insert into public.rooms (type, direct_key, created_by)
  values ('direct', v_key, v_me)
  on conflict (direct_key) do nothing
  returning id into v_room;

  if v_room is null then
    select id into v_room from public.rooms where direct_key = v_key;
  else
    insert into public.room_members (room_id, user_id)
    values (v_room, v_me), (v_room, p_other);
  end if;

  return v_room;
end;
$$;

create or replace function public.create_group(p_name text, p_member_ids uuid[])
returns bigint
language plpgsql security definer set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_room bigint;
begin
  if v_me is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  insert into public.rooms (type, name, created_by)
  values ('group', btrim(p_name), v_me)
  returning id into v_room;

  insert into public.room_members (room_id, user_id, role)
  values (v_room, v_me, 'admin');

  insert into public.room_members (room_id, user_id)
  select v_room, p.id
  from public.profiles p
  where p.id = any (coalesce(p_member_ids, '{}')) and p.id <> v_me
  on conflict do nothing;

  return v_room;
end;
$$;

create or replace function public.add_members(p_room_id bigint, p_member_ids uuid[])
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (select 1 from public.rooms where id = p_room_id and type = 'group') then
    raise exception 'members can only be added to a group' using errcode = '22023';
  end if;
  if not public.is_room_admin(p_room_id) then
    raise exception 'only admins can add members' using errcode = '42501';
  end if;

  insert into public.room_members (room_id, user_id)
  select p_room_id, p.id
  from public.profiles p
  where p.id = any (coalesce(p_member_ids, '{}'))
  on conflict do nothing;
end;
$$;

-- Garantit qu'un groupe garde toujours au moins un admin.
create or replace function public.ensure_group_admin(p_room_id bigint)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.room_members where room_id = p_room_id and role = 'admin'
  ) then
    update public.room_members set role = 'admin'
    where (room_id, user_id) = (
      select room_id, user_id from public.room_members
      where room_id = p_room_id
      order by joined_at, user_id
      limit 1
    );
  end if;
end;
$$;

create or replace function public.remove_member(p_room_id bigint, p_user_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (select 1 from public.rooms where id = p_room_id and type = 'group') then
    raise exception 'members can only be removed from a group' using errcode = '22023';
  end if;
  if not public.is_room_admin(p_room_id) then
    raise exception 'only admins can remove members' using errcode = '42501';
  end if;

  delete from public.room_members where room_id = p_room_id and user_id = p_user_id;
  perform public.ensure_group_admin(p_room_id);
end;
$$;

create or replace function public.set_member_role(p_room_id bigint, p_user_id uuid, p_role public.member_role)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_room_admin(p_room_id) then
    raise exception 'only admins can change roles' using errcode = '42501';
  end if;

  update public.room_members set role = p_role
  where room_id = p_room_id and user_id = p_user_id;
  perform public.ensure_group_admin(p_room_id);
end;
$$;

create or replace function public.leave_room(p_room_id bigint)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (select 1 from public.rooms where id = p_room_id and type = 'group') then
    raise exception 'only groups can be left' using errcode = '22023';
  end if;

  delete from public.room_members
  where room_id = p_room_id and user_id = (select auth.uid());

  if not exists (select 1 from public.room_members where room_id = p_room_id) then
    delete from public.rooms where id = p_room_id;
  else
    perform public.ensure_group_admin(p_room_id);
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC : lecture
-- -----------------------------------------------------------------------------
create or replace function public.mark_room_read(p_room_id bigint)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_receipts boolean;
begin
  if not public.is_room_member(p_room_id) then
    raise exception 'not a member of this room' using errcode = '42501';
  end if;

  select read_receipts into v_receipts from public.profiles where id = v_me;

  update public.room_members
  set last_read_at = now(),
      read_receipt_at = case when v_receipts then now() else null end
  where room_id = p_room_id and user_id = v_me;

  -- Prévenir les autres, sauf si je bloque mon interlocuteur (blocage silencieux).
  if v_receipts and not public.i_blocked_peer(p_room_id) then
    perform realtime.send(
      jsonb_build_object('user_id', v_me),
      'read',
      'room:' || p_room_id,
      true
    );
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC : messages
-- -----------------------------------------------------------------------------
create or replace function public.edit_message(p_message_id bigint, p_content text)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  update public.messages
  set content = p_content, edited_at = now()
  where id = p_message_id
    and user_id = (select auth.uid())
    and deleted_at is null;

  if not found then
    raise exception 'message not found or not editable' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.delete_message(p_message_id bigint, p_for_everyone boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
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

    delete from public.message_attachments where message_id = p_message_id;
    delete from public.message_reactions where message_id = p_message_id;
  else
    insert into public.hidden_messages (user_id, message_id)
    values ((select auth.uid()), p_message_id)
    on conflict do nothing;
  end if;
end;
$$;

-- Envoi d'un message avec pièce jointe, en une seule transaction.
-- Le fichier doit déjà être dans le bucket « attachments », sous <room_id>/<uuid>.<ext>.
create or replace function public.send_attachment(
  p_room_id bigint,
  p_storage_path text,
  p_kind public.attachment_kind,
  p_mime_type text,
  p_size_bytes integer,
  p_content text default '',
  p_client_id uuid default null,
  p_width integer default null,
  p_height integer default null,
  p_duration_ms integer default null
)
returns bigint
language plpgsql security definer set search_path = ''
as $$
declare
  v_message bigint;
begin
  if not public.is_room_member(p_room_id) or public.i_blocked_peer(p_room_id) then
    raise exception 'cannot post in this room' using errcode = '42501';
  end if;
  if split_part(p_storage_path, '/', 1) <> p_room_id::text then
    raise exception 'attachment path must start with the room id' using errcode = '22023';
  end if;
  if not exists (
    select 1 from storage.objects
    where bucket_id = 'attachments' and name = p_storage_path and owner_id = (select auth.uid())::text
  ) then
    raise exception 'attachment not uploaded' using errcode = 'P0002';
  end if;

  insert into public.messages (room_id, content, client_id)
  values (p_room_id, coalesce(p_content, ''), p_client_id)
  returning id into v_message;

  insert into public.message_attachments
    (message_id, kind, storage_path, mime_type, size_bytes, width, height, duration_ms)
  values
    (v_message, p_kind, p_storage_path, p_mime_type, p_size_bytes, p_width, p_height, p_duration_ms);

  return v_message;
end;
$$;

-- Page de messages (curseur created_at + id), avec le statut de mes propres messages.
-- status : 'sent' | 'read'. « Distribué » n'est pas suivi : il faudrait un accusé par appareil.
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
         page.edited_at, page.deleted_at, page.created_at,
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

-- -----------------------------------------------------------------------------
-- RPC : liste des conversations, en une seule requête (fin du N+1).
-- -----------------------------------------------------------------------------
create or replace function public.get_my_rooms()
returns table (
  room_id bigint,
  type public.room_type,
  name text,
  avatar_url text,
  peer jsonb,
  member_count integer,
  last_message jsonb,
  unread_count integer,
  muted boolean,
  i_blocked_peer boolean,
  last_activity_at timestamptz
)
language sql stable security definer set search_path = ''
as $$
  select
    r.id,
    r.type,
    r.name,
    r.avatar_url,
    case when r.type = 'direct' then (
      select jsonb_build_object('id', p.id, 'username', p.username, 'avatar_url', p.avatar_url)
      from public.room_members m2
      join public.profiles p on p.id = m2.user_id
      where m2.room_id = r.id and m2.user_id <> me.user_id
    ) end,
    (select count(*)::integer from public.room_members m3 where m3.room_id = r.id),
    (
      select jsonb_build_object(
        'id', msg.id, 'user_id', msg.user_id, 'content', msg.content,
        'created_at', msg.created_at, 'deleted_at', msg.deleted_at,
        'has_attachment', exists (select 1 from public.message_attachments a where a.message_id = msg.id)
      )
      from public.messages msg
      where msg.room_id = r.id
        and msg.created_at >= me.joined_at
        and (not msg.is_blocked or msg.user_id = me.user_id)
        and not exists (
          select 1 from public.hidden_messages h
          where h.message_id = msg.id and h.user_id = me.user_id
        )
      order by msg.created_at desc, msg.id desc
      limit 1
    ),
    (
      select count(*)::integer from public.messages msg
      where msg.room_id = r.id
        and msg.user_id <> me.user_id
        and not msg.is_blocked
        and msg.deleted_at is null
        and msg.created_at > greatest(me.last_read_at, me.joined_at)
    ),
    me.muted,
    exists (
      select 1 from public.blocks b
      where b.blocker_id = me.user_id
        and b.blocked_id = public.direct_peer(r.id, me.user_id)
    ),
    coalesce(r.last_message_at, me.joined_at)
  from public.room_members me
  join public.rooms r on r.id = me.room_id
  where me.user_id = (select auth.uid())
  order by coalesce(r.last_message_at, me.joined_at) desc;
$$;

-- Membres d'une conversation. L'accusé de lecture n'est visible que si j'ai
-- moi-même activé les miens (réciprocité, comme WhatsApp).
create or replace function public.get_room_members(p_room_id bigint)
returns table (
  user_id uuid,
  username text,
  avatar_url text,
  role public.member_role,
  joined_at timestamptz,
  read_receipt_at timestamptz
)
language plpgsql stable security definer set search_path = ''
as $$
#variable_conflict use_column
declare
  v_my_receipts boolean;
begin
  if not public.is_room_member(p_room_id) then
    raise exception 'not a member of this room' using errcode = '42501';
  end if;

  select read_receipts into v_my_receipts from public.profiles where id = (select auth.uid());

  return query
  select m.user_id, p.username, p.avatar_url, m.role, m.joined_at,
         case when v_my_receipts then m.read_receipt_at end
  from public.room_members m
  join public.profiles p on p.id = m.user_id
  where m.room_id = p_room_id
  order by m.joined_at, m.user_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC : profils
-- -----------------------------------------------------------------------------

-- Recherche par pseudo, insensible aux accents et à la casse.
create or replace function public.search_profiles(p_query text, p_limit integer default 20)
returns table (id uuid, username text, avatar_url text, direct_room_id bigint)
language sql stable security definer set search_path = ''
as $$
  select p.id, p.username, p.avatar_url,
         (
           select r.id from public.rooms r
           where r.direct_key = least((select auth.uid())::text, p.id::text)
                                || ':' || greatest((select auth.uid())::text, p.id::text)
         )
  from public.profiles p
  where (select auth.uid()) is not null
    and p.id <> (select auth.uid())
    and char_length(btrim(p_query)) >= 2
    and extensions.unaccent(p.username) ilike '%' || extensions.unaccent(lower(btrim(p_query))) || '%'
  order by extensions.similarity(p.username, lower(btrim(p_query))) desc, p.username
  limit least(greatest(p_limit, 1), 50);
$$;

-- Profil complet. Le téléphone n'est visible que par soi-même et par les
-- personnes avec qui on partage une conversation.
create or replace function public.get_profile(p_user_id uuid)
returns table (
  id uuid, username text, avatar_url text, about text, phone text,
  read_receipts boolean, show_online public.online_visibility
)
language sql stable security definer set search_path = ''
as $$
  select p.id, p.username, p.avatar_url, p.about,
         case
           when p.id = (select auth.uid()) or exists (
             select 1 from public.room_members a
             join public.room_members b on b.room_id = a.room_id
             where a.user_id = (select auth.uid()) and b.user_id = p.id
           ) then p.phone
         end,
         case when p.id = (select auth.uid()) then p.read_receipts end,
         case when p.id = (select auth.uid()) then p.show_online end
  from public.profiles p
  where p.id = p_user_id and (select auth.uid()) is not null;
$$;
