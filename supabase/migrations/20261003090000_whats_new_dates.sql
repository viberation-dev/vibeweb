-- What's new: publish dates and a deliberate revision signal (VIB-230).
--
-- Three problems, one migration.
--
-- 1. `content.created_at` is the *authoring* date. A guide row is inserted by
--    one migration and published by a later one — the seven Extend guides
--    (VIB-223..229) each landed that way — so created_at mis-dates the whole
--    Learn library. `published_at` records when it actually went live.
--
-- 2. `updated_at` cannot say "this was updated" in any sense a reader cares
--    about. 28 migrations in this repo set it explicitly, and two from
--    2026-10-02 were a factual typo fix and a tab reorder. Sorting a public
--    stream on it would put "fixed a typo" above "published a new guide" and
--    keep it there. There is no threshold that separates the two, because the
--    column records that a row was written, not what changed. So the revision
--    signal is deliberate: `revised_at` is null unless somebody decided the
--    change was worth telling a reader about, and `revision_note` says what
--    changed in one line.
--
-- 3. supabase-js `.order()` takes a column, not an expression, so "order by
--    whichever of two dates is later" has nowhere to live at query time.
--    `surfaced_at` is that expression, stored and indexed.

-- ── content.published_at ──────────────────────────────────────────────────
alter table content add column published_at timestamptz;

comment on column content.published_at is
  'When the row went live, set by trigger on draft -> published (VIB-230). Null while draft. Not created_at, which is the authoring date.';

/*
 * Backfill. `updated_at` is the best available evidence for rows already
 * published and is wrong wherever a published row was edited later — stated
 * plainly rather than papered over. New rows get it from the trigger and are
 * exact.
 */
update content
set published_at = coalesce(updated_at, created_at)
where status = 'published' and published_at is null;

create or replace function set_content_published_at()
returns trigger
language plpgsql
-- No search_path games: this function references only `new`, but the empty
-- search_path is the house style for security definer-adjacent code.
set search_path = ''
as $$
begin
  if new.status = 'published' and old.status is distinct from 'published' then
    new.published_at := now();
  elsif new.status = 'draft' then
    -- Unpublishing must remove it from the stream, not leave it dated.
    new.published_at := null;
  end if;
  return new;
end;
$$;

create trigger content_published_at
  before update of status on content
  for each row
  execute function set_content_published_at();

-- An insert that is already published needs the same stamp.
create trigger content_published_at_insert
  before insert on content
  for each row
  when (new.status = 'published')
  execute function set_content_published_at();

-- ── the revision signal, on both tables ───────────────────────────────────
alter table tools
  add column revised_at timestamptz,
  add column revision_note text;

alter table content
  add column revised_at timestamptz,
  add column revision_note text;

/*
 * The pair is all-or-nothing. A stream entry that says only "Updated" tells a
 * reader nothing, so a revision without a note is a mistake worth rejecting
 * at the boundary rather than rendering as a blank line.
 */
alter table tools add constraint tools_revision_pair
  check ((revised_at is null) = (revision_note is null));

alter table content add constraint content_revision_pair
  check ((revised_at is null) = (revision_note is null));

comment on column tools.revised_at is
  'Set only when a change is worth announcing (VIB-230). Null for a typo, a tag reorder, a badge change. Never derived from updated_at.';
comment on column tools.revision_note is
  'One line, plain language, no issue IDs: "Added Opus 5.5 pricing". Required whenever revised_at is set.';
comment on column content.revised_at is
  'Set only when a change is worth announcing (VIB-230). Null for a typo or a formatting fix. Never derived from updated_at.';
comment on column content.revision_note is
  'One line, plain language, no issue IDs. Required whenever revised_at is set.';

-- ── surfaced_at: the stream's sort key ────────────────────────────────────
/*
 * `greatest` ignores nulls, so a tool always has one and a draft's is null —
 * which keeps drafts out of the stream by construction rather than by a
 * filter somebody has to remember to write.
 */
alter table tools add column surfaced_at timestamptz
  generated always as (greatest(revised_at, created_at)) stored;

alter table content add column surfaced_at timestamptz
  generated always as (greatest(revised_at, published_at)) stored;

comment on column tools.surfaced_at is
  'Sort key for the What''s new stream (VIB-230): the revision date if there is one, else when it was added.';
comment on column content.surfaced_at is
  'Sort key for the What''s new stream (VIB-230): the revision date if there is one, else the publish date. Null while draft, which excludes it.';

create index tools_surfaced_at_idx on tools (surfaced_at desc nulls last);
create index content_surfaced_at_idx on content (surfaced_at desc nulls last);
