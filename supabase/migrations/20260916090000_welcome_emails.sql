-- Welcome email sequence (VIB-155).
--
-- Four emails: day 0 on first confirmed sign-in, then days 2, 5 and 10 from a
-- daily cron. The cron runs with no user session, and this app deliberately
-- holds no Supabase secret key (.env.example). So nothing here is granted to
-- a role directly. Access goes through three security-definer functions, each
-- doing exactly one job:
--
--   start_welcome_emails()           signed-in user, own row only
--   claim_welcome_emails(secret)     cron; returns who is due and advances them
--   unsubscribe_welcome_emails(...)  anyone holding a valid signed link
--
-- A leaked cron secret exposes the due list for one run, not the database.

-- ---------------------------------------------------------------------------
-- Secrets live in a schema the Data API does not expose.
-- ---------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.app_secrets (
  name  text primary key,
  value text not null
);
revoke all on private.app_secrets from public, anon, authenticated;

-- The unsubscribe signing key never needs to leave the database, so it is
-- generated here at apply time rather than written into this public repo.
insert into private.app_secrets (name, value)
values ('welcome_unsubscribe', encode(gen_random_bytes(32), 'hex'))
on conflict (name) do nothing;

-- The cron secret must match CRON_SECRET in Vercel, so it is set by hand:
--   insert into private.app_secrets (name, value) values ('welcome_cron', '<CRON_SECRET>')
--   on conflict (name) do update set value = excluded.value;

-- ---------------------------------------------------------------------------
-- Progress per member.
-- ---------------------------------------------------------------------------
create table welcome_emails (
  user_id         uuid primary key references profiles(id) on delete cascade,
  -- Highest email sent, 1-4. The row is created as email 1 goes out.
  last_step       smallint    not null check (last_step between 1 and 4),
  next_send_at    timestamptz,
  unsubscribed_at timestamptz,
  created_at      timestamptz not null default now()
);

-- RLS on and no policies, no grants: only the functions below touch it.
alter table welcome_emails enable row level security;

-- Everyone who signed up before this shipped has had their welcome already,
-- in the sense that matters: nobody should get a "welcome" weeks late.
insert into welcome_emails (user_id, last_step, next_send_at)
select id, 4, null from profiles
on conflict (user_id) do nothing;

create or replace function private.welcome_signature(p_user uuid)
returns text language sql stable security definer set search_path = public, extensions as $$
  select encode(
    hmac(p_user::text, (select value from private.app_secrets where name = 'welcome_unsubscribe'), 'sha256'),
    'hex'
  );
$$;
revoke all on function private.welcome_signature(uuid) from public, anon, authenticated;

-- Days after the first email that each later step is due.
create or replace function private.welcome_offset(p_step smallint)
returns interval language sql immutable as $$
  select case p_step when 2 then interval '2 days'
                     when 3 then interval '5 days'
                     when 4 then interval '10 days' end;
$$;

-- ---------------------------------------------------------------------------
-- Day 0. Called by the app right after a confirmed sign-in.
-- Returns one row (the unsubscribe signature) only when this call started the
-- sequence, so a second sign-in or an existing member sends nothing.
-- ---------------------------------------------------------------------------
create or replace function public.start_welcome_emails()
returns table (unsubscribe_sig text)
language plpgsql security definer set search_path = public, extensions as $$
begin
  if auth.uid() is null then
    return;
  end if;

  -- An unconfirmed address is not someone we should be emailing yet.
  if not exists (select 1 from auth.users where id = auth.uid() and email_confirmed_at is not null) then
    return;
  end if;

  insert into welcome_emails (user_id, last_step, next_send_at)
  values (auth.uid(), 1, now() + private.welcome_offset(2::smallint))
  on conflict (user_id) do nothing;

  if found then
    return query select private.welcome_signature(auth.uid());
  end if;
end;
$$;
revoke all on function public.start_welcome_emails() from public, anon;
grant execute on function public.start_welcome_emails() to authenticated;

-- ---------------------------------------------------------------------------
-- Days 2, 5, 10. Called once a day by the cron route.
-- Claims and advances in one statement, so a retried or overlapping run
-- cannot send the same step twice. The email may then fail to send; that is
-- logged by the caller and not retried, which beats a duplicate.
-- ---------------------------------------------------------------------------
create or replace function public.claim_welcome_emails(p_secret text, p_limit int default 90)
returns table (
  user_id         uuid,
  email           text,
  step            smallint,
  role_level      role_level,
  display_name    text,
  creating        text[],
  unsubscribe_sig text
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

  return query
  with due as (
    select w.user_id
    from welcome_emails w
    where w.unsubscribed_at is null
      and w.last_step < 4
      and w.next_send_at <= now()
    order by w.next_send_at
    limit least(greatest(p_limit, 0), 90)
    for update skip locked
  ),
  advanced as (
    update welcome_emails w
    set last_step    = w.last_step + 1,
        next_send_at = case when w.last_step + 1 < 4
                            then w.created_at + private.welcome_offset((w.last_step + 2)::smallint)
                       end
    from due
    where w.user_id = due.user_id
    returning w.user_id, w.last_step
  )
  select a.user_id, p.email, a.last_step, p.role_level, o.display_name,
         coalesce(o.creating, '{}'), private.welcome_signature(a.user_id)
  from advanced a
  join profiles p on p.id = a.user_id
  left join onboarding_answers o on o.user_id = a.user_id
  where p.email is not null;
end;
$$;
revoke all on function public.claim_welcome_emails(text, int) from public;
-- anon because the cron has no session; the secret is the gate.
grant execute on function public.claim_welcome_emails(text, int) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Unsubscribe from a signed link. True when the signature was valid.
-- ---------------------------------------------------------------------------
create or replace function public.unsubscribe_welcome_emails(p_user uuid, p_sig text)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  if p_sig is null or p_sig <> private.welcome_signature(p_user) then
    return false;
  end if;

  update welcome_emails set unsubscribed_at = coalesce(unsubscribed_at, now())
  where user_id = p_user;
  return true;
end;
$$;
revoke all on function public.unsubscribe_welcome_emails(uuid, text) from public;
grant execute on function public.unsubscribe_welcome_emails(uuid, text) to anon, authenticated;
