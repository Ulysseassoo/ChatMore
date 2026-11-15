begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(14);

insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000000', 'a11ce000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alice@test.local', '{"username":"alice"}'),
  ('00000000-0000-0000-0000-000000000000', 'b0b00000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bob@test.local',   '{"username":"bob"}'),
  ('00000000-0000-0000-0000-000000000000', 'ca201000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'carol@test.local', '{"username":"carol"}'),
  ('00000000-0000-0000-0000-000000000000', 'da5e0000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dave@test.local',  '{"username":"dave"}');

create function pg_temp.login(p_user uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  select set_config('role', 'authenticated', true);
$$;

create temp table ids (k text primary key, v bigint);
grant all on ids to authenticated;

select pg_temp.login('a11ce000-0000-0000-0000-000000000000');
insert into ids values ('ab', public.get_or_create_direct_room('b0b00000-0000-0000-0000-000000000000'));
insert into ids values ('g', public.create_group('Coloc', array['ca201000-0000-0000-0000-000000000000']::uuid[]));
insert into public.messages (room_id, content) values ((select v from ids where k = 'ab'), 'Rendez-vous à la gare de Lyon');
insert into ids values ('photo', (select id from public.messages where content = 'Rendez-vous à la gare de Lyon'));

reset role;
insert into storage.objects (bucket_id, name, owner_id)
values ('attachments', (select v from ids where k = 'ab') || '/photo.webp', 'a11ce000-0000-0000-0000-000000000000');
insert into public.message_attachments (message_id, kind, storage_path, mime_type, size_bytes)
values ((select v from ids where k = 'photo'), 'image', (select v from ids where k = 'ab') || '/photo.webp', 'image/webp', 1000);

-- Recherche
select pg_temp.login('b0b00000-0000-0000-0000-000000000000');
select is((select count(*)::int from public.search_messages((select v from ids where k = 'ab'), 'GARE de lyon')), 1,
  'La recherche ignore la casse');
select is((select count(*)::int from public.search_messages((select v from ids where k = 'ab'), 'gare de lyön')), 1,
  'La recherche ignore les accents');

select pg_temp.login('da5e0000-0000-0000-0000-000000000000');
select is_empty($$ select * from public.search_messages((select v from ids where k = 'ab'), 'gare') $$,
  'On ne cherche pas dans une conversation dont on n''est pas membre');

-- Transfert
select throws_ok(
  $$ select public.forward_message((select v from ids where k = 'photo'), array[(select v from ids where k = 'g')]) $$,
  'P0002', null, 'On ne transfère pas un message qu''on ne peut pas lire');

select pg_temp.login('a11ce000-0000-0000-0000-000000000000');
select is(public.forward_message((select v from ids where k = 'photo'), array[(select v from ids where k = 'g')]), 1,
  'Alice transfère le message dans le groupe');

select pg_temp.login('ca201000-0000-0000-0000-000000000000');
select is(
  (select forwarded from public.messages where room_id = (select v from ids where k = 'g') and content = 'Rendez-vous à la gare de Lyon'),
  true, 'Carol voit le message marqué « transféré »');
select isnt_empty(
  format($$ select 1 from storage.objects where name = '%s/photo.webp' $$, (select v from ids where k = 'ab')),
  'Carol peut lire le fichier transféré, bien qu''il soit rangé dans la conversation d''Alice et Bob');
select throws_ok(
  $$ select public.forward_message((select v from ids where k = 'photo'), array[(select v from ids where k = 'g')]) $$,
  'P0002', null, 'Carol ne peut pas retransférer le message d''origine, qu''elle ne voit pas');

select pg_temp.login('da5e0000-0000-0000-0000-000000000000');
select is_empty(
  format($$ select 1 from storage.objects where name = '%s/photo.webp' $$, (select v from ids where k = 'ab')),
  'Dave ne peut pas lire le fichier');

-- Suppression pour tous : le fichier n'est rendu à supprimer que s'il n'est plus utilisé
select pg_temp.login('a11ce000-0000-0000-0000-000000000000');
select is(public.delete_message((select v from ids where k = 'photo'), true), '{}'::text[],
  'Fichier encore utilisé par le message transféré : à conserver');
select is(
  public.delete_message((select id from public.messages where room_id = (select v from ids where k = 'g') and forwarded), true),
  array[(select v from ids where k = 'ab') || '/photo.webp'],
  'Dernière utilisation supprimée : le fichier est rendu pour être effacé');

-- Groupes : seuls les admins renomment
select pg_temp.login('ca201000-0000-0000-0000-000000000000');
update public.rooms set name = 'Piraté' where id = (select v from ids where k = 'g');
reset role;
select is((select name from public.rooms where id = (select v from ids where k = 'g')), 'Coloc',
  'Un membre qui n''est pas admin ne renomme pas le groupe');

select pg_temp.login('a11ce000-0000-0000-0000-000000000000');
update public.rooms set name = 'Coloc 2026' where id = (select v from ids where k = 'g');
reset role;
select is((select name from public.rooms where id = (select v from ids where k = 'g')), 'Coloc 2026',
  'L''admin renomme le groupe');

select pg_temp.login('a11ce000-0000-0000-0000-000000000000');
update public.rooms set name = 'Privé' where id = (select v from ids where k = 'ab');
reset role;
select is((select name from public.rooms where id = (select v from ids where k = 'ab')), null,
  'Une conversation privée ne peut pas recevoir de nom');

select * from finish();
rollback;
