/**
 * Which badge a tool card shows, from the two sources that combine (VIB-187).
 *
 * Staff-set is a column on the tool; derived reads how new it is and how
 * often it has been viewed. `site_settings.tool_badge_mode` decides which is
 * in force, and staff change it in /admin/settings at any time:
 *
 * - `staff`   the column only. The default, and the honest one before launch:
 *             every tool in the directory was created within the same month
 *             and the view counts are our own browsing.
 * - `derived` the rules only, ignoring the column.
 * - `both`    a staff badge wins, the rules fill in the rest.
 *
 * Pure and dependency-free, so it runs under plain `node --test`.
 */

export const TOOL_BADGES = ["new", "popular"] as const;
export type ToolBadge = (typeof TOOL_BADGES)[number];

export const BADGE_MODES = ["staff", "derived", "both"] as const;
export type BadgeMode = (typeof BADGE_MODES)[number];

export const BADGE_LABELS: Record<ToolBadge, string> = {
  new: "New",
  popular: "Popular",
};

/** The shape of `site_settings` this module needs. */
export type BadgeSettings = {
  tool_badge_mode: string;
  badge_new_days: number;
  badge_popular_views: number;
};

/** What a settings read falls back to when the row cannot be read. */
export const DEFAULT_BADGE_SETTINGS: BadgeSettings = {
  tool_badge_mode: "staff",
  badge_new_days: 14,
  badge_popular_views: 500,
};

/** The columns a badge is decided from. */
export type BadgeInput = {
  badge: string | null;
  created_at: string;
  view_count: number;
};

const DAY_MS = 86_400_000;

/** Narrows an untrusted mode string to a real one, falling back to the default. */
export function toBadgeMode(value: string | null | undefined): BadgeMode {
  return BADGE_MODES.includes(value as BadgeMode) ? (value as BadgeMode) : "staff";
}

function staffBadge(value: string | null): ToolBadge | null {
  return TOOL_BADGES.includes(value as ToolBadge) ? (value as ToolBadge) : null;
}

/**
 * Popular beats New when a tool qualifies for both: attention earned is a
 * stronger claim than age, and two badges on one card is a card shouting.
 */
function derivedBadge(
  tool: BadgeInput,
  settings: BadgeSettings,
  now: Date,
): ToolBadge | null {
  if (tool.view_count >= settings.badge_popular_views) return "popular";

  const created = Date.parse(tool.created_at);
  // An unparseable date is not evidence of newness.
  if (Number.isNaN(created)) return null;

  const age = now.getTime() - created;
  return age >= 0 && age <= settings.badge_new_days * DAY_MS ? "new" : null;
}

export function toolBadge(
  tool: BadgeInput,
  settings: BadgeSettings = DEFAULT_BADGE_SETTINGS,
  now: Date = new Date(),
): ToolBadge | null {
  const mode = toBadgeMode(settings.tool_badge_mode);
  const staff = staffBadge(tool.badge);

  if (mode === "staff") return staff;
  if (mode === "derived") return derivedBadge(tool, settings, now);
  return staff ?? derivedBadge(tool, settings, now);
}

/** The badge as the word a card prints, or undefined when there is none. */
export function toolBadgeLabel(
  tool: BadgeInput,
  settings?: BadgeSettings,
  now?: Date,
): string | undefined {
  const badge = toolBadge(tool, settings, now);
  return badge ? BADGE_LABELS[badge] : undefined;
}
