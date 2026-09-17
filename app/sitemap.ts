import type { MetadataRoute } from "next";

import { createClient } from "@/lib/integrations/supabase/server";
import { contentHref } from "@/lib/learn";
import { listCollections } from "@/lib/queries/collections";
import { listAllContent } from "@/lib/queries/content";
import { listAllTools } from "@/lib/queries/tools";
import { listWalkthroughs } from "@/lib/queries/walkthroughs";
import { siteUrl } from "@/lib/site-url";

const STATIC_PATHS = [
  "",
  "/tools",
  "/skills",
  "/learn",
  "/walkthroughs",
  "/collections",
  "/blog",
  "/docs",
  "/changelog",
  "/privacy",
  "/terms",
];

// Regenerated at most hourly rather than on every crawler hit.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const [tools, content, walkthroughs, collections] = await Promise.all([
    listAllTools(supabase),
    listAllContent(supabase),
    listWalkthroughs(supabase),
    listCollections(supabase),
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
  ];
}
