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
  // Which kind of agent first, since that is the confusing part (VIB-145).
  agents: [
    "cloud-agent",
    "agent-framework",
    "opens-prs",
    "python",
    "typescript",
    "multi-agent",
    "byok",
    "open-source",
  ],
  // Who stands behind it, then the stack it assumes (VIB-146). The skill
  // category and chat-app compatibility come from columns, as `extra`.
  skills: [
    "official",
    "react",
    "nextjs",
    "react-native",
    "python",
    "dotnet",
    "go",
    "supabase",
    "postgres",
    "aws",
    "azure",
    "cloudflare",
    "vercel",
  ],
  // Who runs it, where it runs, and how it gets your permission (VIB-147).
  mcp_servers: [
    "official",
    "remote-mcp",
    "local-mcp",
    "oauth",
    "api-key",
    "read-only-mode",
  ],
  // A dead plugin first, then which editors it plugs into and whose models
  // it runs (VIB-148).
  plugins: [
    "no-longer-updated",
    "vs-code",
    "jetbrains",
    "byok",
    "local-models",
    "open-source",
  ],
  // The last seven (VIB-158). Models and chat apps: what they can make
  // beyond text, and whether a coding agent comes with them.
  models: ["coding-agent", "image-generation", "video-generation"],
  chats: ["coding-agent", "skills-ecosystem", "image-generation", "voice-mode"],
  // Frameworks and templates: what you build, then the stack.
  frameworks: ["agent-framework", "web-apps", "python", "typescript", "react", "open-source"],
  templates: ["web-apps", "design", "nextjs", "react", "typescript", "database", "open-source"],
  // Workflows: where it runs and whether you need code.
  workflows: ["self-hosted", "no-code", "automation"],
  // Tools: a mixed bag, so the job each one does.
  tools: [
    "database",
    "postgres",
    "design",
    "image-generation",
    "video-generation",
    "project-management",
    "team-chat",
    "open-source",
  ],
  // Utilities: skill sites first (selling, finding, checking), then the
  // developer services.
  utilities: [
    "sell-skills",
    "skills-ecosystem",
    "security-checks",
    "model-gateway",
    "email",
    "search",
    "self-hosted",
    "byok",
    "open-source",
  ],
};

/** Tags beyond the pricing badges, so a card stays one or two lines. */
const MAX_CARD_TAGS = 4;

/**
 * Badges for a card in a category with a CARD_TAGS list: the pricing tier,
 * "Free trial" when it has one, any `extra` labels derived from columns,
 * then its most useful tags by display name. Undefined for any other category.
 */
export function cardBadges(
  category: string,
  pricingTier: string | null,
  tags: ReadonlyArray<{ slug: string; name: string }>,
  extra: readonly string[] = [],
): string[] | undefined {
  const order = CARD_TAGS[category];
  if (!order) return undefined;

  const bySlug = new Map(tags.map((tag) => [tag.slug, tag.name]));
  const picked = order
    // A tool priced "Open source" would otherwise show it twice (VIB-144).
    .filter((slug) => bySlug.has(slug) && bySlug.get(slug) !== pricingTier)
    .slice(0, MAX_CARD_TAGS)
    .map((slug) => bySlug.get(slug)!);

  return [
    ...(pricingTier ? [pricingTier] : []),
    ...(bySlug.has("free-trial") ? ["Free trial"] : []),
    ...extra,
    ...picked,
  ];
}
