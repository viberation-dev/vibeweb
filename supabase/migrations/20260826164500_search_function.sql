-- Viberation MVP schema — 11: ranked cross-type search (VIB-48)
--
-- Separate from migration 10 because 10 was already applied when it became
-- clear that ranking across two tables needs a function. Never edit an
-- applied migration; add the next one.
--
-- Why a function at all: PostgREST can filter on a tsvector, but it cannot
-- select or order by ts_rank(), so a client-side query can only return
-- unranked matches per table with no way to interleave them. A relevance
-- search whose best result is buried under an alphabetical accident is not a
-- search. This returns (kind, id, rank) and lets the app hydrate the rows —
-- the union has to stay narrow because tools and content have different
-- shapes.
--
-- Deliberately NOT security definer: `tools` and `content` are public-read
-- (migration 03), so the caller's own RLS is exactly the right visibility.
-- Making it definer would be a way to leak drafts later, for no benefit now.

create or replace function search_all(q text, result_limit int default 20)
returns table (kind text, id uuid, rank real)
language sql
stable
set search_path = public
as $$
  with query as (select websearch_to_tsquery('english', q) as tsq)
  -- The union is wrapped rather than ordered directly: ORDER BY on a UNION
  -- can only see the first branch's output names, which is a foot-gun worth
  -- stepping around rather than relying on.
  select hits.kind, hits.id, hits.rank
  from (
    select 'tool'::text as kind, t.id as id, ts_rank(t.search_vector, query.tsq) as rank
    from tools t, query
    where t.search_vector @@ query.tsq
    union all
    select 'content'::text as kind, c.id as id, ts_rank(c.search_vector, query.tsq) as rank
    from content c, query
    where c.search_vector @@ query.tsq
  ) hits
  order by hits.rank desc
  limit result_limit;
$$;
