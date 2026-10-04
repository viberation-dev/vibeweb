-- Daily digest of new members (VIB-236).
--
-- Nothing told staff when someone joined. Comments already do, one email each
-- and immediately (VIB-205); signups had no equivalent, and Ali asked for one
-- mail a day rather than one per event.
--
-- Same arrangement as the welcome sequence (VIB-155): the cron runs with no
-- user session, and this app deliberately holds no Supabase secret key, so
-- `profiles` is read through a security-definer function and the secret is
-- the gate. A leaked secret exposes one day of signups, not the database.
--
-- It reuses the `welcome_cron` secret rather than adding a second row. That
-- row holds Vercel's CRON_SECRET, and both daily jobs are authenticated by
-- the same header from the same scheduler — two names for one value would be
-- two things to rotate.
--
-- APPLIED 2026-10-04 ahead of the deploy. Creating a function nothing calls
-- yet cannot affect the running build, and the filename carries the version
-- the remote recorded so `supabase db push` sees it as done.
--
-- Read-only, so it is not a "claim": nothing is advanced or marked sent, and
-- running it twice is harmless.

create or replace function public.new_members_for_digest(p_secret text)
returns table (
  user_id    uuid,
  email      text,
  username   text,
  role_level role_level,
  created_at timestamptz
)
language plpgsql security definer set search_path = public, extensions as $$
#variable_conflict use_column
declare
  expected text;
begin
  select value into expected from private.app_secrets where name = 'welcome_cron';
  if expected is null or p_secret is null or p_secret <> expected then
    raise exception 'not authorised' using errcode = '42501';
  end if;

  /*
   * 25 hours, not 24. The window is stateless — there is no "last digest
   * sent at" to keep correct — so the only question is which way to be wrong
   * when the cron fires a little late. A 24-hour window drops a signup; 25
   * repeats one in an informational email. Repeating is the harmless one.
   */
  return query
  select p.id, p.email, p.username, p.role_level, p.created_at
  from profiles p
  where p.created_at > now() - interval '25 hours'
  order by p.created_at;
end;
$$;

revoke all on function public.new_members_for_digest(text) from public;
-- anon because the cron has no session; the secret is the gate.
grant execute on function public.new_members_for_digest(text) to anon, authenticated;
