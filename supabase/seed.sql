-- Données de démo (supabase db reset). Mot de passe de tous les comptes : chatmore2026
--   demo@chatmore.local    @demo
--   lea@chatmore.local     @lea.martin
--   karim@chatmore.local   @karim.b
--   ines@chatmore.local    @ines.roux
--   thomas@chatmore.local  @thomas.d

create or replace function pg_temp.seed_user(p_id uuid, p_email text, p_username text)
returns void
language plpgsql
as $$
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) values (
    '00000000-0000-0000-0000-000000000000', p_id, 'authenticated', 'authenticated', p_email,
    extensions.crypt('chatmore2026', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', jsonb_build_object('username', p_username),
    now(), now(), '', '', '', ''
  );

  insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), p_id, p_id::text, 'email',
    jsonb_build_object('sub', p_id::text, 'email', p_email, 'email_verified', true),
    now(), now(), now()
  );
end;
$$;

select pg_temp.seed_user('00000000-0000-0000-0000-00000000d3e0', 'demo@chatmore.local',   'demo');
select pg_temp.seed_user('00000000-0000-0000-0000-0000000001ea', 'lea@chatmore.local',    'lea.martin');
select pg_temp.seed_user('00000000-0000-0000-0000-00000000ca71', 'karim@chatmore.local',  'karim.b');
select pg_temp.seed_user('00000000-0000-0000-0000-0000000001e5', 'ines@chatmore.local',   'ines.roux');
select pg_temp.seed_user('00000000-0000-0000-0000-000000007a0d', 'thomas@chatmore.local', 'thomas.d');

update public.profiles set about = 'Toujours partante pour visiter un appart.' where username = 'lea.martin';
update public.profiles set about = 'Supporter depuis 1998. Partant pour un match.' where username = 'karim.b';

-- Conversations : identifiants fixes pour des URL stables en local (/chat/1, /chat/2…).
insert into public.rooms (id, type, name, direct_key, created_by, created_at)
overriding system value
values
  (1, 'direct', null, '00000000-0000-0000-0000-0000000001ea:00000000-0000-0000-0000-00000000d3e0',
      '00000000-0000-0000-0000-00000000d3e0', now() - interval '3 days'),
  (2, 'direct', null, '00000000-0000-0000-0000-00000000ca71:00000000-0000-0000-0000-00000000d3e0',
      '00000000-0000-0000-0000-00000000ca71', now() - interval '10 days'),
  (3, 'group', 'Coloc'' Oberkampf', null,
      '00000000-0000-0000-0000-00000000ca71', now() - interval '20 days');

select setval(pg_get_serial_sequence('public.rooms', 'id'), 3);

insert into public.room_members (room_id, user_id, role, joined_at, last_read_at, read_receipt_at) values
  (1, '00000000-0000-0000-0000-00000000d3e0', 'member', now() - interval '3 days', now() - interval '1 hour', now() - interval '1 hour'),
  (1, '00000000-0000-0000-0000-0000000001ea', 'member', now() - interval '3 days', now(), now()),
  (2, '00000000-0000-0000-0000-00000000d3e0', 'member', now() - interval '10 days', now(), now()),
  (2, '00000000-0000-0000-0000-00000000ca71', 'member', now() - interval '10 days', now(), now()),
  (3, '00000000-0000-0000-0000-00000000ca71', 'admin',  now() - interval '20 days', now(), now()),
  (3, '00000000-0000-0000-0000-00000000d3e0', 'admin',  now() - interval '20 days', now() - interval '2 hours', now() - interval '2 hours'),
  (3, '00000000-0000-0000-0000-0000000001e5', 'member', now() - interval '20 days', now(), now());

-- Messages (auth.uid() est nul ici : le trigger garde l'auteur et la date fournis).
insert into public.messages (room_id, user_id, content, created_at) values
  (1, '00000000-0000-0000-0000-0000000001ea', 'Tu as pu regarder l''appart de la rue Caulaincourt ?', now() - interval '1 day 2 hours'),
  (1, '00000000-0000-0000-0000-00000000d3e0', 'Oui ! Lumineux, mais la cuisine est minuscule', now() - interval '1 day 1 hour'),
  (1, '00000000-0000-0000-0000-0000000001ea', 'Bon, j''ai rappelé l''agence', now() - interval '40 minutes'),
  (1, '00000000-0000-0000-0000-0000000001ea', 'Visite possible demain à 18h', now() - interval '39 minutes'),
  (1, '00000000-0000-0000-0000-0000000001ea', 'Ça te va ?', now() - interval '38 minutes'),
  (2, '00000000-0000-0000-0000-00000000ca71', 'Tu viens au match dimanche ?', now() - interval '7 days'),
  (2, '00000000-0000-0000-0000-00000000d3e0', 'Grave ! C''est à quelle heure ?', now() - interval '7 days' + interval '3 minutes'),
  (2, '00000000-0000-0000-0000-00000000ca71', 'Coup d''envoi 15h. Rdv 14h devant chez moi', now() - interval '7 days' + interval '7 minutes'),
  (3, '00000000-0000-0000-0000-00000000ca71', 'Facture d''électricité reçue : 86,40 €', now() - interval '3 hours'),
  (3, '00000000-0000-0000-0000-00000000ca71', 'Je l''ai payée, chacun me doit 28,80 €', now() - interval '3 hours' + interval '1 minute'),
  (3, '00000000-0000-0000-0000-0000000001e5', 'Merci ! Je te fais le virement', now() - interval '2 hours 50 minutes');

-- Réponse à un message
insert into public.messages (room_id, user_id, content, reply_to_id, created_at)
select 1, '00000000-0000-0000-0000-00000000d3e0', 'Parfait, on se retrouve devant à 17h50 ?', id, now() - interval '30 minutes'
from public.messages where content = 'Visite possible demain à 18h';

insert into public.message_reactions (message_id, user_id, emoji)
select id, '00000000-0000-0000-0000-00000000d3e0', '❤️' from public.messages where content = 'Ça te va ?';

-- Notifications push en local : l'Edge Function est joignable depuis la base via la passerelle Kong.
select vault.create_secret('http://kong:8000/functions/v1/send-push', 'push_function_url');
select vault.create_secret('local-push-secret', 'push_webhook_secret');
