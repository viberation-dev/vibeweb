/**
 * The site's public origin, for sitemap, robots and metadataBase (VIB-165).
 *
 * VERCEL_PROJECT_PRODUCTION_URL is set by Vercel on every deployment and
 * follows the project's primary domain, so attaching the real domain in the
 * Vercel dashboard updates this with no code change. NEXT_PUBLIC_SITE_URL
 * overrides it if that ever needs to differ.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
