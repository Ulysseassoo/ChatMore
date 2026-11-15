-- ChatMore — droits et RLS
-- Principe : tout est fermé par défaut, on n'ouvre que le nécessaire.
-- Les écritures sensibles passent par les RPC (security definer).

-- Supabase donne par défaut tous les droits à anon et authenticated : on repart de zéro.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from anon, public;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from anon, public;

alter table public.profiles            enable row level security;
alter table public.rooms               enable row level security;
alter table public.room_members        enable row level security;
alter table public.messages            enable row level security;
alter table public.hidden_messages     enable row level security;
alter table public.message_attachments enable row level security;
alter table public.message_reactions   enable row level security;
alter table public.blocks              enable row level security;

-- profiles : lecture des champs publics, modification de son propre profil.
-- phone, read_receipts et show_online passent par get_profile().
grant select (id, username, avatar_url, about, created_at) on public.profiles to authenticated;
grant update (username, avatar_url, about, phone, read_receipts, show_online) on public.profiles to authenticated;

create policy "profiles are readable by signed-in users"
  on public.profiles for select to authenticated
  using (true);

create policy "users update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- rooms : visibles par leurs membres. Les admins renomment un groupe.
grant select (id, type, name, avatar_url, created_by, created_at, last_message_at) on public.rooms to authenticated;
grant update (name, avatar_url) on public.rooms to authenticated;

create policy "members read their rooms"
  on public.rooms for select to authenticated
  using (public.is_room_member(id));

create policy "admins edit their groups"
  on public.rooms for update to authenticated
  using (type = 'group' and public.is_room_admin(id))
  with check (type = 'group' and public.is_room_admin(id));

-- room_members : les membres d'une room se voient entre eux.
-- last_read_at, read_receipt_at et muted ne sont lisibles que via les RPC.
grant select (room_id, user_id, role, joined_at) on public.room_members to authenticated;
grant update (muted) on public.room_members to authenticated;

create policy "members see the members of their rooms"
  on public.room_members for select to authenticated
  using (public.is_room_member(room_id));

create policy "members mute a room for themselves"
  on public.room_members for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- messages
-- is_blocked n'est jamais lisible : le bloqué ne doit pas savoir qu'il l'est.
-- Pas d'update/delete direct : edit_message() et delete_message().
grant select (id, room_id, user_id, content, reply_to_id, client_id, edited_at, deleted_at, created_at)
  on public.messages to authenticated;
grant insert (room_id, content, reply_to_id, client_id) on public.messages to authenticated;

create policy "members read visible messages"
  on public.messages for select to authenticated
  using (public.can_see_message(id));

create policy "members post unless they blocked the peer"
  on public.messages for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.is_room_member(room_id)
    and not public.i_blocked_peer(room_id)
  );

-- hidden_messages : « supprimer pour moi »
grant select, delete on public.hidden_messages to authenticated;
grant insert (message_id) on public.hidden_messages to authenticated;

create policy "users see what they hid"
  on public.hidden_messages for select to authenticated
  using (user_id = (select auth.uid()));

create policy "users hide messages they can see"
  on public.hidden_messages for insert to authenticated
  with check (user_id = (select auth.uid()) and public.can_see_message(message_id));

create policy "users unhide their messages"
  on public.hidden_messages for delete to authenticated
  using (user_id = (select auth.uid()));

-- message_attachments : lecture seule, l'écriture passe par send_attachment().
grant select on public.message_attachments to authenticated;

create policy "attachments follow their message"
  on public.message_attachments for select to authenticated
  using (public.can_see_message(message_id));

-- message_reactions : une réaction par personne, modifiable et retirable.
grant select, delete on public.message_reactions to authenticated;
grant insert (message_id, emoji), update (emoji) on public.message_reactions to authenticated;

create policy "reactions follow their message"
  on public.message_reactions for select to authenticated
  using (public.can_see_message(message_id));

create policy "users react to messages they can see"
  on public.message_reactions for insert to authenticated
  with check (user_id = (select auth.uid()) and public.can_see_message(message_id));

create policy "users change their reaction"
  on public.message_reactions for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "users remove their reaction"
  on public.message_reactions for delete to authenticated
  using (user_id = (select auth.uid()));

-- blocks : chacun ne voit et ne gère que ses propres blocages.
grant select, delete on public.blocks to authenticated;
grant insert (blocked_id) on public.blocks to authenticated;

create policy "users see who they blocked"
  on public.blocks for select to authenticated
  using (blocker_id = (select auth.uid()));

create policy "users block in their own name"
  on public.blocks for insert to authenticated
  with check (blocker_id = (select auth.uid()));

create policy "users unblock in their own name"
  on public.blocks for delete to authenticated
  using (blocker_id = (select auth.uid()));

-- RPC exposées aux utilisateurs connectés
grant execute on function
  public.get_or_create_direct_room(uuid),
  public.create_group(text, uuid[]),
  public.add_members(bigint, uuid[]),
  public.remove_member(bigint, uuid),
  public.set_member_role(bigint, uuid, public.member_role),
  public.leave_room(bigint),
  public.mark_room_read(bigint),
  public.edit_message(bigint, text),
  public.delete_message(bigint, boolean),
  public.send_attachment(bigint, text, public.attachment_kind, text, integer, text, uuid, integer, integer, integer),
  public.get_messages(bigint, timestamptz, bigint, integer),
  public.get_my_rooms(),
  public.get_room_members(bigint),
  public.search_profiles(text, integer),
  public.get_profile(uuid)
to authenticated;

-- Utilisées par les règles RLS (y compris celles du Storage et de Realtime).
grant execute on function
  public.is_room_member(bigint),
  public.is_room_admin(bigint),
  public.my_joined_at(bigint),
  public.direct_peer(bigint, uuid),
  public.i_blocked_peer(bigint),
  public.can_see_message(bigint)
to authenticated;
