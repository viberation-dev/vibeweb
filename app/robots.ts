import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-url";

/*
 * Previews share the production database but must never be indexed, so
 * anything that is not the production deployment asks crawlers to stay out.
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== "production") {
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
