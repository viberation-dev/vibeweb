-- "Works with" links between directory entries (VIB-109).
--
-- A model page should say where you can use the model and what pairs with it:
-- Claude runs in Claude Code and Cursor, pairs with the Supabase MCP server and
-- Superpowers. Every one of those is already a `tools` row, so the link is a
-- row between two rows rather than a list of names typed onto the model —
-- names in a text column cannot be clicked, and they go stale one page at a
-- time.
--
-- Three kinds, which is how a reader asks the question:
--   official    the vendor's own apps          (Claude → Claude Code, Claude.ai)
--   runs_in     third-party apps that run it   (Claude → Cursor, Copilot)
--   pairs_with  everything you use alongside   (Claude → Supabase MCP, Next.js)
-- pairs_with is grouped on the page by the linked tool's category, so MCP
-- servers, skills and frameworks need no kind of their own.
create type tool_link_kind as enum ('official', 'runs_in', 'pairs_with');

create table tool_links (
  tool_id        uuid not null references tools(id) on delete cascade,
  linked_tool_id uuid not null references tools(id) on delete cascade,
  kind           tool_link_kind not null,

  -- How, when it is not obvious: "via the Claude Code extension", "bring
  -- your own key". Short, because it renders inline beside a name.
  note           text check (note is null or char_length(note) <= 80),

  -- Editorial order within a section. Ties fall back to name on the page.
  sort_order     int not null default 0,

  -- One link per pair: a tool is not both "official" and "runs in" for the
  -- same model.
  primary key (tool_id, linked_tool_id),
  check (tool_id <> linked_tool_id)
);

comment on table tool_links is
  '"Works with" links between directory entries (VIB-109). Read from both ends: outgoing on the tool page, incoming as "Works with" on the linked one.';

-- The primary key covers lookups by tool_id; this covers the reverse side.
create index tool_links_linked_idx on tool_links (linked_tool_id);

alter table tool_links enable row level security;

-- Public, like `tools` itself: a link between two public rows reveals nothing.
create policy tool_links_read on tool_links
  for select using (true);

create policy tool_links_write on tool_links
  for all using (is_staff()) with check (is_staff());

-- Grants — required since migration 20 (VIB-60); see testimonials (VIB-102).
grant select on tool_links to anon, authenticated;
grant insert, update, delete on tool_links to authenticated;
