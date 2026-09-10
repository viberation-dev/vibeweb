import {
  IconArrowRight,
  IconArrowUpRight,
  IconBook2,
  IconCoin,
  IconCompass,
  IconLayoutGrid,
  IconPlug,
  IconRocket,
  IconWand,
} from "@tabler/icons-react";
import Link from "next/link";

import { AnnouncementChip } from "@/components/features/marketing/AnnouncementChip";
import { FeatureCard } from "@/components/features/marketing/FeatureCard";
import { NewsletterForm } from "@/components/features/marketing/NewsletterForm";
import { ProductPanel } from "@/components/features/marketing/ProductPanel";
import { CategoryIcon } from "@/components/features/tools/CategoryIcon";
import { Badge } from "@/components/ui/badge";
import { ButtonIcon, buttonVariants } from "@/components/ui/button";
import { readingMinutes } from "@/lib/home-feed";
import { CONTENT_PILLARS } from "@/lib/learn";
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
  /** VIB-91's flag, resolved by the page — this component stays env-free. */
  newsletterEnabled: boolean;
};

/**
 * Marketing homepage — what a visitor sees at / (VIB-77, restyled to v3
 * under VIB-98).
 *
 * Signed-in users get the app shell instead; that branch lives in the page.
 * This is the only screen besides the Learn hub where the motion treatment
 * applies (handoff §4), and it is CSS-only — see `.reveal` in globals.css.
 * v3's design assumed a JavaScript reveal; the repo already had this and it
 * is better, so the existing utilities stand.
 *
 * Every number here is still queried. The v3 mockup hardcodes 46 tools / 13
 * categories / 6 pillars; a hero stat that contradicts the directory one
 * click away is worse than no stat at all, so the counts stay derived
 * (VIB-98 constraint 1).
 */
