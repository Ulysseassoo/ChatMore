-- ChatMore — compléments pour le front
--   is_username_available : vérification en direct du pseudo (inscription, réglages)
--   get_my_rooms          : renvoie aussi ma dernière lecture, pour afficher le
--                           séparateur « nouveaux messages » à l'ouverture

create or replace function public.is_username_available(p_username text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select lower(btrim(p_username)) ~ '^[a-z0-9._]{3,24}$'
    and not exists (
      select 1 from public.profiles
      where username = lower(btrim(p_username))
        and id is distinct from (select auth.uid())
    );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;

-- Le type de retour change : il faut supprimer puis recréer la fonction.
drop function public.get_my_rooms();

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
  last_activity_at timestamptz,
  my_last_read_at timestamptz
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
    coalesce(r.last_message_at, me.joined_at),
    greatest(me.last_read_at, me.joined_at)
  from public.room_members me
  join public.rooms r on r.id = me.room_id
  where me.user_id = (select auth.uid())
  order by coalesce(r.last_message_at, me.joined_at) desc;
$$;

grant execute on function public.get_my_rooms() to authenticated;
