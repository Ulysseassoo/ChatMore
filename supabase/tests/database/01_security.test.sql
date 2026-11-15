-- =============================================================================
-- Tests de sécurité (pgTAP) — lancer avec : supabase test db
-- Chaque test se connecte comme un utilisateur et vérifie ce que la base accepte.
-- Tout est annulé à la fin (rollback).
-- =============================================================================
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(37);

-- -----------------------------------------------------------------------------
-- Comptes de test : alice, bob, carol, dave (dave ne partage rien avec personne)
-- -----------------------------------------------------------------------------
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

-- 1-2 : inscription ------------------------------------------------------------
select is(
  (select count(*)::int from public.profiles where username in ('alice', 'bob', 'carol', 'dave')),
  4, 'Un profil est créé par la base à chaque inscription');

select throws_ok(
  $$ insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data)
     values ('00000000-0000-0000-0000-000000000000', 'f0f00000-0000-0000-0000-000000000000',
             'authenticated', 'authenticated', 'copy@test.local', '{"username":"alice"}') $$,
  '23505', null, 'Un pseudo déjà pris fait échouer toute l''inscription (pas de compte orphelin)');

-- 3-4 : conversation privée sans doublon --------------------------------------
select pg_temp.login('a11ce000-0000-0000-0000-000000000000');
insert into ids values ('ab', public.get_or_create_direct_room('b0b00000-0000-0000-0000-000000000000'));
insert into public.messages (room_id, content) values ((select v from ids where k = 'ab'), 'salut bob');

select is(public.get_or_create_direct_room('b0b00000-0000-0000-0000-000000000000'),
          (select v from ids where k = 'ab'), 'Un second appel renvoie la même conversation');
select isnt_empty(
  $$ insert into public.messages (room_id, content) values ((select v from ids where k = 'ab'), 'relu aussitôt')
     returning id, content $$,
  'Un message inséré peut être relu dans la même requête (insert … returning, utilisé par le front)');

select pg_temp.login('b0b00000-0000-0000-0000-000000000000');
select is(public.get_or_create_direct_room('a11ce000-0000-0000-0000-000000000000'),
          (select v from ids where k = 'ab'), 'Dans l''autre sens aussi : une seule conversation par paire');

-- 5-9 : qui lit et qui écrit ---------------------------------------------------
select isnt_empty($$ select id from public.messages where content = 'salut bob' $$,
  'Bob lit les messages de sa conversation');

select pg_temp.login('da5e0000-0000-0000-0000-000000000000');
select is_empty($$ select id from public.messages where content = 'salut bob' $$,
  'Dave ne voit pas une conversation dont il n''est pas membre');

select throws_ok(
  $$ insert into public.messages (room_id, content) values ((select v from ids where k = 'ab'), 'intrusion') $$,
  '42501', null, 'Dave ne peut pas écrire dans une conversation dont il n''est pas membre');

select pg_temp.login('a11ce000-0000-0000-0000-000000000000');
select throws_ok(
  $$ insert into public.messages (room_id, user_id, content)
     values ((select v from ids where k = 'ab'), 'b0b00000-0000-0000-0000-000000000000', 'je suis bob') $$,
  '42501', null, 'Alice ne peut pas envoyer un message au nom de Bob');

select pg_temp.login('b0b00000-0000-0000-0000-000000000000');
select throws_ok(
  $$ update public.messages set content = 'falsifié' where content = 'salut bob' $$,
  '42501', null, 'Personne ne modifie un message directement (seulement via edit_message)');

-- 10 : is_blocked n'est jamais lisible ----------------------------------------
select throws_ok(
  $$ select is_blocked from public.messages $$,
  '42501', null, 'La colonne is_blocked est illisible pour les utilisateurs');

-- 11-12 : édition --------------------------------------------------------------
select throws_ok(
  $$ select public.edit_message((select id from public.messages where content = 'salut bob'), 'falsifié') $$,
  '42501', null, 'Bob ne peut pas modifier le message d''Alice');

select pg_temp.login('a11ce000-0000-0000-0000-000000000000');
select public.edit_message((select id from public.messages where content = 'salut bob'), 'salut Bob !');
select isnt(
  (select edited_at from public.messages where content = 'salut Bob !'), null,
  'Alice modifie son message, qui est marqué « modifié »');

-- 13-19 : blocage silencieux ----------------------------------------------------
select pg_temp.login('b0b00000-0000-0000-0000-000000000000');
insert into public.messages (room_id, content) values ((select v from ids where k = 'ab'), 'avant le blocage');

select pg_temp.login('a11ce000-0000-0000-0000-000000000000');
insert into public.blocks (blocked_id) values ('b0b00000-0000-0000-0000-000000000000');

select pg_temp.login('b0b00000-0000-0000-0000-000000000000');
select lives_ok(
  $$ insert into public.messages (room_id, content) values ((select v from ids where k = 'ab'), 'tu es là ?') $$,
  'Bob, bloqué, peut toujours envoyer (il ne doit rien remarquer)');
select isnt_empty($$ select id from public.messages where content = 'tu es là ?' $$,
  'Bob voit son propre message');
select is_empty($$ select * from public.blocks $$,
  'Bob ne peut pas voir qu''Alice l''a bloqué');

select pg_temp.login('a11ce000-0000-0000-0000-000000000000');
select is_empty($$ select id from public.messages where content = 'tu es là ?' $$,
  'Alice ne reçoit pas le message de Bob');
select throws_ok(
  $$ insert into public.messages (room_id, content) values ((select v from ids where k = 'ab'), 'coucou') $$,
  '42501', null, 'Alice ne peut plus écrire à Bob tant qu''elle le bloque');
