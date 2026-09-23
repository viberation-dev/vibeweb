/**
 * The "On this page" outline of a structured guide (VIB-198).
 *
 * Built from `heading` blocks, which means the anchor in the rail and the
 * `id` on the heading come from one function and cannot drift. Scraping
 * headings out of rendered markup in the browser would give the rail nothing
 * to render until hydration, and the server already holds the blocks.
 *
 * Alias-free imports: article-outline.test.ts runs under
 * `node --experimental-strip-types`.
 */

export type OutlineEntry = {
  /** The heading's `id`, and the rail link's href without the `#`. */
  id: string;
  title: string;
  level: 2 | 3;
  /** Small line above the heading, e.g. "Step 02". Rail links ignore it. */
  eyebrow?: string;
};

/**
 * A URL-safe anchor from a heading title.
 *
 * Deliberately lossy — punctuation and accents go, everything else becomes
 * lowercase words joined by hyphens — because the result lands in a shared
 * link and a bare `#` fragment is read by people.
 */
export function slugifyHeading(title: string): string {
  return (
    title
      .normalize("NFKD")
      // Strip combining marks so "Café" anchors as "cafe", not "caf".
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

/**
 * Reads the outline out of an authored `blocks` value.
 *
 * Structural rather than schema-validated: the detail pages that render a
 * guide parse the blocks properly, and this also runs where they have not
 * been parsed. A malformed row yields a shorter outline, never a throw.
 *
 * Duplicate titles get a numeric suffix. Two sections called "Troubleshooting"
 * is ordinary authoring, and without this the rail would point both entries
 * at the first one.
 */
export function articleOutline(blocks: unknown): OutlineEntry[] {
  if (!Array.isArray(blocks)) return [];

  const used = new Map<string, number>();
  const entries: OutlineEntry[] = [];

  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    const candidate = block as Record<string, unknown>;
    if (candidate.kind !== "heading" || typeof candidate.title !== "string") continue;

    const title = candidate.title.trim();
    if (!title) continue;

    const base = slugifyHeading(title);
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);

    entries.push({
      id: seen === 0 ? base : `${base}-${seen + 1}`,
      title,
      level: candidate.level === 3 ? 3 : 2,
      eyebrow: typeof candidate.eyebrow === "string" ? candidate.eyebrow : undefined,
    });
  }

  return entries;
}

/**
 * Whether a page has enough structure for the rail to earn its place.
 *
 * One heading is not an outline, it is a heading — showing a rail with a
 * single entry costs a fixed element on screen and navigates nowhere.
 */
export function hasOutline(entries: OutlineEntry[]): boolean {
  return entries.length >= 2;
}
