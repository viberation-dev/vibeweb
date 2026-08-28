-- Viberation MVP schema — 12: searchable tags + collections (VIB-49 follow-up)
--
-- Two gaps found by actually using the search built in 10/11:
--
--  1. Searching "design" returned nothing, even though shadcn/ui carries the
--     Design tag. Tags are the facet the whole directory is organised around
--     (§07 — the retired app-area buckets live on as tags), so a search that
--     cannot see them is missing the word most people would type. A generated
--     column cannot reference another table, so tag matching has to happen in
--     the function.
--  2. §31's search spec lists tools · content · collections. Collections were
--     absent, which is visible the moment someone searches for one by name.

alter table collections
  add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')),       'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) stored;

create index if not exists collections_search_idx on collections using gin(search_vector);

/*
 * Ranked search across tools, content and collections, including tag matches.
 *
 * Every source contributes (kind, id, rank) rows and the whole lot is grouped
 * by (kind, id) taking the best rank. That is what lets a tool match both
 * directly and through a tag without appearing twice, and it means adding a
 * future source is one more union branch.
 *
 * Tag matches are scaled to 0.5. A tag is a coarse signal — every tool
 * carrying "free-tier" matches that word equally — so a tag hit should rank
 * below something that actually says the word in its name or description,
 * while still beating not being found at all.
 */
create or replace function search_all(q text, result_limit int default 20)
returns table (kind text, id uuid, rank real)
language sql
stable
set search_path = public
as $$
  with query as (select websearch_to_tsquery('english', q) as tsq),
  hits as (
    select 'tool'::text as kind, t.id as id, ts_rank(t.search_vector, query.tsq) as rank
    from tools t, query
    where t.search_vector @@ query.tsq

    union all

    select 'tool'::text, tt.tool_id, ts_rank(to_tsvector('english', g.name), query.tsq) * 0.5
    from tool_tags tt
    join tags g on g.id = tt.tag_id, query
    where to_tsvector('english', g.name) @@ query.tsq

    union all

    select 'content'::text, c.id, ts_rank(c.search_vector, query.tsq)
    from content c, query
    where c.search_vector @@ query.tsq

    union all

    select 'content'::text, ct.content_id, ts_rank(to_tsvector('english', g.name), query.tsq) * 0.5
    from content_tags ct
    join tags g on g.id = ct.tag_id, query
    where to_tsvector('english', g.name) @@ query.tsq

    union all

    select 'collection'::text, col.id, ts_rank(col.search_vector, query.tsq)
    from collections col, query
    where col.search_vector @@ query.tsq
  )
  select hits.kind, hits.id, max(hits.rank) as rank
  from hits
  group by hits.kind, hits.id
  order by rank desc
  limit result_limit;
$$;