export function MarketingHome({
  toolCount,
  previewTools,
  collections,
  collectionCounts,
  latest,
  flagship,
  newsletterEnabled,
}: Props) {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 pb-10">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="reveal grid items-center gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:py-20">
        <div>
          <AnnouncementChip badge="New" href="/tools">
            All {TOOL_CATEGORIES.length} categories, retagged
          </AnnouncementChip>

          {/*
            Capped at 60px, not v3's 80px: the display size has to fit the
            *column*, not the viewport, and "Ship what matters." wraps to a
            third line above this in a 578px hero column.
          */}
          <h1 className="font-heading mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Build with AI.
            <br />
            <span className="text-primary">Ship what matters.</span>
          </h1>

          <p className="text-muted-foreground mt-6 text-lg">
            A curated directory of AI coding tools, role-aware guides, and
            step-by-step wizards — for beginner and intermediate vibe coders.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className={buttonVariants({ variant: "pill", size: "pill" })}
            >
              <ButtonIcon>
                <IconArrowUpRight />
              </ButtonIcon>
              Get started — it&rsquo;s free
            </Link>
            <Link
              href="/tools"
              className={buttonVariants({ variant: "pill-soft", size: "pill" })}
            >
              <ButtonIcon tone="on-soft">
                <IconCompass />
              </ButtonIcon>
              Browse the directory
            </Link>
          </div>

          <p className="text-muted-foreground mt-6 text-[0.9375rem]">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground font-bold hover:text-primary">
              Sign in
            </Link>
          </p>
        </div>

        {/*
          v3 puts the product where demo5 puts an illustration, and lists a
          separate browser-chrome "product preview" section further down. They
          are the same mock, so it is drawn once, here, rather than twice.
        */}
        {previewTools.length ? (
          <ProductPanel
            tools={previewTools}
            categoryCount={TOOL_CATEGORIES.length}
          />
        ) : null}
      </section>

      {/* ── Feature cards — exactly one filled ───────────────────────── */}
      <Section>
        <ul className="grid gap-5 md:grid-cols-3">
          <FeatureCard
            tone="filled"
            icon={<IconLayoutGrid aria-hidden />}
            title="Find the right tool in minutes."
            points={[
              `${toolCount} tools, ${TOOL_CATEGORIES.length} categories`,
              "Tagged by what a thing is, not what it's for",
              "Affiliate-transparent",
            ]}
            cta="Explore the directory"
            href="/tools"
          />
          <FeatureCard
            icon={<IconBook2 aria-hidden />}
            title="Stop reading tutorials that skip steps."
            points={[
              `${CONTENT_PILLARS.length} pillars, level-gated`,
              "Copy-paste prompts",
              "Beginner and intermediate tracks",
            ]}
            cta="Open the Learn hub"
            href="/learn"
          />
          <FeatureCard
            icon={<IconWand aria-hidden />}
            title="Get to a live URL this week."
            points={[
              flagship
                ? `${flagship.steps.length} guided steps`
                : "A guided walkthrough",
              /*
                v3 says progress "saves as you go". The app deliberately does
                not autosave — browsing a wizard must not overwrite real
                progress — so that line is not reproduced (VIB-98 constraint 3).
              */
              "Copyable prompts at every step",
              "No experience assumed",
            ]}
            cta="Start the wizard"
            href={flagship ? `/wizards/${flagship.slug}` : "/wizards"}
          />
        </ul>
      </Section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <Section>
        <div className="bg-secondary grid grid-cols-2 gap-6 rounded-2xl p-8 text-center lg:grid-cols-4 lg:p-11">
          <Stat value={String(toolCount)} label="tools catalogued" />
          <Stat
            value={String(TOOL_CATEGORIES.length)}
            label="categories"
          />
          <Stat
            value={String(CONTENT_PILLARS.length)}
            label="learning pillars"
          />
          <Stat value="Free" label="to get started" accent />
        </div>
        <p className="text-muted-foreground mt-5 text-center text-sm">
          Everything above is free to browse. No card, no trial clock, no gated
          directory.
        </p>
      </Section>

      {/* ── Categories ───────────────────────────────────────────────── */}
      <Section>
        <SectionHead
          eyebrow="The taxonomy"
          title={`${TOOL_CATEGORIES.length} categories. Zero fluff.`}
          lede="Sorted by what a thing is, not what it's for. Use cases live as tags, so one tool can serve many."
          action={{ label: "View all tools", href: "/tools" }}
        />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {TOOL_CATEGORIES.map((category) => (
            <li key={category.value}>
              <Link
                href={toolsHref({ category: category.value })}
                className="bg-secondary hover:bg-accent flex items-center gap-3 rounded-xl px-5 py-4 transition-all hover:-translate-y-0.5"
              >
                <span className="bg-card text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <CategoryIcon category={category.value} className="size-5" />
                </span>
                <span className="truncate text-[0.95rem] font-semibold">
                  {category.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Collections ──────────────────────────────────────────────── */}
      {collections.length ? (
        <Section>
          <SectionHead
            eyebrow="Expert curation"
            title="Curated collections"
            action={{ label: "View all", href: "/collections" }}
          />
          <ul className="grid gap-5 md:grid-cols-3">
            {collections.map((collection, i) => (
              <li key={collection.id}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="motion-lift bg-secondary flex h-full flex-col overflow-hidden rounded-2xl"
                >
                  {/*
                    v3 uses colour fields where a cover image would go. There
                    is no cover art and no `image` column, so the field is the
                    design rather than a placeholder for one.
                  */}
                  <span
                    className={`relative flex aspect-[16/9] items-center justify-center ${COVER_TONES[i % COVER_TONES.length]}`}
                  >
                    {(() => {
                      const Glyph = COVER_GLYPHS[i % COVER_GLYPHS.length];
                      return <Glyph aria-hidden className="size-10 opacity-90" />;
                    })()}
                    {/*
                      Bordered rather than tinted. v3 darkens this chip with a
                      translucent black, which on the blue cover drags the
                      fill under its own ink label — 3.76:1. The three covers
                      have opposite polarity (ink on blue and lime, paper on
                      deep), so no single tint helps all three. With no fill
                      the label keeps the cover's own on-colour pairing, which
                      is AA by construction.
                    */}
                    <span className="absolute top-4 right-4 rounded-full border border-current/40 px-3 py-0.5 font-mono text-xs">
                      {collectionCounts.get(collection.id) ?? 0} tools
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col p-6">
                    <span className="font-heading text-lg font-semibold tracking-tight">
                      {collection.title}
                    </span>
                    {collection.description ? (
                      <span className="text-muted-foreground mt-2 text-sm">
                        {collection.description}
                      </span>
                    ) : null}
                    <span className="text-primary mt-auto pt-5 text-sm font-semibold">
                      Browse collection →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* ── Learn ────────────────────────────────────────────────────── */}
      {latest.length ? (
        <Section>
          <SectionHead
            eyebrow="Resources"
            title="From the Learn hub"
            action={{ label: "See all articles", href: "/learn" }}
          />
          <ul className="grid gap-4 md:grid-cols-2">
            {latest.map((item) => {
              const minutes = readingMinutes(item.body);
              return (
                <li key={item.id}>
                  <Link
                    href={`/learn/${item.slug}`}
                    className="motion-lift bg-secondary flex h-full items-start gap-5 rounded-2xl p-6"
                  >
                    <span className="bg-card text-primary flex size-13 shrink-0 items-center justify-center rounded-2xl">
                      <IconBook2 aria-hidden className="size-6" />
                    </span>
                    <span className="min-w-0">
                      <span className="font-heading block text-lg font-semibold tracking-tight">
                        {item.title}
                      </span>
                      <span className="mt-2.5 flex flex-wrap items-center gap-2.5">
                        {item.role_level ? (
                          <Badge variant="outline" className="capitalize">
                            {item.role_level}
                          </Badge>
                        ) : null}
                        {/*
                          The mockup puts an author byline here ("Alex R."),
                          and `content` has no author column — so there is
                          nobody to name. Read time is real and stands in
                          its place.
                        */}
                        {minutes ? (
                          <span className="text-muted-foreground text-sm">
                            {minutes} min read
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}

      {/* ── Proof ────────────────────────────────────────────────────── */}
      <Section>
        {/*
          v3 runs this as three customer testimonials — quoted, with names and
          cities. Maya, Tyler and Rachel are §03 *personas*: fictional
          composites written to guide design, not customers who said anything.
          Publishing invented quotes as social proof on a live marketing page
          would be fabricated, so the same three cards state who the product
          is for, in the third person, with no quote marks and no attribution
          (VIB-98 constraint 2). Swap in real quotes when there are real users
          to quote.

          The "deep" surface: this repo has no --deep token (that was in the
          superseded handoff CSS). In v3's own dark theme --deep equals the
          surface colour, so the dark chapter only exists in light mode —
          which is exactly what these two utilities say.
        */}
        <div className="bg-foreground text-background dark:bg-secondary dark:text-foreground rounded-3xl p-9 lg:p-14">
          {/*
            v3 sets both of these in lime *text*. --highlight is a fill-only
            colour (VIB-99) and the repo enforces that in every existing use,
            so the accent arrives as a fill instead: a marker behind ink.
            That is the v2 lime-marker gesture the decision log records as
            dropped-but-reversible — reversed here, because it is the one way
            to get lime into this block without making it a text colour.
          */}
          <p className="flex items-center gap-2.5 text-xs font-semibold tracking-widest uppercase opacity-80">
            <span aria-hidden className="bg-highlight h-0.5 w-5 rounded-full" />
            Who it&rsquo;s for
          </p>
          <h2 className="font-heading mt-4 text-3xl font-semibold tracking-tight lg:text-4xl">
            Built for real builders,{" "}
            <span className="bg-highlight text-highlight-foreground rounded-md px-2 py-0.5 decoration-clone">
              at every level.
            </span>
          </h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {AUDIENCES.map((audience) => (
              <li
                key={audience.tier}
                className="rounded-2xl border border-current/15 bg-current/5 p-6"
              >
                <span className="text-xs font-bold tracking-widest uppercase opacity-70">
                  {audience.tier}
                </span>
                <h3 className="font-heading mt-3 text-lg font-semibold tracking-tight">
                  {audience.headline}
                </h3>
                <p className="mt-2 text-sm opacity-80">{audience.blurb}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ── Flagship wizard band ─────────────────────────────────────── */}
      {flagship ? (
        <Section>
          <div className="bg-highlight text-highlight-foreground grid items-center gap-10 rounded-3xl p-9 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:p-14">
            <div>
              <p className="flex items-center gap-2.5 text-xs font-semibold tracking-widest uppercase">
                <span
                  aria-hidden
                  className="bg-highlight-foreground h-0.5 w-5 rounded-full"
                />
                Flagship wizard
              </p>
              <h2 className="font-heading mt-4 text-3xl font-semibold tracking-tight lg:text-4xl">
                {flagship.title}
              </h2>
              <p className="mt-4 text-lg opacity-75">
                A guided {flagship.steps.length}-step walkthrough, ending with
                something real on the internet. Copyable prompts at every step.
              </p>
              <ul className="mt-7 flex flex-wrap gap-x-7 gap-y-2.5 border-t border-current/20 pt-6">
                {flagship.steps.map((step, i) => (
                  <li key={step.title} className="text-[0.95rem] font-semibold">
                    <span className="mr-2 font-mono text-xs opacity-75">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {step.title}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Link
                href={`/wizards/${flagship.slug}`}
                className={buttonVariants({
                  size: "pill",
                  className:
                    "bg-foreground text-background hover:bg-foreground/90",
                })}
              >
                <ButtonIcon className="bg-highlight text-highlight-foreground">
                  <IconArrowUpRight />
                </ButtonIcon>
                Start the wizard
              </Link>
              {/*
                v3 adds "you can stop anywhere", which reads as a promise to
                remember where you stopped. The app does not autosave, so the
                line is left out rather than reworded into the same claim.
              */}
              <p className="mt-4 text-sm opacity-70">Free to run.</p>
            </div>
          </div>
        </Section>
      ) : null}

      {/* ── Closing capture ──────────────────────────────────────────── */}
      <Section>
        <div className="bg-secondary rounded-3xl p-9 text-center lg:p-14">
          <h2 className="font-heading text-3xl font-semibold tracking-tight lg:text-4xl">
            Start building.{" "}
            <span className="text-primary">Stop second-guessing.</span>
          </h2>
          {newsletterEnabled ? (
            <>
              {/*
                VIB-91's flag, already shipped with a server action. v3 draws a
                new form; there was no need to build one.
              */}
              <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
                Weekly curation of the AI tools and walkthroughs worth your
                time.
              </p>
              <NewsletterForm />
            </>
          ) : (
            <>
              <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
                Create a free account to save tools, track what you have read,
                and run the wizard at your own pace.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/signup"
                  className={buttonVariants({ variant: "pill", size: "pill" })}
                >
                  <ButtonIcon>
                    <IconArrowUpRight />
                  </ButtonIcon>
                  Get started — it&rsquo;s free
                </Link>
                <Link
                  href="/learn"
                  className={buttonVariants({
                    variant: "pill-soft",
                    size: "pill",
                    /* This block is already --secondary, so the soft pill
                       lifts to --card and its badge drops back to
                       --secondary. Left at the defaults the badge and the
                       button are the same colour and it disappears. */
                    className: "bg-card hover:bg-accent",
                  })}
                >
                  <ButtonIcon tone="on-soft" className="bg-secondary">
                    <IconArrowRight />
                  </ButtonIcon>
                  Read the guides
                </Link>
              </div>
            </>
          )}
          <p className="text-muted-foreground mt-5 text-sm">
            No account required to browse the directory.
          </p>
        </div>
      </Section>
    </main>
  );
}

/**
 * Collection cover fields, cycling. `deep` is the third tone in v3; here it
 * follows the same light-only rule as the proof block.
 */
const COVER_GLYPHS = [IconRocket, IconCoin, IconPlug] as const;

const COVER_TONES = [
  "bg-primary text-primary-foreground",
  "bg-highlight text-highlight-foreground",
  "bg-foreground text-background dark:bg-card dark:text-foreground",
] as const;

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

function SectionHead({
  eyebrow,
  title,
  lede,
  action,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-7">
      <div>
        <p className="text-primary flex items-center gap-2.5 text-xs font-semibold tracking-widest uppercase">
          <span aria-hidden className="bg-primary h-0.5 w-5 rounded-full" />
          {eyebrow}
        </p>
        <h2 className="font-heading mt-3.5 text-3xl font-semibold tracking-tight lg:text-4xl">
          {title}
        </h2>
        {lede ? (
          <p className="text-muted-foreground mt-3.5 max-w-[56ch] text-lg">
            {lede}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="text-primary flex shrink-0 items-center gap-2 text-[0.9375rem] font-semibold hover:underline"
        >
          {action.label}
          <IconArrowRight aria-hidden className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p
        className={`font-heading text-4xl font-bold tracking-tight lg:text-5xl ${accent ? "text-primary" : ""}`}
      >
        {value}
      </p>
      <p className="text-muted-foreground mt-2.5 text-sm">{label}</p>
    </div>
  );
}
