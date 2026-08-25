import type { Enums } from "@/types/supabase";

export type ContentType = Enums<"content_type">;
export type RoleLevel = Enums<"role_level">;

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

export const ROLE_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
] as const satisfies ReadonlyArray<{ value: RoleLevel; label: string }>;

/** `?level=all` — the explicit "ignore my tier, show everything" choice. */
export const ALL_LEVELS = "all";

export type LevelParam = RoleLevel | typeof ALL_LEVELS;

/** Narrows an untrusted `?level=` value to a real choice, or undefined. */
export function toLevelParam(value: string | undefined): LevelParam | undefined {
  if (value === ALL_LEVELS) return ALL_LEVELS;
  return ROLE_LEVELS.some((l) => l.value === value) ? (value as RoleLevel) : undefined;
}

/**
 * The tier the listing actually filters on.
 *
 * Three distinct states, which is why this is a function and not a `??`:
 *   - no param        → fall back to the signed-in user's tier (null signed out)
 *   - `?level=all`    → no tier filter, even when signed in
 *   - `?level=expert` → that tier, overriding the profile
 *
 * `undefined` means "no filter" — content with a null `role_level` is meant
 * for everyone and is never excluded by any of these.
 */
export function resolveRoleLevel(
  param: LevelParam | undefined,
  profileLevel: RoleLevel | null,
): RoleLevel | undefined {
  if (param === ALL_LEVELS) return undefined;
  if (param) return param;
  return profileLevel ?? undefined;
}

/**
 * Builds `/learn?...` URLs.
 *
 * One place that knows the hub's query-string shape, shared by the filter
 * chips and the pager. Empty params are dropped and `page` is omitted at
 * page 1, so the canonical URL for the unfiltered first page stays `/learn`.
 */
export function learnHref(params: { type?: string; level?: string; page?: number }): string {
  const search = new URLSearchParams();

  if (params.type) search.set("type", params.type);
  if (params.level) search.set("level", params.level);
  if (params.page && params.page > 1) search.set("page", String(params.page));

  const query = search.toString();
  return query ? `/learn?${query}` : "/learn";
}
