import { siteUrl } from "@/lib/site-url";

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
