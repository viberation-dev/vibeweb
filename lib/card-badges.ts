/**
 * Which tags a directory card shows, most useful first, per category
 * (VIB-141, VIB-142).
 *
 * Tags come back alphabetical, which put "Backend" on every host's card.
 * Each list is ordered by the question a reader asks first: for a host,
 * what it runs; for an app builder, what it builds and whether you keep
 * the code. Tags not listed still show on the tool page, just not the card.
 * A category with no list keeps the default card.
 */
export const CARD_TAGS: Readonly<Record<string, readonly string[]>> = {
  hosting: [
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
  ],
  app_builders: [
    "web-apps",
    "mobile-apps",
    "websites",
    "no-code",
    "code-export",
    "github-sync",
    "nextjs",
    "react",
    "react-native",
    "flutter",
    "database",
  ],
  // Every IDE has an agent now, so the card shows what separates them:
  // the editor it is built on, and whose models you can bring (VIB-143).
  ides: [
    "vs-code-based",
    "jetbrains",
    "mobile-apps",
    "byok",
    "local-models",
    "open-source",
  ],
  // What kind of CLI it is first (an agent, or a skills tool), then whose
  // models it runs (VIB-144).
  clis: [
    "coding-agent",
    "skills-ecosystem",
    "byok",
    "local-models",
    "open-source",
  ],
};

/** Tags beyond the pricing badges, so a card stays one or two lines. */
const MAX_CARD_TAGS = 4;

/**
 * Badges for a card in a category with a CARD_TAGS list: the pricing tier,
 * "Free trial" when it has one, then its most useful tags by display name.
 * Undefined for any other category.
 */
export function cardBadges(
  category: string,
  pricingTier: string | null,
  tags: ReadonlyArray<{ slug: string; name: string }>,
): string[] | undefined {
  const order = CARD_TAGS[category];
  if (!order) return undefined;

  const bySlug = new Map(tags.map((tag) => [tag.slug, tag.name]));
  const picked = order
    .filter((slug) => bySlug.has(slug))
    .slice(0, MAX_CARD_TAGS)
    .map((slug) => bySlug.get(slug)!);

  return [
    ...(pricingTier ? [pricingTier] : []),
    ...(bySlug.has("free-trial") ? ["Free trial"] : []),
    ...picked,
  ];
}
