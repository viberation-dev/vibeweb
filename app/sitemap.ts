import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";

import { createAnonClient } from "@/lib/integrations/supabase/anon";
import { contentHref } from "@/lib/learn";
import { listCollections } from "@/lib/queries/collections";
import { listPublishedComparisons } from "@/lib/queries/comparisons";
import { listAllContent } from "@/lib/queries/content";
import { listAllTools } from "@/lib/queries/tools";
import { listWalkthroughs } from "@/lib/queries/walkthroughs";
import { siteUrl } from "@/lib/site-url";
import { STATIC_PATHS } from "@/lib/static-routes";

/*
 * Rendered per request so the build never queries the database, with the
 * entries themselves cached for an hour (VIB-245). `revalidate` alone did
 * nothing here: the cookie-backed client made the route dynamic, so every
 * crawler hit re-ran all five queries.
 */
export const dynamic = "force-dynamic";

export default function sitemap(): Promise<MetadataRoute.Sitemap> {
  return cachedSitemap();
}

const cachedSitemap = unstable_cache(buildSitemap, ["sitemap"], {
  revalidate: 60 * 60,
});

async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  // Session-less: the sitemap is public and the same for everyone.
  const supabase = createAnonClient();
  const [tools, content, walkthroughs, collections, comparisons] = await Promise.all([
    listAllTools(supabase),
    listAllContent(supabase),
    listWalkthroughs(supabase),
    listCollections(supabase),
    listPublishedComparisons(supabase),
  ]);

  const entry = (path: string, updated?: string | null) => ({
    url: `${siteUrl}${path}`,
    ...(updated ? { lastModified: updated } : {}),
  });

  return [
    ...STATIC_PATHS.map((p) => entry(p)),
    ...tools.map((t) => entry(`/tools/${t.slug}`, t.updated_at)),
    // listAllContent is the editor's list; staff RLS aside, only published rows belong here.
    ...content
      .filter((c) => c.status === "published")
      .map((c) => entry(contentHref(c.type, c.slug), c.updated_at)),
    ...walkthroughs.map((w) => entry(`/walkthroughs/${w.slug}`, w.updated_at)),
    ...collections.map((c) => entry(`/collections/${c.slug}`, c.created_at)),
    ...comparisons.map((c) => entry(`/compare/${c.slug}`, c.updated_at)),
  ];
}
