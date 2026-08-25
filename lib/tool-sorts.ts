/**
 * Sort options for the directory listing.
 *
 * `column` and `ascending` are fed straight to the query's .order(), so
 * adding an option here is the whole change — the query layer never learns
 * a new branch. Only columns that exist on `tools` belong in this list.
 */
export const TOOL_SORTS = [
  { value: "newest", label: "Newest", column: "created_at", ascending: false },
  { value: "popular", label: "Most viewed", column: "view_count", ascending: false },
  { value: "name", label: "A–Z", column: "name", ascending: true },
] as const satisfies ReadonlyArray<{
  value: string;
  label: string;
  column: "created_at" | "view_count" | "name";
  ascending: boolean;
}>;

export type ToolSort = (typeof TOOL_SORTS)[number]["value"];

/** The sort applied when the URL says nothing. */
export const DEFAULT_TOOL_SORT: ToolSort = "newest";

/** Narrows an untrusted `?sort=` value to a real option, or undefined. */
export function toToolSort(value: string | undefined): ToolSort | undefined {
  return TOOL_SORTS.some((s) => s.value === value) ? (value as ToolSort) : undefined;
}

export function toolSortOrder(sort: ToolSort) {
  // The `satisfies` above guarantees a match, so this cannot be undefined.
  return TOOL_SORTS.find((s) => s.value === sort)!;
}
