/**
 * The tool detail rail's yes/no facts (VIB-81, mockup screen 4).
 *
 * Pure and alias-free so it runs under plain `node --test`. These are
 * claims about real products shown as bare "Yes"/"No", so getting them from
 * the wrong field is not a cosmetic bug.
 *
 * The first attempt read both off the `free-tier` and `open-source` tags,
 * which the preview showed to be wrong at scale: tags are partial curation,
 * not a complete field. Measured against the seed on 2026-09-02 —
 *
 *   free-tier tag:   3 of 10 Freemium tools untagged, and all 10
 *                    "Open source" priced tools untagged → 13 of 26 tools
 *                    would have claimed "Free tier: No" incorrectly.
 *   open-source tag: 9 of the 10 "Open source" priced tools tagged, so one
 *                    would have claimed "Open source: No" about itself.
 *
 * `pricing_tier` is set on every row, so it is what these read from.
 */

/** The values `tools.pricing_tier` actually holds. */
export type PricingTier = "Free" | "Freemium" | "Open source" | "Paid" | (string & {});

/**
 * Whether someone can use this without paying.
 *
 * Everything except "Paid" has a free tier by definition — "Freemium" says
 * so in the word, and open-source tools are free to run. An unrecognised or
 * missing value answers No: claiming something is free is the direction
 * that costs a reader money to discover is wrong.
 */
export function hasFreeTier(pricingTier: string | null): boolean {
  return pricingTier === "Free" || pricingTier === "Freemium" || pricingTier === "Open source";
}

/**
 * Whether the source is open.
 *
 * The union of both signals on purpose. `pricing_tier` is authoritative for
 * the pricing model but misses a tool that is open source *and* priced
 * "Free"; the tag catches those. One row in the current seed needs each
 * half, so neither alone is enough.
 */
export function isOpenSource(pricingTier: string | null, tagSlugs: Iterable<string>): boolean {
  if (pricingTier === "Open source") return true;
  for (const slug of tagSlugs) {
    if (slug === "open-source") return true;
  }
  return false;
}
