-- Viberation MVP schema — 05: bookmarks + history (per-user private) + RLS

create table bookmarks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  target_type target_kind not null,
  target_id   uuid not null,
  folder_name text,                       -- personal organization
  created_at  timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);
create index bookmarks_user_idx on bookmarks(user_id);

create table history_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  target_type target_kind not null,
  target_id   uuid not null,
  visited_at  timestamptz not null default now()
);
create index history_user_visited_idx on history_items(user_id, visited_at desc);

-- Optional: cap history at ~200 rows/user (keep newest). Trigger-based prune.
create or replace function prune_history()
returns trigger language plpgsql as $$
begin
  delete from history_items
  where user_id = new.user_id
    and id not in (
      select id from history_items
      where user_id = new.user_id
      order by visited_at desc
      limit 200
    );
  return null;
end; $$;

create trigger history_prune_after_insert
  after insert on history_items
  for each row execute function prune_history();

-- RLS: strictly per-user
alter table bookmarks enable row level security;
alter table history_items enable row level security;

create policy bookmarks_own on bookmarks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy history_own on history_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- NOTE (integrity): bookmarks/history/collection_items use polymorphic
-- (target_type,target_id) with no DB-level FK by design. Validate target
-- existence in app code (or an optional trigger) since a single FK can't span tables.
