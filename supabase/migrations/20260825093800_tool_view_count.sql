-- Viberation MVP schema — 07: tool view counter
--
-- NOTE ON NUMBERING: §33 and VIB-47 call the tsvector search migration "07".
-- This one landed first, so the search migration becomes 08. Files are
-- ordered by timestamp, not by the number in the comment — the number is
-- prose, the timestamp is the contract.
--
-- tools.view_count has existed since migration 03, but nothing could write
-- to it: migration 03 makes `tools` public-read / staff-write, so a signed-out
-- visitor reading a tool page cannot update the row. This adds the one narrow
-- hole that lets a view register, without widening write access to `tools`.

create or replace function increment_tool_views(tool_slug text)
returns void
language sql
security definer
-- Pinning search_path is what stops a caller-controlled schema from
-- shadowing `tools` inside a definer function.
set search_path = public
as $$
  update tools set view_count = view_count + 1 where slug = tool_slug;
$$;

comment on function increment_tool_views(text) is
  'Adds 1 to tools.view_count for one slug. The only write path to tools available to non-staff; cannot touch any other column or table.';

-- Default execute-to-public would let anyone call this through PostgREST
-- anyway, but stating the grant explicitly makes the intended callers the
-- documented ones rather than an accident of the default.
revoke all on function increment_tool_views(text) from public;
grant execute on function increment_tool_views(text) to anon, authenticated;
