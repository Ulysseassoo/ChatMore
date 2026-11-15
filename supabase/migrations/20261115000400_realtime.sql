-- =============================================================================
-- ChatMore — temps réel
-- Channels privés uniquement :
--   room:<id>   messages, lectures, réactions, présence (« en ligne », « écrit… »)
--   user:<uuid> événements personnels (nouvelle conversation, blocages)
-- Les clients n'émettent que de la présence. Tout le reste est diffusé par la base.
-- =============================================================================

-- Qui peut écouter un channel ?
create or replace function public.can_listen_topic(p_topic text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select case
    when p_topic ~ '^room:[0-9]{1,18}$'
      then public.is_room_member(split_part(p_topic, ':', 2)::bigint)
    when p_topic ~ '^user:[0-9a-f-]{36}$'
      then split_part(p_topic, ':', 2) = (select auth.uid())::text
    else false
  end;
$$;

-- Qui peut émettre de la présence ? Seulement les membres, et pas dans une
-- conversation privée avec quelqu'un qu'on a bloqué (il ne doit pas nous voir en ligne).
create or replace function public.can_track_presence(p_topic text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select p_topic ~ '^room:[0-9]{1,18}$'
    and public.is_room_member(split_part(p_topic, ':', 2)::bigint)
    and not public.i_blocked_peer(split_part(p_topic, ':', 2)::bigint);
$$;

grant execute on function public.can_listen_topic(text), public.can_track_presence(text) to authenticated;

create policy "members listen to their channels"
  on realtime.messages for select to authenticated
  using (public.can_listen_topic((select realtime.topic())));

create policy "members share presence in their rooms"
  on realtime.messages for insert to authenticated
  with check (
    realtime.messages.extension = 'presence'
    and public.can_track_presence((select realtime.topic()))
  );

-- -----------------------------------------------------------------------------
-- Messages : on diffuse une sélection de colonnes (jamais is_blocked).
-- Un message bloqué n'est pas diffusé du tout.
-- -----------------------------------------------------------------------------
create or replace function public.message_payload(m public.messages)
returns jsonb
language sql immutable set search_path = ''
as $$
  select jsonb_build_object(
    'id', m.id, 'room_id', m.room_id, 'user_id', m.user_id, 'content', m.content,
    'reply_to_id', m.reply_to_id, 'client_id', m.client_id,
    'edited_at', m.edited_at, 'deleted_at', m.deleted_at, 'created_at', m.created_at
  );
$$;

create or replace function public.broadcast_message()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.is_blocked then
    return null;
  end if;

  perform realtime.send(
    public.message_payload(new),
    case tg_op when 'INSERT' then 'message_created' else 'message_updated' end,
    'room:' || new.room_id,
    true
  );
  return null;
end;
$$;

create trigger messages_broadcast
  after insert or update on public.messages
  for each row execute function public.broadcast_message();

-- Pièces jointes et réactions : simple notification, le client recharge le message.
create or replace function public.broadcast_message_children()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_message_id bigint := coalesce(new.message_id, old.message_id);
  v_room bigint;
  v_blocked boolean;
begin
  select room_id, is_blocked into v_room, v_blocked
  from public.messages where id = v_message_id;

  if v_room is not null and not v_blocked then
    perform realtime.send(
      jsonb_build_object('message_id', v_message_id),
      case tg_table_name when 'message_reactions' then 'reaction_changed' else 'attachment_added' end,
      'room:' || v_room,
      true
    );
  end if;
  return null;
end;
$$;

create trigger message_reactions_broadcast
  after insert or update or delete on public.message_reactions
  for each row execute function public.broadcast_message_children();

create trigger message_attachments_broadcast
  after insert on public.message_attachments
  for each row execute function public.broadcast_message_children();

-- -----------------------------------------------------------------------------
-- Membres : la personne ajoutée ou retirée est prévenue sur son channel perso,
-- les autres membres sur le channel de la room.
-- -----------------------------------------------------------------------------
create or replace function public.broadcast_membership()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform realtime.send(jsonb_build_object('room_id', new.room_id), 'room_joined', 'user:' || new.user_id, true);
    perform realtime.send(jsonb_build_object('user_id', new.user_id), 'members_changed', 'room:' || new.room_id, true);
  elsif tg_op = 'DELETE' then
    perform realtime.send(jsonb_build_object('room_id', old.room_id), 'room_left', 'user:' || old.user_id, true);
    perform realtime.send(jsonb_build_object('user_id', old.user_id), 'members_changed', 'room:' || old.room_id, true);
  elsif new.role is distinct from old.role then
    perform realtime.send(jsonb_build_object('user_id', new.user_id), 'members_changed', 'room:' || new.room_id, true);
  end if;
  return null;
end;
$$;

create trigger room_members_broadcast
  after insert or delete or update of role on public.room_members
  for each row execute function public.broadcast_membership();

-- -----------------------------------------------------------------------------
-- Blocages : seul celui qui bloque est prévenu (synchronisation de ses appareils).
-- -----------------------------------------------------------------------------
create or replace function public.broadcast_block()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  perform realtime.send(
    jsonb_build_object('blocked_id', coalesce(new.blocked_id, old.blocked_id)),
    'blocks_changed',
    'user:' || coalesce(new.blocker_id, old.blocker_id),
    true
  );
  return null;
end;
$$;

create trigger blocks_broadcast
  after insert or delete on public.blocks
  for each row execute function public.broadcast_block();
