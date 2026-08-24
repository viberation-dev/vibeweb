-- Viberation MVP schema — 04: collections + wizard (lean MVP shape) + RLS
-- Public read; staff write. Rich wizard model (blocks/branching/runs) is Phase 1.5.

create table collections (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  cover_image text,
  created_at  timestamptz not null default now()
);

-- Polymorphic membership (target_kind + target_id); integrity enforced in app + RLS
create table collection_items (
  id            uuid primary key default gen_random_uuid(),
  collection_id uuid not null references collections(id) on delete cascade,
  target_type   target_kind not null,
  target_id     uuid not null,
  sort_order    int not null default 0
);
create index collection_items_collection_idx on collection_items(collection_id);

create table wizards (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  kind        wizard_kind not null default 'wizard',   -- wizard | setup | path (§20 §3)
  reusable    boolean not null default false,           -- setups can be re-run/reset
  steps       jsonb not null default '[]',   -- lean MVP shape; normalized in Phase 1.5
  role_level  role_level,
  status      wizard_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table wizard_recommended_tools (
  wizard_id uuid not null references wizards(id) on delete cascade,
  tool_id   uuid not null references tools(id)   on delete cascade,
  primary key (wizard_id, tool_id)
);

-- Per-user progress through a wizard (own-rows only)
create table wizard_progress (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  wizard_id      uuid not null references wizards(id)  on delete cascade,
  step_index     int not null default 0,
  checklist_state jsonb not null default '{}',
  updated_at     timestamptz not null default now(),
  unique (user_id, wizard_id)
);

-- RLS: public read for collections/wizards; staff write; progress is per-user
alter table collections enable row level security;
alter table collection_items enable row level security;
alter table wizards enable row level security;
alter table wizard_recommended_tools enable row level security;
alter table wizard_progress enable row level security;

create policy collections_read on collections for select using (true);
create policy collections_write on collections for all using (is_staff()) with check (is_staff());
create policy collection_items_read on collection_items for select using (true);
create policy collection_items_write on collection_items for all using (is_staff()) with check (is_staff());

-- Published wizards visible to all; drafts to staff only
create policy wizards_read on wizards for select using (status = 'published' or is_staff());
create policy wizards_write on wizards for all using (is_staff()) with check (is_staff());
create policy wrt_read on wizard_recommended_tools for select using (true);
create policy wrt_write on wizard_recommended_tools for all using (is_staff()) with check (is_staff());

-- Progress: a user reads/writes only their own rows
create policy wizard_progress_own on wizard_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
