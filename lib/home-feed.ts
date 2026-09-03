import type { RoleLevel } from "./role-level.ts";

/**
 * Pure logic behind the signed-in home feed (VIB-78, handoff Screen 2).
 *
 * Kept apart from the page so it runs under plain `node --test` — no alias
 * imports, no React, no Supabase client.
 */

/** The feed tabs the mockup shows. */
export const FEED_TABS = [
  { value: "for-you", label: "For you" },
  { value: "latest", label: "Latest" },
  /*
   * Selectable since VIB-86 gave `content` a view_count and the detail page
   * a counter. Before that there was no cross-user signal at all — tool_clicks
   * covers tools only, and bookmarks are owner-only under RLS — so the tab
   * rendered dimmed rather than ordering by something invented.
   */
  { value: "top", label: "Top" },
] as const;

export type FeedTab = (typeof FEED_TABS)[number]["value"];

/** Narrows an untrusted `?feed=` value to a selectable tab. */
export function toFeedTab(value: string | undefined): FeedTab {
  const tab = FEED_TABS.find((t) => t.value === value);
  return tab && !("disabled" in tab && tab.disabled) ? tab.value : "for-you";
}

/**
 * What each tab asks the content query for.
 *
 * "For you" is the reader's own tier; "Latest" drops that filter and takes
 * newest first; "Top" drops it too and takes most-read. Keeping the mapping
 * here rather than in the page means the tabs cannot quietly disagree with
 * their own labels.
 */
export function feedQueryFor(tab: FeedTab, roleLevel: RoleLevel | undefined) {
  return {
    roleLevel: tab === "for-you" ? roleLevel : undefined,
    sort: tab === "top" ? ("popular" as const) : ("latest" as const),
  };
}

/**
 * Time-of-day greeting, matching the mockup's "Good evening, Ali".
 *
 * Takes the hour rather than reading the clock so it is testable, and so
 * the caller decides whose clock counts. Rendered on the server, so this is
 * the server's timezone — a visitor in another one can see the "wrong"
 * greeting, which is the accepted cost of not shipping a client component
 * and a hydration mismatch for a pleasantry.
 */
export function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Rough read time in minutes, for the feed card's "8 min read".
 *
 * 200 words a minute is the usual prose figure. Never returns 0 — "0 min
 * read" reads as broken, and anything with a body takes at least a moment.
 */
export function readingMinutes(body: string | null): number | null {
  if (!body) return null;

  const words = body.trim().split(/\s+/).filter(Boolean).length;
  if (!words) return null;

  return Math.max(1, Math.round(words / 200));
}

/**
 * The mockup's progress line: "Step 2 of 4 · Pick your stack".
 *
 * `stepIndex` is 0-based in the database and 1-based to a reader, which is
 * exactly the sort of thing that ships off by one.
 */
export function progressLabel(
  stepIndex: number,
  stepTitle: string | undefined,
  total: number,
) {
  const current = Math.min(stepIndex + 1, total);
  const label = `Step ${current} of ${total}`;
  return {
    label: stepTitle ? `${label} · ${stepTitle}` : label,
    /** Percentage complete — steps finished, not the one in progress. */
    percent: total ? Math.round((Math.min(stepIndex, total) / total) * 100) : 0,
  };
}
