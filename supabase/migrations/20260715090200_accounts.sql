-- Viberation MVP schema — 02: accounts (profiles) + helper + RLS

-- profiles extends Supabase auth.users (1:1, shared id)
create table profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  email                text,
  username             text unique,
  plan                 user_plan   not null default 'free',
  role_level           role_level  not null default 'beginner',
  app_role             app_role    not null default 'member',
  layout_mode          layout_mode not null default 'essentials',
  onboarding_completed boolean     not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Helper: is the current user staff (admin or super_admin)?
create or replace function is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and app_role in ('admin','super_admin')
  );
$$;

-- RLS
alter table profiles enable row level security;

-- Anyone can read basic profile info (usernames appear on content, reviews, etc.)
create policy profiles_select_all on profiles
  for select using (true);

-- A user can update only their own profile (but NOT their own app_role — enforced below)
create policy profiles_update_own on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Prevent privilege escalation: block self-elevation of app_role.
-- (Role changes are performed by super_admin via a SECURITY DEFINER RPC, added later.)
create or replace function guard_app_role()
returns trigger language plpgsql as $$
begin
  if new.app_role <> old.app_role and not is_staff() then
    raise exception 'app_role can only be changed by staff';
  end if;
  return new;
end; $$;

create trigger profiles_guard_app_role
  before update on profiles
  for each row execute function guard_app_role();
