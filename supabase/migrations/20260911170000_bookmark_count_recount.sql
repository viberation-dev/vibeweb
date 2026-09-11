-- tools.bookmark_count recounts instead of adjusting by one (VIB-114).
--
-- VIB-113's trigger decided "first / last bookmark this user has on the
-- tool" per row. AFTER ROW triggers fire once the whole statement is done, so
-- every row sees the statement's other rows: on a multi-row delete (a user
-- with a family save and a model save deleting their account) each row saw
-- none left and decremented; on a multi-row insert none incremented.
-- Recounting people is right for any statement shape.
--
-- ponytail: under concurrent saves on one tool, a recount can miss the other
-- transaction's uncommitted row and leave the count one short until the next
-- save on that tool recounts. Self-healing; a statement-level trigger or a
-- nightly recount would close it if it ever matters.
create or replace function sync_tool_bookmark_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  tool_id uuid;
begin
  -- NEW is null on delete, and OLD on insert.
  if tg_op = 'DELETE' then
    if old.target_type <> 'tool' then return null; end if;
    tool_id := old.target_id;
  else
    if new.target_type <> 'tool' then return null; end if;
    tool_id := new.target_id;
  end if;

  update tools
  set bookmark_count = (
    select count(distinct user_id) from bookmarks
    where target_type = 'tool' and target_id = tool_id
  )
  where id = tool_id;
  return null;
end; $$;

comment on function sync_tool_bookmark_count() is
  'Keeps tools.bookmark_count equal to the number of users with at least one bookmark on that tool, family or model, by recounting on every insert and delete (VIB-114). Other target kinds are ignored.';

-- The recount looks bookmarks up by target; the existing indexes lead with user_id.
create index bookmarks_target_idx on bookmarks (target_type, target_id);

-- Correct anything the old trigger got wrong. Verified 0 mismatches on
-- 2026-09-11, so this is a safety net rather than a repair.
update tools
set bookmark_count = counted.people
from (
  select t.id, count(distinct b.user_id)::int as people
  from tools t
  left join bookmarks b on b.target_type = 'tool' and b.target_id = t.id
  group by t.id
) counted
where tools.id = counted.id and tools.bookmark_count <> counted.people;

-- create or replace keeps migration 08's EXECUTE revoke; nothing to re-grant.
