begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(6);

insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000000', 'a11ce000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alice@test.local', '{"username":"alice"}'),
  ('00000000-0000-0000-0000-000000000000', 'b0b00000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bob@test.local',   '{"username":"bob"}');

create function pg_temp.login(p_user uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  select set_config('role', 'authenticated', true);
$$;

select pg_temp.login('b0b00000-0000-0000-0000-000000000000');
select public.register_push_subscription('https://push.example/bob', 'cle', 'secret');

select pg_temp.login('a11ce000-0000-0000-0000-000000000000');
select is_empty($$ select id, endpoint from public.push_subscriptions $$, 'Alice ne voit pas les appareils de Bob');
select throws_ok($$ select p256dh from public.push_subscriptions $$, '42501', null,
  'Les clés de chiffrement d''un abonnement ne sont jamais lisibles');
select throws_ok($$ select * from public.push_targets(1) $$, '42501', null,
  'Seule l''Edge Function (clé service) obtient la liste des destinataires');

select public.register_push_subscription('https://push.example/bob', 'cle-alice', 'secret-alice');
reset role;
select is((select user_id from public.push_subscriptions where endpoint = 'https://push.example/bob'),
  'a11ce000-0000-0000-0000-000000000000'::uuid,
  'Un navigateur qui change de compte : l''abonnement suit le dernier utilisateur');

create temp table ids (k text primary key, v bigint);
grant all on ids to authenticated;
select pg_temp.login('a11ce000-0000-0000-0000-000000000000');
insert into ids values ('ab', public.get_or_create_direct_room('b0b00000-0000-0000-0000-000000000000'));
insert into public.messages (room_id, content) values ((select v from ids where k = 'ab'), 'Coucou');
reset role;
set local role service_role;
select is((select count(*)::int from public.push_targets((select max(id) from public.messages))), 0,
  'L''auteur n''est pas notifié de son propre message, Bob n''a plus d''appareil');
reset role;

select pg_temp.login('b0b00000-0000-0000-0000-000000000000');
select public.register_push_subscription('https://push.example/bob-2', 'cle', 'secret');
reset role;
set local role service_role;
select is((select title from public.push_targets((select max(id) from public.messages))), 'alice',
  'Bob est notifié, avec le nom de l''auteur');

select * from finish();
rollback;
