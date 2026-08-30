-- Viberation MVP schema — 15: super_admin role-change RPC (VIB-58)
--
-- Migration 02 left an IOU in a comment above guard_app_role():
--   "(Role changes are performed by super_admin via a SECURITY DEFINER RPC,
--    added later.)"
-- This is that RPC. The trigger stays exactly as it is; this function is the
-- one trusted path that satisfies it.
--
-- Why definer at all, given the trigger already calls is_staff() on the
-- caller: RLS on profiles only permits updating your own row, so no staff
-- member can write anyone else's app_role without it. Definer buys the write;
-- the checks below — not the trigger — are what decide who may do it.
--
-- super_admin, not is_staff(): an admin that can mint admins is the same
-- privilege as super_admin with extra steps.
--
-- Bootstrap is still manual and still by hand, on purpose. There is no
-- super_admin yet, so the first one is minted with the guard temporarily off.
-- Note VIB-58's recipe does not work here: `set session_replication_role`
-- is superuser-only and Supabase's postgres role is not superuser
-- ("permission denied to set parameter"). What works, as table owner:
--
--   alter table profiles disable trigger profiles_guard_app_role;
--   update profiles set app_role = 'super_admin' where email = '...';
--   alter table profiles enable trigger profiles_guard_app_role;
--
-- That is a once-per-project operation; this RPC exists so the second, third
-- and fourth staff member never need it.
--
-- Check: supabase/tests/set_app_role_test.sql (seven cases, rolls itself back).

create or replace function set_app_role(target_user uuid, new_role app_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  old_role app_role;
begin
  if not exists (
    select 1 from profiles where id = auth.uid() and app_role = 'super_admin'
  ) then
    raise exception 'only super_admin can change app_role' using errcode = '42501';
  end if;

  select app_role into old_role from profiles where id = target_user;
  if not found then
    raise exception 'no profile with id %', target_user using errcode = 'P0002';
  end if;
  if old_role = new_role then
    return;  -- no-op, not an error: makes the call idempotent
  end if;

  -- Never let the project lock itself out. The FOR UPDATE is what makes this
  -- safe under two concurrent demotions: it serializes them, and in READ
  -- COMMITTED the second transaction re-checks the qualifier against the
  -- freshly committed row, so an already-demoted super_admin drops out of the
  -- count instead of being double-counted.
  if old_role = 'super_admin' and new_role <> 'super_admin' and (
    select count(*) from (
      select 1 from profiles where app_role = 'super_admin' for update
    ) still_super
  ) <= 1 then
    raise exception 'cannot demote the last super_admin' using errcode = '42501';
  end if;

  update profiles set app_role = new_role, updated_at = now() where id = target_user;
end; $$;

-- anon has no uid and could never pass the check, but the grant is what the
-- security linter reads, so state the intended caller explicitly.
revoke all on function set_app_role(uuid, app_role) from public, anon;
grant execute on function set_app_role(uuid, app_role) to authenticated;
