-- Viberation MVP schema — 08: tools.bookmark_count stays in step with bookmarks
--
-- NOTE ON NUMBERING: this landed before the tsvector search migration, which
-- §33 and VIB-47 still call "07"/"08". Files are ordered by timestamp, not by
-- the number in the comment — the number is prose, the timestamp is the
-- contract. Search is now 09.
--
-- tools.bookmark_count has existed since migration 03 with nothing keeping it
-- true. A trigger rather than app code, for two reasons:
--
--  1. `tools` is public-read / staff-write under migration 03's RLS, so a
--     member bookmarking a tool cannot update the row from the client at all.
--  2. Any app-side counter drifts the moment a row is inserted from anywhere
--     else — the seed, SQL console, a future import. The count is a fact about
--     the bookmarks table, so the bookmarks table is what maintains it.

create or replace function sync_tool_bookmark_count()
returns trigger
language plpgsql
security definer
-- Pinning search_path is what stops a caller-controlled schema from
-- shadowing `tools` inside a definer function.
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.target_type = 'tool' then
    update tools set bookmark_count = bookmark_count + 1 where id = new.target_id;
  elsif tg_op = 'DELETE' and old.target_type = 'tool' then
    -- greatest() keeps a double-delete or a hand-fixed row from going negative.
    update tools set bookmark_count = greatest(0, bookmark_count - 1) where id = old.target_id;
  end if;
  return null;
end; $$;

comment on function sync_tool_bookmark_count() is
  'Keeps tools.bookmark_count equal to the number of bookmarks pointing at that tool. Bookmarks are polymorphic, so rows for other target kinds are ignored.';

create trigger bookmarks_sync_tool_count
  after insert or delete on bookmarks
  for each row execute function sync_tool_bookmark_count();

-- Backfill, so the column is true from this migration onward rather than only
-- counting bookmarks made after it.
update tools
set bookmark_count = (
  select count(*) from bookmarks
  where bookmarks.target_type = 'tool' and bookmarks.target_id = tools.id
);

-- A trigger function has no business being callable over PostgREST. Postgres
-- would reject the call anyway ("trigger functions can only be called as
-- triggers"), but the grant is what Supabase's security linter flags, and the
-- trigger itself runs as the table owner regardless of who holds EXECUTE.
revoke all on function sync_tool_bookmark_count() from public, anon, authenticated;
