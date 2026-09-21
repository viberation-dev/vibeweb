-- Card badges: New and Popular (VIB-187).
--
-- Two sources, because neither alone is right. Staff-set is honest today and
-- works before there is traffic; derived is what you want once there is. So
-- the badge is a column staff set, the rules are a setting, and which source
-- is in force is a setting too.
--
-- Why staff-set is the default: on the day this shipped every one of the 186
-- tools had been created inside 30 days and the highest view count in the
-- table was 172 against an average of 12 — our own browsing. Derived rules
-- against that data would badge the whole directory "New" and call whatever
-- we happened to open "Popular".
create type tool_badge as enum ('new', 'popular');

-- Null means no badge, which is most tools. A single value rather than an
-- array: two badges on one card is a card shouting, and "New and Popular"
-- says less than either on its own.
alter table tools add column badge tool_badge;

comment on column tools.badge is
  'Staff-set card badge (VIB-187). Null for most tools. Whether it is used depends on site_settings.tool_badge_mode.';

/*
 * One row, forever. `id boolean primary key default true check (id)` is the
 * standard single-row trick: the only value the primary key accepts is true,
 * so a second row cannot be inserted. Settings that apply to the whole site
 * have no natural key and a second row would just be an ambiguity to
 * resolve at read time.
 */
create table site_settings (
  id boolean primary key default true check (id),

  -- 'staff'   — only the badge column, the default.
  -- 'derived' — only the rules below, ignoring the column.
  -- 'both'    — a staff badge wins; the rules fill in the rest.
  tool_badge_mode text not null default 'staff'
    check (tool_badge_mode in ('staff', 'derived', 'both')),

  -- The derived rules, as settings rather than constants, so they can be
  -- tuned against real traffic without a deploy.
  badge_new_days int not null default 14
    check (badge_new_days between 1 and 365),
  badge_popular_views int not null default 500
    check (badge_popular_views >= 1),

  updated_at timestamptz not null default now()
);

comment on table site_settings is
  'Single-row site settings (VIB-187). Read on every card render, written only from /admin/settings.';

insert into site_settings (id) values (true) on conflict (id) do nothing;

alter table site_settings enable row level security;

-- Public read: the settings decide what a signed-out visitor sees on a card,
-- so the anon role has to be able to read them. There is nothing private in
-- the row. Writes are staff, same split as every other editor.
create policy site_settings_read on site_settings
  for select using (true);

create policy site_settings_write on site_settings
  for all using (is_staff()) with check (is_staff());

/*
 * Grants. Since migration 20 (VIB-60) `public` no longer hands anon and
 * authenticated privileges on newly created tables, so without these the
 * Data API cannot see this one and every card render fails with 42501.
 *
 * No insert or delete to anyone: the single row is created above and is not
 * something an editor should be able to remove.
 */
grant select on site_settings to anon, authenticated;
grant update on site_settings to authenticated;
