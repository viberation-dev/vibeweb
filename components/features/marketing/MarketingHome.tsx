import { IconBook2, IconLayoutGrid, IconWand } from "@tabler/icons-react";
import Link from "next/link";

import { CategoryIcon } from "@/components/features/tools/CategoryIcon";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { readingMinutes } from "@/lib/home-feed";
import type { Collection } from "@/lib/queries/collections";
import type { Content } from "@/lib/queries/content";
import type { Tool } from "@/lib/queries/tools";
import type { Wizard } from "@/lib/queries/wizards";
import { TOOL_CATEGORIES } from "@/lib/tool-categories";
import { toolsHref } from "@/lib/tools-url";

type Props = {
  toolCount: number;
  previewTools: Tool[];
  collections: Collection[];
  collectionCounts: Map<string, number>;
  latest: Content[];
  flagship: Wizard | undefined;
};

/**
 * Marketing homepage — what a visitor sees at / (VIB-77, mockup screen 1).
 *
 * Signed-in users get the app shell instead; that branch lives in the page.
 * This is the only screen besides the Learn hub where the motion treatment
 * applies (handoff §4), and it is CSS-only — see `.reveal` in globals.css.
 *
 * Every number here is queried. The mockup's "46+ tools" predates the seed,
 * and a hero stat that contradicts the directory one click away is worse
 * than no stat at all.
 */
