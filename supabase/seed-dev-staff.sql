-- ============================================================================
-- LOCAL DEVELOPMENT ONLY (VIB-128)
--
-- Seeds one staff account into the *local* stack so gated screens (/admin and
-- the member screens) can actually be opened while working on them. Before
-- this, anything behind a session shipped on typecheck and a build alone.
--
-- Deliberately NOT part of seed.sql. `supabase db reset` runs the seed list,
-- and pointing that at a linked project would run whatever is in it; keeping
-- this file separate means the shared project can never gain this account by
-- accident. It is listed in config.toml's seed paths, which only the local
-- stack uses.
--
-- The account has NO PASSWORD. Sign in with `npm run dev:login`, which mints a
-- one-time link through the local service-role key. That keeps a password out
-- of the repo, out of the database and out of anyone's hands.
-- ============================================================================

-- A fixed uuid, so the link script and this seed agree without a lookup.
--
-- The empty strings are not padding: GoTrue reads those token columns as plain
-- Go strings and fails with "Database error finding user" when they are NULL,
-- which is what a hand-written auth.users row gets. Empty string is what its
-- own signup path writes.
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new,
  email_change_token_current,
  phone_change_token,
  reauthentication_token
)
values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'staff@local.test',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  '',
  '',
  '',
  ''
)
on conflict (id) do nothing;

-- GoTrue expects an identity row per provider; without it the email provider
-- has nothing to match and link generation fails.
insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
values (
  gen_random_uuid(),
  '00000000-0000-4000-8000-000000000001',
  '{"sub":"00000000-0000-4000-8000-000000000001","email":"staff@local.test","email_verified":true}'::jsonb,
  'email',
  '00000000-0000-4000-8000-000000000001',
  now(),
  now(),
  now()
)
on conflict (provider, provider_id) do nothing;

-- handle_new_user() already created the profile row from the insert above.
-- The non-role fields are an ordinary update.
update profiles
set
  username = 'localstaff',
  role_level = 'expert',
  onboarding_completed = true
where id = '00000000-0000-4000-8000-000000000001';

-- app_role is guarded by profiles_guard_app_role, so a plain update fails with
-- "app_role can only be changed by staff". Migration 15 (set_app_role_rpc)
-- documents the one sanctioned way to mint the *first* staff member, as the
-- table owner, and this is it verbatim. Everyone after them goes through the
-- set_app_role RPC instead; there is nobody here to call it.
--
-- super_admin rather than admin, so the local account can exercise that RPC
-- and the role-change paths as well as the staff screens.
alter table profiles disable trigger profiles_guard_app_role;

update profiles
set app_role = 'super_admin'
where id = '00000000-0000-4000-8000-000000000001';

alter table profiles enable trigger profiles_guard_app_role;
