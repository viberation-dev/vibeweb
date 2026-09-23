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
      /*
       * /prototypes holds the static HTML mock-ups a change was reviewed
       * against. They are served so a preview URL can show them, and they
       * are not pages of the site — indexing one would put a mock-up of a
       * guide into search results beside the guide itself (VIB-198).
       */
      disallow: [
        "/admin",
        "/account",
        "/api",
        "/onboarding",
        "/email",
        "/go",
        "/prototypes",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
