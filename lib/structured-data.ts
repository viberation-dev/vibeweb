import type { Tool } from "@/lib/queries/tools";
import { safeOutboundUrl } from "@/lib/outbound";
import { siteUrl } from "@/lib/site-url";
import { toolCategoryLabel } from "@/lib/tool-categories";
import { hasFreeTier } from "@/lib/tool-facts";
import { TOOL_PLATFORMS } from "@/lib/tool-platforms";

/**
 * schema.org JSON-LD builders (VIB-183).
 *
 * Search engines use these for rich results; AI answer engines use them to
 * tell a tool page from an article from a how-to. Each page renders its own
 * with <JsonLd>; the Organization and WebSite nodes live in the root layout.
 */

type Crumb = { name: string; path: string };

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.path}`,
    })),
  };
}

/**
 * One directory entry as schema.org SoftwareApplication (VIB-183, fixed in
 * VIB-186).
 *
 * Google needs **two** of offers / aggregateRating / applicationCategory /
 * operatingSystem before the item is eligible for rich results, and we were
 * sending only the category. The other two we can state truthfully come from
 * columns: the platforms the row lists, and a zero-price offer when the
 * pricing tier really does include a free tier.
 *
 * A tool with neither stays ineligible, and that is the right outcome: an
 * invented operating system would pass the test by lying to every reader the
 * markup exists for.
 */
export function softwareApplicationLd(tool: Tool) {
  const operatingSystem = TOOL_PLATFORMS.filter((p) => tool.platform.includes(p.value))
    .map((p) => p.label)
    .join(", ");

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.tagline ?? tool.description ?? undefined,
    applicationCategory: toolCategoryLabel(tool.category),
    url: safeOutboundUrl(tool.outbound_url) ?? `${siteUrl}/tools/${tool.slug}`,
    ...(operatingSystem ? { operatingSystem } : {}),
    ...(hasFreeTier(tool.pricing_tier)
      ? { offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }
      : {}),
  };
}

export const siteLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Viberation",
    url: siteUrl,
    logo: `${siteUrl}/opengraph-image`,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "Viberation",
    url: siteUrl,
    publisher: { "@id": `${siteUrl}/#organization` },
  },
];

/**
 * A plain-text summary of an authored body for `description` fields: the
 * first paragraph, Markdown markers stripped, cut at a word near 160 chars.
 */
export function plainSummary(body: string | null, max = 160): string | undefined {
  const para = body
    ?.split(/\n\s*\n/)
    .map((p) => p.replace(/^#+\s*/gm, "").replace(/[*_`>]/g, "").trim())
    .find(Boolean);
  if (!para) return undefined;
  if (para.length <= max) return para;
  return `${para.slice(0, para.lastIndexOf(" ", max))}…`;
}
