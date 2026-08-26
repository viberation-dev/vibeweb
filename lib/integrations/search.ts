import type { SupabaseClient } from "@supabase/supabase-js";

import { getContentByIds, type Content } from "@/lib/queries/content";
import { getToolsByIds, type Tool } from "@/lib/queries/tools";
import { normaliseQuery, SEARCH_LIMIT } from "@/lib/search-query";
import type { Database } from "@/types/supabase";

/**
 * Search adapter (VIB-48).
 *
 * The one module that knows search is Postgres full-text. Everything else
 * asks for `search(...)` and gets typed hits back, so the eventual
 * tsvector → Typesense swap (§34) rewrites this file and nothing else.
 *
 * That boundary is why the return type is a plain ranked list of resolved
 * rows rather than anything PostgREST-shaped: no caller should be able to
 * tell where the ranking came from.
 */

type Client = SupabaseClient<Database>;

/*
 * Re-exported so callers have one import for everything search-related, even
 * though the pure half lives in lib/search-query.ts to stay unit-testable.
 */
export { normaliseQuery, SEARCH_LIMIT };

export type SearchHit =
  | { kind: "tool"; rank: number; tool: Tool }
  | { kind: "content"; rank: number; content: Content };

/** Results the UI can page through later; `total` is what came back now. */
export type SearchResults = {
  query: string;
  hits: SearchHit[];
  total: number;
};

/**
 * Ranked search across tools and Learn content.
 *
 * Two waves: the ranking function returns (kind, id, rank), then both kinds
 * are hydrated in parallel. The union has to stay narrow because tools and
 * content are different shapes, and hydrating through the existing query
 * functions keeps one definition of what a tool row is.
 *
 * Rows that vanish between the two waves are dropped rather than rendered
 * as holes — the same treatment collections and bookmarks give a deleted
 * target.
 */
export async function search(
  client: Client,
  rawQuery: string | undefined,
  limit = SEARCH_LIMIT,
): Promise<SearchResults> {
  const query = normaliseQuery(rawQuery);

  // An empty search is not a search: return nothing rather than asking the
  // database to match everything.
  if (!query) {
    return { query, hits: [], total: 0 };
  }

  const { data, error } = await client.rpc("search_all", {
    q: query,
    result_limit: limit,
  });

  if (error) {
    throw new Error(`search(${query}): ${error.message}`);
  }

  const rows = data ?? [];
  const idsOf = (kind: string) => rows.filter((row) => row.kind === kind).map((row) => row.id);

  const [tools, content] = await Promise.all([
    getToolsByIds(client, idsOf("tool")),
    getContentByIds(client, idsOf("content")),
  ]);

  const toolsById = new Map(tools.map((tool) => [tool.id, tool]));
  const contentById = new Map(content.map((row) => [row.id, row]));

  // The database already ordered by rank; preserve that order exactly.
  const hits: SearchHit[] = [];
  for (const row of rows) {
    if (row.kind === "tool") {
      const tool = toolsById.get(row.id);
      if (tool) hits.push({ kind: "tool", rank: row.rank, tool });
    } else if (row.kind === "content") {
      const item = contentById.get(row.id);
      if (item) hits.push({ kind: "content", rank: row.rank, content: item });
    }
  }

  return { query, hits, total: hits.length };
}
