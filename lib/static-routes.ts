/*
 * The static routes the sitemap lists (VIB-237 pulled this out of
 * app/sitemap.ts).
 *
 * Its own module, alias-free, so it can be tested: /feedback shipped with a
 * footer link and no sitemap entry because nothing coupled the two, and the
 * omission was invisible inside a file that imports the Supabase client and
 * therefore cannot be loaded by `node --test`.
 *
 * Everything here is a page with no listing page above it. Tools, guides,
 * collections and comparisons are enumerated from the database instead.
 */
export const STATIC_PATHS = [
  "",
  "/tools",
  "/skills",
  "/learn",
  "/walkthroughs",
  "/collections",
  "/compare",
  "/blog",
  "/docs",
  "/changelog",
  "/new",
  "/feedback",
  "/privacy",
  "/terms",
];
