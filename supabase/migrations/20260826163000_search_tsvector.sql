-- Viberation MVP schema — 10: full-text search vectors + GIN indexes (VIB-47)
--
-- Generated columns, not triggers: Postgres keeps them in step with the source
-- columns automatically, so there is no way for the index to drift out of sync
-- with the row the way a hand-written trigger can.
--
-- Weighting follows how people actually search. A name or title match is what
-- someone meant; a body match is usually incidental, so it ranks below.
--   A = name / title
--   B = tagline (tools only)
--   C = description / body
--
-- `english` is hard-coded rather than left to the session default, because a
-- generated column requires an IMMUTABLE expression and the two-argument
-- to_tsvector() is the immutable form.

alter table tools
  add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(name, '')),        'A') ||
    setweight(to_tsvector('english', coalesce(tagline, '')),     'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) stored;

alter table content
  add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(body, '')),  'C')
  ) stored;

create index if not exists tools_search_idx   on tools   using gin(search_vector);
create index if not exists content_search_idx on content using gin(search_vector);
