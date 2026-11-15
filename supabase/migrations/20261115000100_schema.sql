-- =============================================================================
-- ChatMore — schéma de base
-- Nouveau départ : aucune reprise des anciennes tables (message, userHasRoom…).
-- =============================================================================

create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

create type public.room_type as enum ('direct', 'group');
create type public.member_role as enum ('admin', 'member');
create type public.attachment_kind as enum ('image', 'file', 'audio');
create type public.online_visibility as enum ('contacts', 'nobody');

-- -----------------------------------------------------------------------------
-- Profils (une ligne par compte, créée par le trigger handle_new_user)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  username      text not null unique
                check (username ~ '^[a-z0-9._]{3,24}$'),
  avatar_url    text,
  about         text not null default '' check (char_length(about) <= 140),
  phone         text check (phone is null or char_length(phone) <= 32),
  read_receipts boolean not null default true,
  show_online   public.online_visibility not null default 'contacts',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index profiles_username_trgm on public.profiles
  using gin (username extensions.gin_trgm_ops);

-- -----------------------------------------------------------------------------
-- Conversations
-- direct_key garantit une seule conversation privée par paire d'utilisateurs,
-- même si les deux personnes la créent au même instant.
-- -----------------------------------------------------------------------------
create table public.rooms (
  id              bigint generated always as identity primary key,
  type            public.room_type not null,
  name            text,
  avatar_url      text,
  direct_key      text unique,
  created_by      uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  last_message_at timestamptz,
  constraint rooms_direct_shape check (
    (type = 'direct' and direct_key is not null and name is null)
    or (type = 'group' and direct_key is null and char_length(name) between 1 and 40)
  )
);

create table public.room_members (
  room_id         bigint not null references public.rooms (id) on delete cascade,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  role            public.member_role not null default 'member',
  joined_at       timestamptz not null default now(),
  -- Privé : sert à compter mes non-lus.
  last_read_at    timestamptz not null default now(),
  -- Public : l'accusé de lecture que voient les autres (null si désactivé).
  read_receipt_at timestamptz,
  muted           boolean not null default false,
  primary key (room_id, user_id)
);

create index room_members_user_id on public.room_members (user_id);

-- -----------------------------------------------------------------------------
-- Messages
-- -----------------------------------------------------------------------------
create table public.messages (
  id          bigint generated always as identity primary key,
  room_id     bigint not null references public.rooms (id) on delete cascade,
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  content     text not null default '' check (char_length(content) <= 4000),
  reply_to_id bigint references public.messages (id) on delete set null,
  -- Identifiant généré par le client : affichage optimiste et dédoublonnage.
  client_id   uuid unique,
  -- Calculé par la base (trigger), jamais exposé au client.
  is_blocked  boolean not null default false,
  edited_at   timestamptz,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now()
);

-- Pagination par curseur (created_at, id) et dernier message d'une room.
create index messages_room_created on public.messages (room_id, created_at desc, id desc);
create index messages_reply_to on public.messages (reply_to_id) where reply_to_id is not null;

-- « Supprimer pour moi »
create table public.hidden_messages (
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  message_id bigint not null references public.messages (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, message_id)
);

create table public.message_attachments (
  id           bigint generated always as identity primary key,
  message_id   bigint not null references public.messages (id) on delete cascade,
  kind         public.attachment_kind not null,
  storage_path text not null unique,
  mime_type    text not null,
  size_bytes   integer not null check (size_bytes > 0),
  width        integer check (width > 0),
  height       integer check (height > 0),
  duration_ms  integer check (duration_ms > 0),
  created_at   timestamptz not null default now()
);

create index message_attachments_message on public.message_attachments (message_id);

-- Une réaction par personne et par message, comme WhatsApp.
create table public.message_reactions (
  message_id bigint not null references public.messages (id) on delete cascade,
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  emoji      text not null check (char_length(emoji) between 1 and 16),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id)
);

-- -----------------------------------------------------------------------------
-- Blocages : par personne. N'ont d'effet que dans les conversations privées.
-- -----------------------------------------------------------------------------
create table public.blocks (
  blocker_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create index blocks_blocked on public.blocks (blocked_id);
