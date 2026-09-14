/**
 * Which tags a Hosting card shows, most useful first (VIB-141).
 *
 * Tags come back alphabetical, which put "Backend" on every host's card.
 * Someone choosing a host asks what it runs first (a VPS, containers, a
 * static site), then whether their framework works, then the extras.
 * Tags not listed here still show on the tool page, just not the card.
 */
export const HOSTING_CARD_TAGS = [
  "vps",
  "wordpress",
  "containers",
  "serverless",
  "static-sites",
  "nextjs",
  "react",
  "database",
  "email",
  "cloud",
  "linux",
] as const;

/** Tags beyond the pricing badges, so a card stays one or two lines. */
const MAX_CARD_TAGS = 4;

/**
 * Badges for a Hosting card: the pricing tier, "Free trial" when it has one,
 * then its most useful tags by display name.
 */
export function hostingCardBadges(
  pricingTier: string | null,
  tags: ReadonlyArray<{ slug: string; name: string }>,
): string[] {
  const bySlug = new Map(tags.map((tag) => [tag.slug, tag.name]));
  const picked = HOSTING_CARD_TAGS.filter((slug) => bySlug.has(slug))
    .slice(0, MAX_CARD_TAGS)
    .map((slug) => bySlug.get(slug)!);

  return [
    ...(pricingTier ? [pricingTier] : []),
    ...(bySlug.has("free-trial") ? ["Free trial"] : []),
    ...picked,
  ];
}