select ok(not public.can_track_presence('room:' || (select v from ids where k = 'ab')),
  'Alice ne partage pas sa présence avec Bob (il ne la voit pas en ligne)');

-- Alice lit, débloque, relit.
select public.mark_room_read((select v from ids where k = 'ab'));
delete from public.blocks where blocked_id = 'b0b00000-0000-0000-0000-000000000000';
select public.mark_room_read((select v from ids where k = 'ab'));
select is_empty($$ select id from public.messages where content = 'tu es là ?' $$,
  'Après le déblocage, le message envoyé pendant le blocage reste caché');

-- 20-21 : accusés de lecture ---------------------------------------------------
select pg_temp.login('b0b00000-0000-0000-0000-000000000000');
select is(
  (select status from public.get_messages((select v from ids where k = 'ab')) where content = 'avant le blocage'),
  'read', 'Le message d''avant le blocage apparaît « lu »');
select is(
  (select status from public.get_messages((select v from ids where k = 'ab')) where content = 'tu es là ?'),
  'sent', 'Le message envoyé pendant le blocage ne passe jamais à « lu »');

-- 22-27 : groupes ----------------------------------------------------------------
select pg_temp.login('a11ce000-0000-0000-0000-000000000000');
insert into ids values ('g', public.create_group('Test', array['b0b00000-0000-0000-0000-000000000000', 'ca201000-0000-0000-0000-000000000000']::uuid[]));
insert into public.messages (room_id, content) values ((select v from ids where k = 'g'), 'ancien message');

-- Dans une transaction, now() ne bouge pas : on vieillit le message à la main.
reset role;
update public.messages set created_at = now() - interval '1 hour' where content = 'ancien message';

select pg_temp.login('b0b00000-0000-0000-0000-000000000000');
select throws_ok(
  $$ select public.add_members((select v from ids where k = 'g'), array['da5e0000-0000-0000-0000-000000000000']::uuid[]) $$,
  '42501', null, 'Un membre qui n''est pas admin ne peut pas ajouter de membres');

select pg_temp.login('a11ce000-0000-0000-0000-000000000000');
select lives_ok(
  $$ select public.add_members((select v from ids where k = 'g'), array['da5e0000-0000-0000-0000-000000000000']::uuid[]) $$,
  'L''admin ajoute Dave');

select pg_temp.login('da5e0000-0000-0000-0000-000000000000');
select is_empty($$ select id from public.messages where content = 'ancien message' $$,
  'Dave ne voit pas les messages envoyés avant son arrivée');
select throws_ok(
  $$ select public.get_or_create_direct_room('da5e0000-0000-0000-0000-000000000000') $$,
  '22023', null, 'On ne peut pas ouvrir une conversation avec soi-même');

select pg_temp.login('a11ce000-0000-0000-0000-000000000000');
select public.leave_room((select v from ids where k = 'g'));
reset role;
select is(
  (select count(*)::int from public.room_members where room_id = (select v from ids where k = 'g') and role = 'admin'),
  1, 'Quand le dernier admin part, un membre est promu automatiquement');
select is(
  (select user_id from public.room_members where room_id = (select v from ids where k = 'g') and role = 'admin'),
  'b0b00000-0000-0000-0000-000000000000'::uuid, 'Le membre promu est le plus ancien');

-- 28-30 : channels temps réel ---------------------------------------------------
select pg_temp.login('da5e0000-0000-0000-0000-000000000000');
select ok(not public.can_listen_topic('room:' || (select v from ids where k = 'ab')),
  'Dave ne peut pas écouter le channel d''une conversation privée');
select ok(not public.can_listen_topic('user:a11ce000-0000-0000-0000-000000000000'),
  'Dave ne peut pas écouter le channel personnel d''Alice');
select ok(public.can_listen_topic('user:da5e0000-0000-0000-0000-000000000000'),
  'Dave écoute son propre channel personnel');

-- 31-32 : Storage ----------------------------------------------------------------
select throws_ok(
  format($$ insert into storage.objects (bucket_id, name, owner_id) values ('attachments', '%s/intrus.png', auth.uid()::text) $$,
         (select v from ids where k = 'ab')),
  '42501', null, 'Dave ne peut pas déposer de fichier dans la conversation d''Alice et Bob');

select pg_temp.login('b0b00000-0000-0000-0000-000000000000');
select lives_ok(
  format($$ insert into storage.objects (bucket_id, name, owner_id) values ('attachments', '%s/photo.png', auth.uid()::text) $$,
         (select v from ids where k = 'ab')),
  'Bob dépose une pièce jointe dans sa conversation');

-- 33-34 : confidentialité du profil --------------------------------------------
select pg_temp.login('a11ce000-0000-0000-0000-000000000000');
update public.profiles set phone = '+33600000000' where id = 'a11ce000-0000-0000-0000-000000000000';

select pg_temp.login('b0b00000-0000-0000-0000-000000000000');
select throws_ok($$ select phone from public.profiles $$, '42501', null,
  'Le téléphone n''est pas lisible directement');
select is((select phone from public.get_profile('a11ce000-0000-0000-0000-000000000000')), '+33600000000',
  'Bob, qui partage une conversation avec Alice, voit son téléphone');

-- Disponibilité d'un pseudo (inscription et réglages)
select ok(not public.is_username_available('alice'), 'Un pseudo déjà pris est signalé indisponible');
select ok(public.is_username_available('nouveau.nom'), 'Un pseudo libre et valide est disponible');

select * from finish();
rollback;
