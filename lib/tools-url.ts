/**
 * Builds `/tools?...` URLs.
 *
 * Shared by the filter chips and the pager so there is one place that knows
 * the directory's query-string shape. Empty params are dropped, and `page`
 * is omitted at page 1, so the canonical URL for the unfiltered first page
 * stays a bare `/tools`.
 */
export function toolsHref(params: {
  category?: string;
  tag?: string;
  page?: number;
}): string {
  const search = new URLSearchParams();

  if (params.category) search.set("category", params.category);
  if (params.tag) search.set("tag", params.tag);
  if (params.page && params.page > 1) search.set("page", String(params.page));

  const query = search.toString();
  return query ? `/tools?${query}` : "/tools";
}

/** Narrows an untrusted `?page=` value to a positive integer. Defaults to 1. */
export function toPageNumber(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}
