/*
 * Whether a save to the content editor is a revision (VIB-238).
 *
 * Pure and alias-free so it runs under plain `node --test`. It deliberately
 * does not import the generated Database type: the fields are listed here as
 * the editor's own shape, and a new editable column added without being added
 * here would be a silent omission either way — the list is what the test
 * pins.
 */

/** The editable fields, as the editor form submits them. */
export type ContentComparable = {
  type: string;
  title: string;
  slug: string;
  body: string | null;
  role_level: string | null;
  audience: string | null;
  pillar: string | null;
  status: string;
  contributor_key: string | null;
};

/** Every field whose change means the piece itself was revised. */
const REVISION_FIELDS = [
  "type",
  "title",
  "slug",
  "body",
  "role_level",
  "audience",
  "pillar",
  "status",
] as const satisfies readonly (keyof ContentComparable)[];

/**
 * `null` and `""` are the same absence.
 *
 * The schema turns an empty textarea into null while the stored row may hold
 * either, and treating the difference as an edit would stamp "Updated" on a
 * save that changed nothing a reader can see.
 */
function same(a: string | null, b: string | null): boolean {
  return (a ?? "") === (b ?? "");
}

/**
 * True when the contributor credit is the only thing this save changes — or
 * when it changes nothing at all.
 *
 * Crediting someone is not a revision: the words did not change, and claiming
 * otherwise puts a false "Updated" date under the headline. Changing the
 * credit *and* the piece in one save is still a revision, which is why this
 * compares rather than simply exempting the column.
 */
export function onlyContributorChanged(
  before: ContentComparable,
  after: ContentComparable & {
    /**
     * Set when this save announces a revision, null when it withdraws one,
     * absent when it does neither (see resolveAnnouncement).
     */
    revised_at?: string | null;
  },
): boolean {
  /*
   * Announcing a revision is someone stating outright that the piece changed,
   * so it counts even when no compared field differs — they may be announcing
   * an edit made in an earlier save. Withdrawing one (null) is a correction
   * to the announcement, not a revision of the piece.
   */
  if (after.revised_at) {
    return false;
  }
  return REVISION_FIELDS.every((field) => same(before[field], after[field]));
}
