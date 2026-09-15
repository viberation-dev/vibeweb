-- profiles: column-level grants instead of table-wide ones.
--
-- Readable: every column except email. The signed-in user's own email comes
-- from auth.getUser(). Writable by the owner: the preference columns only.
--
-- `select *` on profiles now fails with 42501 for anon/authenticated, so
-- list columns (lib/queries/profiles.ts PUBLIC_COLUMNS).

revoke select, update on profiles from anon, authenticated;

grant select (id, username, plan, role_level, app_role, layout_mode,
              onboarding_completed, created_at, updated_at)
  on profiles to anon, authenticated;

grant update (username, role_level, layout_mode, onboarding_completed, updated_at)
  on profiles to authenticated;
