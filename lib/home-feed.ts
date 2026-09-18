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

/** The fields the tabs rank on; a `content` row has them all. */
export type FeedItem = {
  id: string;
  slug: string;
  created_at: string;
  view_count: number;
  role_level: RoleLevel | null;
};

export type FeedSignals = {
  /** The reader's tier. For you keeps to it, plus the rows for everyone. */
  roleLevel?: RoleLevel;
  /** How much each item overlaps with what the reader saved and read, by tag. */
  affinity: (id: string) => number;
  /** Items the reader has already opened. */
  read: ReadonlySet<string>;
};

const newest = (a: FeedItem, b: FeedItem) =>
  b.created_at.localeCompare(a.created_at) || a.slug.localeCompare(b.slug);

/**
 * All three tabs from one pool, without repeats between them (VIB-180).
 *
 * Before, each tab was its own query, and with a dozen Learn items every tab
 * shared a row with another. Now the tabs are filled in turn and each skips
 * what an earlier one took:
 *
 * - **For you**: the reader's tier, unread first, then by tag overlap with
 *   what they saved and read, then newest.
 * - **Top**: most read of what is left.
 * - **Latest**: newest of what is left.
 *
 * A tab that runs short tops up from the whole pool in its own order rather
 * than showing a gap, so repeats only happen when there is not enough to go
 * round.
 */
export function pickFeedTabs<T extends FeedItem>(
  pool: readonly T[],
  signals: FeedSignals,
  size = 3,
): Record<FeedTab, T[]> {
  const taken = new Set<string>();

  const fill = (candidates: readonly T[], order: (a: T, b: T) => number) => {
    const sorted = [...candidates].sort(order);
    const fresh = sorted.filter((item) => !taken.has(item.id)).slice(0, size);
    const topUp = [...pool]
      .sort(order)
      .filter((item) => !fresh.includes(item))
      .slice(0, size - fresh.length);
    const picked = [...fresh, ...topUp];
    picked.forEach((item) => taken.add(item.id));
    return picked;
  };

  const inTier = pool.filter(
    (item) =>
      !signals.roleLevel ||
      item.role_level === null ||
      item.role_level === signals.roleLevel,
  );
  const forYou = fill(
    inTier,
    (a, b) =>
      Number(signals.read.has(a.id)) - Number(signals.read.has(b.id)) ||
      signals.affinity(b.id) - signals.affinity(a.id) ||
      newest(a, b),
  );
  const top = fill(pool, (a, b) => b.view_count - a.view_count || newest(a, b));
  const latest = fill(pool, newest);

  return { "for-you": forYou, latest, top };
}

/**
 * Time-of-day greeting, matching the mockup's "Good evening, Ali".
 *
 * Takes the hour rather than reading the clock so it is testable, and so
 * the caller decides whose clock counts. The home page passes the server's
 * hour for first paint and components/features/home/Greeting.tsx corrects it
 * to the viewer's own once mounted (VIB-170) — the server timezone made it
 * "Good afternoon" at 10pm in Karachi.
 */
export function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
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
