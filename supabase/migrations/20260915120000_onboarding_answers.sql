-- Onboarding answers (VIB-152).
--
-- A separate table rather than columns on `profiles`, because `profiles` is
-- `select using (true)` and granted to anon: anything added there is readable
-- by any visitor. How someone found us and what they do for a living is theirs,
-- not public profile data.
--
-- Allowed values are not constrained here. They are marketing answer lists
-- that will change, and zod (lib/validation/onboarding.ts) is the validation
-- boundary for every write; a check constraint would turn each wording change
-- into a migration.

create table onboarding_answers (
  user_id      uuid primary key references profiles(id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  usage        text,
  occupation   text,
  creating     text[] not null default '{}',
  discovery    text,
  updated_at   timestamptz not null default now()
);

alter table onboarding_answers enable row level security;

create policy onboarding_answers_select_own on onboarding_answers
  for select using (user_id = auth.uid());

create policy onboarding_answers_insert_own on onboarding_answers
  for insert with check (user_id = auth.uid());

create policy onboarding_answers_update_own on onboarding_answers
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Owner-scoped: nothing for anon (CLAUDE.md, migration 20). No delete — the
-- row goes with the profile.
grant select, insert, update on onboarding_answers to authenticated;
