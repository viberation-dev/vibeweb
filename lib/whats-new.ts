/*
 * The What's new stream's pure half (VIB-230).
 *
 * Alias-free and dependency-free so it runs under plain `node --test`, the
 * same constraint as lib/home-feed.ts and lib/tool-badges.ts. It deliberately
 * works over WhatsNewInput rather than over ResourceView: that type imports
 * @/lib/learn and @/lib/reading-time, and the query layer joins the views back
 * on `id` once the merge has decided what is in the stream.
 */

export const WHATS_NEW_KINDS = ["tool", "content", "collection", "feature"] as const;
export type WhatsNewKind = (typeof WHATS_NEW_KINDS)[number];

export const WHATS_NEW_EVENTS = ["added", "updated"] as const;
export type WhatsNewEvent = (typeof WHATS_NEW_EVENTS)[number];

export const KIND_LABELS: Record<WhatsNewKind, string> = {
  tool: "Tool",
  content: "Guide",
  collection: "Collection",
  feature: "Feature",
};

export const EVENT_LABELS: Record<WhatsNewEvent, string> = {
  added: "Added",
  updated: "Updated",
};

/** The minimum the merge needs. Not a row, and not a renderable view. */
export type WhatsNewInput = {
  /** Identity the caller joins its view back on. Absent for a feature. */
  id?: string;
  kind: WhatsNewKind;
  title: string;
  /** Features have no row and carry their own href. */
  href?: string;
  addedAt: string | null;
  revisedAt: string | null;
  /** What changed. Only meaningful alongside revisedAt. */
  note: string | null;
};

export type WhatsNewEntry = {
  id?: string;
  kind: WhatsNewKind;
  event: WhatsNewEvent;
  title: string;
  href?: string;
  /** ISO date the event happened. The sort key. */
  at: string;
  /** The revision note, or a feature's body. Null for an addition. */
  note: string | null;
  /** Within badge_new_days of now. */
  isNew: boolean;
};

export type MergeOptions = {
  /** site_settings.badge_new_days. The only definition of "new" on the site. */
  newDays: number;
  limit?: number;
  now?: Date;
};

const DAY_MS = 86_400_000;

/** A parseable timestamp, or null. An unparseable date is not evidence of anything. */
function at(value: string | null): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * One entry per item, at its most recent event.
 *
 * The event follows the date actually chosen, not the presence of `revisedAt`:
 * a revision dated before the item was published is a data entry error, and
 * labelling it Updated at a date older than its own publication would be a lie
 * the reader can see.
 */
function toEntry(item: WhatsNewInput, newDays: number, now: number): WhatsNewEntry | null {
  const added = at(item.addedAt);
  const revised = at(item.revisedAt);

  // A future date would otherwise pin the item to the top of the stream
  // forever. Clock skew and typo'd years both land here.
  const candidates = [added, revised].filter(
    (value): value is number => value !== null && value <= now,
  );
  if (!candidates.length) return null;

  const when = Math.max(...candidates);
  const event: WhatsNewEvent = revised !== null && when === revised ? "updated" : "added";

  return {
    id: item.id,
    kind: item.kind,
    event,
    title: item.title,
    href: item.href,
    at: new Date(when).toISOString(),
    note: event === "updated" ? item.note : null,
    isNew: now - when <= newDays * DAY_MS,
  };
}

export function mergeWhatsNew(
  inputs: readonly WhatsNewInput[],
  { newDays, limit, now = new Date() }: MergeOptions,
): WhatsNewEntry[] {
  const at_ = now.getTime();

  const entries = inputs.flatMap((item) => {
    const entry = toEntry(item, newDays, at_);
    return entry ? [entry] : [];
  });

  entries.sort((a, b) => b.at.localeCompare(a.at) || a.title.localeCompare(b.title));

  return limit === undefined ? entries : entries.slice(0, limit);
}

/** Narrows an untrusted `?kind=` value. Undefined means "no filter". */
export function toWhatsNewKind(value: string | undefined): WhatsNewKind | undefined {
  return WHATS_NEW_KINDS.find((kind) => kind === value);
}

/** Narrows an untrusted `?event=` value. Undefined means "no filter". */
export function toWhatsNewEvent(value: string | undefined): WhatsNewEvent | undefined {
  return WHATS_NEW_EVENTS.find((event) => event === value);
}

/**
 * Changelog entries as stream inputs (VIB-230).
 *
 * `added` is an addition; `improved` and `fixed` are updates, and the entry's
 * own body is the note. A feature has no row, so it carries an href instead of
 * an id and never joins to a view.
 */
export function changelogInputs(
  entries: readonly { date: string; title: string; body: string; kind: string }[],
): WhatsNewInput[] {
  return entries.map((entry) => ({
    kind: "feature" as const,
    title: entry.title,
    href: "/changelog",
    addedAt: entry.kind === "added" ? entry.date : null,
    revisedAt: entry.kind === "added" ? null : entry.date,
    note: entry.body,
  }));
}
