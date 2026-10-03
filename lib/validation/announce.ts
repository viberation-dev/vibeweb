import { z } from "zod";

/**
 * The announce / keep / clear rule, shared by the tools and content editors
 * (VIB-230, VIB-232).
 *
 * Both editors had their own copy of this block. The rule is subtle enough
 * that two copies is one too many: the first version of it shipped a
 * data-loss bug, and the fix had to be made identically in both files. One
 * module, two spreads.
 *
 * Relative imports with extensions, like the schemas that use it: a plain
 * `node --test` file resolves no "@/" alias.
 */

/** Spread into an editor schema's shape. */
export const ANNOUNCE_FIELDS = {
  /*
   * "This is worth announcing". A revision reaches the What's new stream only
   * when somebody ticks this: `updated_at` is touched by every write,
   * including typo fixes and tag reorders, so it cannot carry the claim. The
   * note is required alongside it because an entry saying only "Updated"
   * tells a reader nothing.
   */
  announce_revision: z
    .union([z.literal("on"), z.literal("")])
    .nullable()
    .transform((value) => value === "on"),
  /*
   * "Take the existing announcement back" (VIB-232). Its own control rather
   * than an unticked `announce_revision`, because the two mean different
   * things: unticking is "this edit is not worth announcing", which must
   * leave an earlier announcement alone. Conflating them is exactly how the
   * data-loss bug appeared.
   */
  clear_announcement: z
    .union([z.literal("on"), z.literal("")])
    .nullish()
    .transform((value) => value === "on"),
  revision_note: z.string().trim().nullable().optional(),
};

type AnnounceInput = {
  announce_revision: boolean;
  clear_announcement: boolean;
  revision_note?: string | null;
};

/** Either column, or neither. The database's check constraint wants the pair. */
type AnnouncePair = {
  revised_at?: string | null;
  revision_note?: string | null;
};

/**
 * The announcement half of an update payload.
 *
 * Three outcomes, and the difference between two of them is the whole point:
 *
 * - announce → the pair, stamped now
 * - clear → the pair, both null, which the check constraint requires together
 * - neither → `{}`, so the update does not mention these columns at all
 *
 * That last one has to stay an omission rather than a pair of nulls. Nulling
 * here would mean every ordinary edit silently dropped the row out of What's
 * new, which is the bug this shape exists to prevent.
 */
export function resolveAnnouncement({
  announce_revision,
  clear_announcement,
  revision_note,
}: AnnounceInput): AnnouncePair {
  if (clear_announcement) return { revised_at: null, revision_note: null };
  if (announce_revision) {
    return {
      revised_at: new Date().toISOString(),
      revision_note: revision_note || null,
    };
  }
  return {};
}

/** True unless a resolved announcement is missing its note. */
export function hasAnnouncementNote(value: AnnouncePair): boolean {
  return !value.revised_at || Boolean(value.revision_note);
}

export const ANNOUNCEMENT_NOTE_ISSUE = {
  message: "Say what changed, in one line, or untick the announce box.",
  path: ["revision_note"],
};

/**
 * Announcing and clearing in the same save is contradictory, so it is an
 * error rather than a guess about which one was meant. The editor cannot
 * produce it — the two boxes are separate controls, not a toggle — but a
 * stale or hand-posted form can.
 */
export function announceAndClearAgree(value: {
  announce_revision: boolean;
  clear_announcement: boolean;
}): boolean {
  return !(value.announce_revision && value.clear_announcement);
}

export const ANNOUNCE_CONFLICT_ISSUE = {
  message: "Announce this change or clear the announcement, not both.",
  path: ["clear_announcement"],
};
