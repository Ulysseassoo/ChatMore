-- ChatMore — Storage
--   avatars      public : <user_id>/<fichier>    (photos de profil et de groupe)
--   attachments  privé  : <room_id>/<uuid>.<ext> (pièces jointes, URL signées)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2 * 1024 * 1024,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('attachments', 'attachments', false, 20 * 1024 * 1024,
   array['image/jpeg', 'image/png', 'image/webp', 'image/gif',
         'application/pdf', 'audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4'])
on conflict (id) do nothing;

-- Le premier dossier du chemin d'une pièce jointe est l'id de la room.
create or replace function public.attachment_room_id(p_name text)
returns bigint
language sql immutable set search_path = ''
as $$
  select case
    when split_part(p_name, '/', 1) ~ '^[0-9]{1,18}$'
      then split_part(p_name, '/', 1)::bigint
  end;
$$;

grant execute on function public.attachment_room_id(text) to authenticated;

-- avatars : chacun écrit dans son dossier ; un admin écrit dans le dossier du groupe.
create policy "users manage their avatar"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (
      split_part(name, '/', 1) = (select auth.uid())::text
      or (split_part(name, '/', 1) ~ '^room-[0-9]{1,18}$'
          and public.is_room_admin(substr(split_part(name, '/', 1), 6)::bigint))
    )
  );

create policy "users replace their avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and owner_id = (select auth.uid())::text);

create policy "users delete their avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and owner_id = (select auth.uid())::text);

-- attachments : lecture par les membres de la room, dépôt par un membre
-- (qui n'a pas bloqué son interlocuteur), suppression par l'auteur.
create policy "members read room attachments"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'attachments'
    and public.is_room_member(public.attachment_room_id(name))
  );

create policy "members upload room attachments"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'attachments'
    and public.is_room_member(public.attachment_room_id(name))
    and not public.i_blocked_peer(public.attachment_room_id(name))
  );

create policy "authors delete their attachments"
  on storage.objects for delete to authenticated
  using (bucket_id = 'attachments' and owner_id = (select auth.uid())::text);
