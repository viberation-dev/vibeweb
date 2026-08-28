-- VIB-59: give `content` a draft state.
--
-- `content` shipped with no status column and a `for select using (true)`
-- read policy (migration 03), so a row is live the instant it exists — there
-- is no way to write an article without publishing it as you type. That makes
-- an authoring UI unbuildable, which is why this lands before one.
--
-- `wizards` already models this correctly (migration 04: `status
-- wizard_status not null default 'draft'`, read `using (status = 'published'
-- or is_staff())`). This mirrors that rather than inventing a second pattern.
-- A separate enum, not a reuse of `wizard_status`, because a column on
-- `content` typed `wizard_status` would be confusing forever to save one
-- create type.

create type content_status as enum ('draft', 'published');

alter table content
  add column status content_status not null default 'draft';

-- Everything already in the table was publicly visible before this migration
-- ran, so it has to stay visible. Without this backfill every seeded Learn
-- article silently disappears from the site the moment the policy below
-- changes — the migration would look successful and quietly empty /learn.
--
-- Runs before the policy swap on purpose: no window exists where published
-- content is hidden.
update content set status = 'published';

-- Drafts are visible to staff only; everyone else sees published rows.
-- `is_staff()` is the same function every other staff policy uses (migration
-- 02), so a draft is readable by admin and super_admin and nobody else.
drop policy content_read on content;

create policy content_read on content
  for select using (status = 'published' or is_staff());
