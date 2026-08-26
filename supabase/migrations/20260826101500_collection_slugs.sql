-- Viberation MVP schema — 09: collection slugs + featured flag
--
-- Migration 04 created `collections` without a slug, but §31's sitemap routes
-- collection detail at /collections/[slug], and the home feed needs a way to
-- say which collections are curated as featured. Both are added here rather
-- than by editing 04, which is already applied.

alter table collections
  add column if not exists slug        text,
  add column if not exists is_featured boolean not null default false;

-- Backfill from the title so the not-null and unique constraints below can be
-- added safely. A no-op on an empty table; correct if rows already exist.
update collections
set slug = trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'))
where slug is null;

-- Disambiguate any collisions the backfill produced, so the unique index holds.
update collections c
set slug = c.slug || '-' || left(c.id::text, 8)
where exists (
  select 1 from collections other
  where other.slug = c.slug and other.id <> c.id
);

alter table collections alter column slug set not null;
create unique index if not exists collections_slug_key on collections(slug);
