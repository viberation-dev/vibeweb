-- VIB-88: tags had no way to say what a tag *is*.
--
-- `free-tier`, `open-source`, `beginner-friendly` and `frontend` all sat in
-- one undifferentiated bag, so nothing in the schema distinguished a filter
-- facet from an assertion about the product. VIB-81's action rail read two
-- facts off tags as a result, and 13 of 26 tools would have shipped an
-- incorrect "Free tier: No".

create type tag_kind as enum ('facet', 'audience', 'pricing');

alter table tags add column kind tag_kind not null default 'facet';

comment on column tags.kind is
  'What the tag asserts. facet = a filterable topic, the directory''s chips. '
  'audience = who it suits. pricing = a commercial or licensing property. '
  'Only facets belong in filter UI; pricing_tier remains authoritative for '
  'the facts themselves (see lib/tool-facts.ts).';

-- Backfill. `facet` is the default, so only the exceptions are listed.
update tags set kind = 'pricing' where slug in ('free-tier', 'open-source');
update tags set kind = 'audience' where slug in ('beginner-friendly');

-- No index: `tags` holds 12 rows and is read whole. Add one if it ever grows
-- enough that filtering by kind is not a sequential scan over nothing.
