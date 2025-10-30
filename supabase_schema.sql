-- Supabase schema for FlowChat
create table if not exists users (
  id uuid references auth.users on delete cascade primary key,
  username text,
  avatar_url text,
  is_verified boolean default false,
  verified_until timestamptz,
  status text default 'online',
  created_at timestamptz default now()
);

create table if not exists chats (
  id bigserial primary key,
  name text,
  type text, -- 'dm' or 'group'
  participants uuid[] default array[]::uuid[],
  created_at timestamptz default now()
);

create table if not exists messages (
  id bigserial primary key,
  chat_id bigint references chats(id) on delete cascade,
  user_id uuid references auth.users(id),
  content text,
  image_url text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table users enable row level security;
alter table messages enable row level security;

-- Policies
create policy "users_read" on users for select using (true);
create policy "users_update_own" on users for update using (auth.uid() = id);

create policy "messages_read" on messages for select using (true);
create policy "messages_insert_own" on messages for insert with check (auth.uid() = user_id);
