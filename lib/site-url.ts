/**
 * The site's public origin, for sitemap, robots and metadataBase (VIB-165).
 *
 * VERCEL_PROJECT_PRODUCTION_URL is set by Vercel on every deployment and
 * follows the project's primary domain, so attaching the real domain in the
 * Vercel dashboard updates this with no code change. NEXT_PUBLIC_SITE_URL
 * overrides it if that ever needs to differ.
 *
 * Off Vercel neither is set, so a production build falls back to the live
 * domain rather than localhost — previews on Vercel already resolve to it.
 */
export const PRODUCTION_ORIGIN = "https://www.viberation.dev";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.NODE_ENV === "production"
      ? PRODUCTION_ORIGIN
      : "http://localhost:3000");