export function MarketingHome({
  toolCount,
  previewTools,
  collections,
  collectionCounts,
  latest,
  flagship,
}: Props) {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <section className="reveal py-14 text-center">
        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          The operating system for vibe coders
        </p>
        <h1 className="font-heading mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Build with AI.{" "}
          <span className="text-primary">Ship what matters.</span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
          A curated directory of AI coding tools, role-aware guides, and
          step-by-step wizards — for beginner and intermediate vibe coders.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/signup" className={buttonVariants({ size: "lg" })}>
            Get started — it&rsquo;s free
          </Link>
          <Link
            href="/tools"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            Browse the directory
          </Link>
        </div>
      </section>

      {/*
        Product preview. Real rows rather than a screenshot, so it cannot go
        stale against the directory it is previewing — and it stays legible
        in both themes, which a baked-in image would not.
      */}
      {previewTools.length ? (
        <section aria-label="Product preview" className="reveal">
          <div className="bg-muted/40 overflow-hidden rounded-xl border">
            <div className="flex items-center gap-2 border-b px-4 py-2.5">
              <span aria-hidden className="flex gap-1.5">
                <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
                <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
                <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
              </span>
              <span className="text-muted-foreground mx-auto text-xs">
                viberation.dev/tools
              </span>
            </div>
            <div className="p-4">
              <ul className="flex flex-wrap gap-1.5">
                {TOOL_CATEGORIES.slice(0, 6).map((category) => (
                  <li key={category.value}>
                    <Badge variant="secondary">{category.label}</Badge>
                  </li>
                ))}
                <li>
                  <Badge variant="outline">+{TOOL_CATEGORIES.length - 6}</Badge>
                </li>
              </ul>
              <ul className="mt-3 grid gap-3 sm:grid-cols-3">
                {previewTools.map((tool) => (
                  <li
                    key={tool.id}
                    className="bg-background rounded-lg border p-3"
                  >
                    <p className="text-sm font-medium">{tool.name}</p>
                    <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                      {tool.tagline}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-muted-foreground mt-3 text-center text-sm">
            Free to browse — no account needed.
          </p>
        </section>
      ) : null}

      <Section className="grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
        <Stat value={String(toolCount)} label="tools catalogued" />
        <Stat value={String(TOOL_CATEGORIES.length)} label="categories" />
        <Stat value={flagship ? "1" : "0"} label="flagship wizard" />
        <Stat value="Free" label="to get started" />
      </Section>

      <Section>
        <Heading
          title="Everything you need to ship. Nothing you don't."
          sub="Three modules that cover the full vibe-coding workflow."
        />
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          <Module
            icon={
              <IconLayoutGrid aria-hidden className="text-primary size-6" />
            }
            title="Directory"
            href="/tools"
            blurb={`${toolCount} tools across ${TOOL_CATEGORIES.length} categories — tagged, vetted, affiliate-transparent.`}
          />
          <Module
            icon={<IconBook2 aria-hidden className="text-primary size-6" />}
            title="Learn"
            href="/learn"
            blurb="Role-aware guides and walkthroughs — beginner content stays separate from advanced."
          />
          <Module
            icon={<IconWand aria-hidden className="text-primary size-6" />}
            title="Wizard"
            href="/wizards"
            blurb="A guided walkthrough from idea to a live URL, with copyable prompts at each step."
          />
        </ul>
      </Section>

      <Section>
        <Heading
          title={`${TOOL_CATEGORIES.length} categories. Zero fluff.`}
          sub="Every tool vetted, tagged, and placed — so you spend time building, not searching."
        />
        <ul className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
          {TOOL_CATEGORIES.map((category) => (
            <li key={category.value}>
              <Link
                href={toolsHref({ category: category.value })}
                className="hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5 flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center text-xs transition-all"
              >
                <CategoryIcon category={category.value} className="size-4" />
                {category.label}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {collections.length ? (
        <Section>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <Heading
              eyebrow="Expert curation"
              title="Curated collections"
              align="left"
            />
            <Link href="/collections" className="text-sm hover:underline">
              View all →
            </Link>
          </div>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {collections.map((collection) => (
              <li key={collection.id}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="hover:bg-muted/40 block h-full rounded-xl border p-5 transition-all hover:-translate-y-0.5"
                >
                  <Badge variant="secondary">
                    {collectionCounts.get(collection.id) ?? 0} tools
                  </Badge>
                  <h3 className="font-heading mt-3 font-medium">
                    {collection.title}
                  </h3>
                  {collection.description ? (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {collection.description}
                    </p>
                  ) : null}
                  <p className="text-primary mt-3 text-sm">Browse →</p>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {latest.length ? (
        <Section>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <Heading eyebrow="Latest" title="From the Learn hub" align="left" />
            <Link href="/learn" className="text-sm hover:underline">
              See all →
            </Link>
          </div>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {latest.map((item) => {
              const minutes = readingMinutes(item.body);
              return (
                <li key={item.id}>
                  <Link
                    href={`/learn/${item.slug}`}
                    className="hover:bg-muted/40 block h-full rounded-xl border p-5 transition-all hover:-translate-y-0.5"
                  >
                    {item.role_level ? (
                      <Badge variant="outline" className="capitalize">
                        {item.role_level}
                      </Badge>
                    ) : null}
                    <h3 className="font-heading mt-3 font-medium">
                      {item.title}
                    </h3>
                    {/*
                      The mockup puts an author byline here ("Alex R."), and
                      `content` has no author column — so there is nobody to
                      name. Read time is real and stands in its place.
                    */}
                    {minutes ? (
                      <p className="text-muted-foreground mt-1 text-sm">
                        {minutes} min read
                      </p>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}

      <Section>
        {/*
          The mockup runs this as three customer testimonials — quoted, with
          names and cities. Maya, Tyler and Rachel are §03 *personas*:
          fictional composites written to guide design, not customers who
          said anything. Publishing invented quotes as social proof on a live
          marketing page would be fabricated, so the same three cards state
          who the product is for, in the third person, with no quote marks
          and no attribution. Swap in real quotes when there are real users
          to quote.
        */}
        <Heading
          title="Built for real builders."
          sub="Whether you're shipping your first project or refining a production codebase."
        />
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {AUDIENCES.map((audience) => (
            <li key={audience.tier} className="rounded-xl border p-5">
              <Badge variant="outline">{audience.tier}</Badge>
              <h3 className="font-heading mt-3 font-medium">
                {audience.headline}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {audience.blurb}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {flagship ? (
        <Section>
          <div className="bg-muted/40 flex flex-wrap items-center justify-between gap-6 rounded-xl border p-8">
            <div>
              <Badge variant="secondary">Flagship wizard</Badge>
              <h2 className="font-heading mt-3 text-2xl font-semibold">
                {flagship.title}
              </h2>
              <p className="text-muted-foreground mt-2 max-w-xl">
                A guided {flagship.steps.length}-step walkthrough, ending with
                something real on the internet.
              </p>
              <p className="text-muted-foreground mt-3 text-sm">
                {flagship.steps
                  .map((step, i) => `${i + 1} ${step.title}`)
                  .join("  →  ")}
              </p>
            </div>
            <Link
              href={`/wizards/${flagship.slug}`}
              className={buttonVariants({ size: "lg" })}
            >
              Start the wizard
            </Link>
          </div>
        </Section>
      ) : null}

      <Section className="text-center">
        {/*
          The mockup ends on a newsletter capture — an email field and a
          Subscribe button. There is no subscribers table, so that form would
          have nowhere to put an address, and a field that silently discards
          what you type is worse than no field. Tracked separately; the slot
          keeps its job as the closing conversion until then.
        */}
        <h2 className="font-heading text-3xl font-semibold tracking-tight">
          Start building.{" "}
          <span className="text-primary">Stop second-guessing.</span>
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl">
          Create a free account to save tools, track what you have read, and run
          the wizard at your own pace.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/signup" className={buttonVariants({ size: "lg" })}>
            Get started — it&rsquo;s free
          </Link>
          <Link
            href="/learn"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            Read the guides
          </Link>
        </div>
        <p className="text-muted-foreground mt-4 text-sm">
          No account required to browse the directory.
        </p>
      </Section>
    </main>
  );
}

/**
 * §03's three personas, stated as audiences rather than quoted as customers.
 * US-first, revised 2026-08-26 — these replace the Zara/Hassan/Amara set
 * still baked into the mockup file.
 */
const AUDIENCES = [
  {
    tier: "Beginner",
    headline: "Three weeks in, and the tutorials skip steps",
    blurb:
      "Plain-English explanations of context windows, tokens and system prompts — without the condescension — plus prompts you can actually copy.",
  },
  {
    tier: "Intermediate",
    headline: "Shipping already, but the process feels chaotic",
    blurb:
      "Context engineering, project structure and prompt templates you can clone, for people who do not need the fundamentals re-explained.",
  },
  {
    tier: "Founder",
    headline: "A validated idea and no coding background",
    blurb:
      "Curated tools with honest tradeoffs, and a step-by-step path from idea to a deployed MVP framed around business outcomes.",
  },
] as const;

function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`reveal mt-20 ${className ?? ""}`}>{children}</section>
  );
}

function Heading({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center" : undefined}>
      {eyebrow ? (
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-heading mt-1 text-3xl font-semibold tracking-tight">
        {title}
      </h2>
      {sub ? (
        <p
          className={`text-muted-foreground mt-2 text-lg ${align === "center" ? "mx-auto max-w-2xl" : ""}`}
        >
          {sub}
        </p>
      ) : null}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-heading text-primary text-4xl font-semibold">
        {value}
      </p>
      <p className="text-muted-foreground mt-1 text-sm">{label}</p>
    </div>
  );
}

function Module({
  icon,
  title,
  blurb,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  href: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="hover:bg-muted/40 block h-full rounded-xl border p-6 transition-all hover:-translate-y-0.5"
      >
        {icon}
        <h3 className="font-heading mt-3 text-lg font-medium">{title}</h3>
        <p className="text-muted-foreground mt-1">{blurb}</p>
      </Link>
    </li>
  );
}
