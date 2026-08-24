-- Viberation MVP schema — 03: tools, content, prompts, tags (+ join tables) + RLS
-- Public read for everyone; writes restricted to staff (is_staff()).

create table tools (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  category         tool_category not null,
  tagline          text,
  description      text,
  pricing_tier     text,
  view_count       int not null default 0,
  bookmark_count   int not null default 0,
  comparison_ready boolean not null default false,  -- flags v2.0 Comparison Tool eligibility
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index tools_category_idx on tools(category);

create table content (
  id          uuid primary key default gen_random_uuid(),
  type        content_type not null,
  title       text not null,
  slug        text not null unique,
  body        text,
  role_level  role_level,                 -- audience tier (null = all)
  audience    docs_audience,              -- only for role_guide docs
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index content_type_idx on content(type);

create table prompts (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  prompt_text       text not null,
  tool_id           uuid references tools(id) on delete set null,
  use_case_category text,
  created_at        timestamptz not null default now()
);

create table tags (
  id   uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

-- Explicit join tables preserve referential integrity (vs one polymorphic table)
create table tool_tags (
  tool_id uuid not null references tools(id) on delete cascade,
  tag_id  uuid not null references tags(id)  on delete cascade,
  primary key (tool_id, tag_id)
);
create table content_tags (
  content_id uuid not null references content(id) on delete cascade,
  tag_id     uuid not null references tags(id)     on delete cascade,
  primary key (content_id, tag_id)
);
create table prompt_tags (
  prompt_id uuid not null references prompts(id) on delete cascade,
  tag_id    uuid not null references tags(id)    on delete cascade,
  primary key (prompt_id, tag_id)
);

-- RLS: public read, staff write
do $$
declare t text;
begin
  foreach t in array array['tools','content','prompts','tags','tool_tags','content_tags','prompt_tags']
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('create policy %I_read on %I for select using (true);', t, t);
    execute format('create policy %I_write on %I for all using (is_staff()) with check (is_staff());', t, t);
  end loop;
end $$;
