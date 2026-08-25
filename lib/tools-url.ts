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
  sort?: string;
  page?: number;
}): string {
  const search = new URLSearchParams();

  if (params.category) search.set("category", params.category);
  if (params.tag) search.set("tag", params.tag);
  if (params.sort) search.set("sort", params.sort);
  if (params.page && params.page > 1) search.set("page", String(params.page));

  const query = search.toString();
  return query ? `/tools?${query}` : "/tools";
}
