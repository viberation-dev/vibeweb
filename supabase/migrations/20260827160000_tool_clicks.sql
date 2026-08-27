-- Viberation MVP schema — 12: outbound click log
-- Added 2026-08-27. §06 specifies that /go/[slug] "logs the click in a
-- clicks table (resource_id, timestamp) before redirecting (302) to the
-- real affiliate URL". Migration 06 added the destination (tools.outbound_url)
-- but nothing ever recorded the click, so affiliate performance was
-- unmeasurable — the whole point of routing through /go rather than
-- linking straight out.

create table tool_clicks (
  id         uuid primary key default gen_random_uuid(),
  -- §06 says "resource_id"; MVP only tracks tool clicks, and a real foreign
  -- key beats the polymorphic (target_type,target_id) pair used elsewhere,
  -- which exists only where one FK cannot span several tables. Widen to a
  -- polymorphic pair if content or collections ever get outbound links.
  tool_id    uuid not null references tools(id) on delete cascade,
  clicked_at timestamptz not null default now()
);
create index tool_clicks_tool_time_idx on tool_clicks(tool_id, clicked_at desc);

alter table tool_clicks enable row level security;

-- Insert-only for the public: a visitor clicking out is usually signed out,
-- so anon has to be able to write or the log records members only and the
-- numbers mean nothing.
create policy tool_clicks_insert on tool_clicks
  for insert with check (true);

-- Reads are staff-only. This is analytics, not content: leaving it
-- public-read would publish outbound traffic per tool to anyone who asked.
create policy tool_clicks_read on tool_clicks
  for select using (is_staff());
