/**
 * Counted-noun labels: "1 view", "2 views", "1,204 views" (VIB-231).
 *
 * Every surface that shows a number shows it with a noun after it, and the
 * cards, the article header, the home feed and the admin pages each grew
 * their own inline ternary — or, where the count was assumed to be large,
 * didn't, which is how "1 views" shipped. One helper so the answer is the
 * same everywhere.
 *
 * en-GB grouping on the number: the site's dates and prices are en-GB, and
 * a view counter that reads "12345" next to them looks like a different
 * product. Grouping is applied at every size rather than only above some
 * threshold, because `toLocaleString` already leaves small numbers alone.
 *
 * English-only, and deliberately so: this is "stem + s", not an i18n layer.
 * Nouns whose plural is not the stem plus an s pass their own form.
 *
 * Alias-free imports: plural.test.ts runs under
 * `node --experimental-strip-types`, which does not resolve `@/` for value
 * imports.
 */

/** The noun alone, for callers that style the number separately. */
export function pluralise(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

/** The number alone, grouped — "1,204". */
export function formatCount(count: number): string {
  return count.toLocaleString("en-GB");
}

/** Number and noun together — "1 view", "1,204 views". */
export function countLabel(count: number, singular: string, plural?: string): string {
  return `${formatCount(count)} ${pluralise(count, singular, plural)}`;
}
