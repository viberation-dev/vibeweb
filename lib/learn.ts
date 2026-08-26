import type { LevelParam } from "@/lib/role-level";
import type { Enums } from "@/types/supabase";

export type ContentType = Enums<"content_type">;

/**
 * Display label for every content type.
 *
 * A Record (not a lookup with a fallback) so adding a value to the
 * `content_type` enum fails the typecheck here rather than rendering a raw
 * `course_link` at someone.
 */
const TYPE_LABELS: Record<ContentType, string> = {
  article: "Article",
  guide: "Guide",
  cheatsheet: "Cheatsheet",
  course_link: "Course",
  help_article: "Help article",
  role_guide: "Role guide",
};

/**
 * The content types the Learn hub lists, in display order.
 *
 * `role_guide` is deliberately absent: those rows are staff-facing docs
 * (audience = author | admin | seller) and would be noise in a visitor's
 * index. They still render on `/learn/[slug]` — one detail route serves
 * every content type, which is the whole reason there is no separate docs
 * system (§34).
 */
export const LEARN_TYPES = [
  { value: "guide", label: "Guides" },
  { value: "article", label: "Articles" },
  { value: "cheatsheet", label: "Cheatsheets" },
  { value: "course_link", label: "Courses" },
  { value: "help_article", label: "Help" },
] as const satisfies ReadonlyArray<{ value: ContentType; label: string }>;

/** What the hub lists when no type chip is active. */
export const LEARN_TYPE_VALUES: ContentType[] = LEARN_TYPES.map((t) => t.value);

/** Narrows an untrusted `?type=` value to a listable type, or undefined. */
export function toContentType(value: string | undefined): ContentType | undefined {
  return LEARN_TYPES.some((t) => t.value === value) ? (value as ContentType) : undefined;
}

/** Singular label for one content type — card eyebrows, detail badges. */
export function contentTypeLabel(value: ContentType): string {
  return TYPE_LABELS[value];
}

/**
 * Builds `/learn?...` URLs.
 *
 * One place that knows the hub's query-string shape, shared by the filter
 * chips and the pager. Empty params are dropped and `page` is omitted at
 * page 1, so the canonical URL for the unfiltered first page stays `/learn`.
 */
export function learnHref(params: { type?: string; level?: LevelParam; page?: number }): string {
  const search = new URLSearchParams();

  if (params.type) search.set("type", params.type);
  if (params.level) search.set("level", params.level);
  if (params.page && params.page > 1) search.set("page", String(params.page));

  const query = search.toString();
  return query ? `/learn?${query}` : "/learn";
}

/**
 * The one-line preview a card shows under the title.
 *
 * Prose gets its opening paragraph with whitespace collapsed. A cheatsheet
 * gets only its first *line*: its "first paragraph" is the whole reference
 * table, and collapsing that runs the columns together into a wall of words
 * — "git status what is actually changed right now git diff what changed…".
 * One line of a cheatsheet still reads as a sentence.
 */
export function contentPreview(type: ContentType, body: string | null): string | null {
  if (!body) return null;

  const trimmed = body.trim();
  const source = type === "cheatsheet" ? trimmed.split("\n")[0] : trimmed.split("\n\n")[0];
  const collapsed = source.replace(/\s+/g, " ").trim();

  if (!collapsed) return null;
  return collapsed.length > 160 ? `${collapsed.slice(0, 157).trimEnd()}…` : collapsed;
}
