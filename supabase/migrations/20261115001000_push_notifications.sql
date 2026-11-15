-- Notifications push : abonnements par appareil, envoi par l'Edge Function send-push.
-- Configuration (Vault) : push_function_url et push_webhook_secret, voir supabase/seed.sql.

create extension if not exists pg_net with schema extensions;

alter table public.profiles add column notification_preview boolean not null default true;
grant update (notification_preview) on public.profiles to authenticated;

drop function public.get_profile(uuid);
create function public.get_profile(p_user_id uuid)
returns table (
  id uuid, username text, avatar_url text, about text, phone text,
  read_receipts boolean, show_online public.online_visibility, notification_preview boolean
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
         case when p.id = (select auth.uid()) then p.show_online end,
         case when p.id = (select auth.uid()) then p.notification_preview end
  from public.profiles p
  where p.id = p_user_id and (select auth.uid()) is not null;
$$;
grant execute on function public.get_profile(uuid) to authenticated;

create table public.push_subscriptions (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  endpoint   text not null unique check (endpoint ~ '^https?://'),
  p256dh     text not null,
  auth       text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;
grant select (id, endpoint, user_agent, created_at), delete on public.push_subscriptions to authenticated;

create policy "users see their devices"
  on public.push_subscriptions for select to authenticated
  using (user_id = (select auth.uid()));

create policy "users remove their devices"
  on public.push_subscriptions for delete to authenticated
  using (user_id = (select auth.uid()));

-- Un même navigateur peut changer de compte : l'abonnement suit le dernier utilisateur connecté.
create function public.register_push_subscription(p_endpoint text, p_p256dh text, p_auth text, p_user_agent text default null)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  insert into public.push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
  values ((select auth.uid()), p_endpoint, p_p256dh, p_auth, left(p_user_agent, 200))
  on conflict (endpoint) do update
    set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth,
        user_agent = excluded.user_agent, created_at = now();
end;
$$;

grant execute on function public.register_push_subscription(text, text, text, text) to authenticated;

-- Appelée par l'Edge Function (clé service) : qui prévenir, et avec quel texte.
create function public.push_targets(p_message_id bigint)
returns table (subscription_id bigint, endpoint text, p256dh text, auth text, room_id bigint, title text, body text)
language sql stable security definer set search_path = ''
as $$
  select s.id, s.endpoint, s.p256dh, s.auth, m.room_id,
         case when r.type = 'group' then r.name || ' · ' || author.username else author.username end,
         case
           when not recipient.notification_preview then 'Nouveau message'
           when m.content <> '' then left(m.content, 180)
           when exists (select 1 from public.message_attachments a where a.message_id = m.id) then 'Photo'
           else 'Nouveau message'
         end
  from public.messages m
  join public.rooms r on r.id = m.room_id
  join public.profiles author on author.id = m.user_id
  join public.room_members rm on rm.room_id = m.room_id and rm.user_id <> m.user_id and not rm.muted
  join public.profiles recipient on recipient.id = rm.user_id
  join public.push_subscriptions s on s.user_id = rm.user_id
  where m.id = p_message_id and not m.is_blocked and m.deleted_at is null and m.created_at >= rm.joined_at;
$$;

revoke execute on function public.push_targets(bigint) from public, anon, authenticated;
grant execute on function public.push_targets(bigint) to service_role;
grant delete on public.push_subscriptions to service_role;

create function public.request_push()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_url text;
  v_secret text;
begin
  if new.is_blocked then
    return null;
  end if;
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'push_function_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'push_webhook_secret';
  if v_url is null or v_secret is null then
    return null;
  end if;
  perform net.http_post(
    url := v_url,
    body := jsonb_build_object('message_id', new.id),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', v_secret)
  );
  return null;
end;
$$;

-- Après l'insertion de la pièce jointe pour un message avec image (send_attachment, transfert) :
-- on attend la fin de la transaction, l'appel HTTP de pg_net est lui-même différé.
create trigger messages_request_push
  after insert on public.messages
  for each row execute function public.request_push();
