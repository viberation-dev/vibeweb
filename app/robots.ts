import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-url";

/*
 * Read per request, not at build: on Cloudflare DEPLOY_ENV is a runtime var
 * in wrangler.jsonc, and a build-time read would bake in whatever the build
 * machine had.
 */
export const dynamic = "force-dynamic";

/*
 * Previews share the production database but must never be indexed, so
 * anything that is not the production deployment asks crawlers to stay out.
 * DEPLOY_ENV is the host-neutral flag; VERCEL_ENV covers Vercel until the move.
 */
export default function robots(): MetadataRoute.Robots {
  if ((process.env.DEPLOY_ENV ?? process.env.VERCEL_ENV) !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/api", "/onboarding", "/email", "/go"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
