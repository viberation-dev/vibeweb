/**
 * Pure query-string handling for search.
 *
 * Separate from the adapter in lib/integrations/search.ts so it can be unit
 * tested: that module imports the query layer for hydration, and plain node
 * cannot resolve the "@/" alias for a value import.
 */

/** Hits per search. Enough to be useful, small enough to render in one page. */
export const SEARCH_LIMIT = 20;

/**
 * The longest query worth sending.
 *
 * `websearch_to_tsquery` will happily chew through a pasted essay; capping it
 * keeps a hostile or accidental megabyte of text from becoming database work.
 */
const MAX_QUERY_LENGTH = 200;

/** Trims and bounds a raw `?q=` value. Empty means "do not search at all". */
export function normaliseQuery(raw: string | undefined): string {
  return (raw ?? "").trim().slice(0, MAX_QUERY_LENGTH);
}
