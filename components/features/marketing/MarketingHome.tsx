import {
  IconArrowRight,
  IconArrowUpRight,
  IconBook2,
  IconCheck,
  IconCoin,
  IconCompass,
  IconLayoutGrid,
  IconPlug,
  IconRocket,
  IconWand,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";

import { AnnouncementChip } from "@/components/features/marketing/AnnouncementChip";
import { FeatureCard } from "@/components/features/marketing/FeatureCard";
import { NewsletterForm } from "@/components/features/marketing/NewsletterForm";
import { ProductPanel } from "@/components/features/marketing/ProductPanel";
import { CategoryIcon } from "@/components/features/tools/CategoryIcon";
import { ButtonIcon, buttonVariants } from "@/components/ui/button";
import { readingMinutes } from "@/lib/home-feed";
import type { Collection } from "@/lib/queries/collections";
import type { Content } from "@/lib/queries/content";
import type { Testimonial } from "@/lib/queries/testimonials";
import type { Tool } from "@/lib/queries/tools";
import type { Wizard } from "@/lib/queries/wizards";
import { initialsFrom } from "@/lib/testimonials";
import { TOOL_CATEGORIES } from "@/lib/tool-categories";
import { toolsHref } from "@/lib/tools-url";

type Props = {
  previewTools: Tool[];
  collections: Collection[];
  collectionCounts: Map<string, number>;
  /** Per-category tool totals for the taxonomy tiles (VIB-101). */
  categoryCounts: Map<string, number>;
  /**
   * Published testimonials (VIB-102). Empty is the normal state until real
   * people have said something — the proof section falls back to describing
   * who the product is for rather than inventing quotes.
   */
  testimonials: Testimonial[];
  latest: Content[];
  flagship: Wizard | undefined;
  /** VIB-91's flag, resolved by the page — this component stays env-free. */
  newsletterEnabled: boolean;
};

/**
 * Marketing homepage — what a visitor sees at / (VIB-77, restyled to v3
 * under VIB-98, polished against the mockup under VIB-101).
 *
 * Signed-in users get the app shell instead; that branch lives in the page.
 * This is the only screen besides the Learn hub where the motion treatment
 * applies (handoff §4), and it is CSS-only — see `.reveal` in globals.css.
 *
 * Every number here is still queried, including the per-category tile totals.
 * The v3 mockup hardcodes 46 tools / 13 categories / 6 pillars; a number that
 * contradicts the directory one click away is worse than no number at all
 * (VIB-98 constraint 1).
 *
 * Type weight follows the mockup rather than the shadcn default: headings are
 * 700 and the hero is 800, where the shipped page had been 600 throughout.
 */
export function MarketingHome({
  previewTools,
  collections,
  collectionCounts,
  categoryCounts,
  testimonials,
  latest,
  flagship,
  newsletterEnabled,
}: Props) {
  return (
    <main className="mx-auto w-full max-w-[1320px] px-[clamp(1.25rem,4vw,3.75rem)] pb-12">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="reveal grid items-center gap-[clamp(2rem,5vw,4.5rem)] py-[clamp(3rem,7vw,6rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div>
          {/*
            The chip sells the walkthrough, not internal news (VIB-115): a
            visitor has no use for "categories retagged".
          */}
          {flagship ? (
            <AnnouncementChip badge="New" href={`/wizards/${flagship.slug}`}>
              {flagship.title} — free, guided, start to finish
            </AnnouncementChip>
          ) : null}

          {/*
            Capped at 60px, not v3's 80px: the display size has to fit the
            *column*, not the viewport, and the accent line wraps to a third
            line above this in a 578px hero column.
          */}
          <h1 className="font-heading mt-8 text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
            Ship your first app with AI.
            <br />
            <span className="text-primary">No guesswork. No hype.</span>
          </h1>

          <p className="text-muted-foreground mt-7 text-lg leading-relaxed">
            Viberation shows you which AI tools to use, what to type into them,
            and how to get your project live. Step by step, in plain English.
            No coding background needed.
          </p>

          {/*
            The walkthrough leads, not signup: reading it needs no account, so
            the first click costs nothing. Signing in is asked for only when
            someone saves progress (VIB-115).
          */}
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={flagship ? `/wizards/${flagship.slug}` : "/signup"}
              className={buttonVariants({ variant: "pill", size: "pill" })}
            >
              <ButtonIcon>
                <IconArrowUpRight />
              </ButtonIcon>
              {flagship ? "Start the free walkthrough" : "Get started — it’s free"}
            </Link>
            <Link
              href="/tools"
              className={buttonVariants({ variant: "pill-soft", size: "pill" })}
            >
              <ButtonIcon tone="on-soft">
                <IconCompass />
              </ButtonIcon>
              Find the right AI tool
            </Link>
          </div>

          <p className="text-muted-foreground mt-7 text-[0.9375rem]">
            Free to browse · No card · No sign-up to start
          </p>

          <p className="text-muted-foreground mt-2 text-[0.9375rem]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-foreground hover:text-primary font-bold"
            >
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
      <SectionTight>
        <ul className="grid gap-5 md:grid-cols-3">
          <FeatureCard
            tone="filled"
            icon={<IconLayoutGrid aria-hidden />}
            title="Know which tool to use."
            points={[
              "The whole AI coding toolkit, sorted by type",
              "Who each tool is really for",
              "Affiliate links always labelled",
            ]}
            cta="Compare the tools"
            href="/tools"
          />
          <FeatureCard
            icon={<IconBook2 aria-hidden />}
            title="Understand what you're doing."
            points={[
              "Plain-English guides that don't talk down",
              "Prompts you can copy and paste",
              "Tracks for beginners and for people already shipping",
            ]}
            cta="Start learning"
            href="/learn"
          />
          <FeatureCard
            icon={<IconWand aria-hidden />}
            title="Get it live this week."
            points={[
              "Idea to live URL, one step at a time",
              /*
                v3 says progress "saves as you go". The app deliberately does
                not autosave — browsing a wizard must not overwrite real
                progress — so that line is not reproduced (VIB-98 constraint 3).
              */
              "A copyable prompt at every step",
              "No coding experience assumed",
            ]}
            cta="Start the walkthrough"
            href={flagship ? `/wizards/${flagship.slug}` : "/wizards"}
          />
        </ul>
      </SectionTight>

      {/* ── How it works ─────────────────────────────────────────────── */}
      {/*
        Replaced "By the numbers" (VIB-115). Small true numbers on display
        read as a thin catalogue next to competitors' "1,000+". Headline copy
        carries no counts at all (Ali, 2026-09-11); the queried totals survive
        only as data labels on the category tiles and collection covers.
      */}
      <SectionTight>
        <SectionHead eyebrow="How it works" title="Idea in. Live project out." />
        <ol className="bg-secondary grid gap-8 rounded-[1.125rem] p-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-muted-foreground/25 lg:p-11">
          {STEPS.map((step, i) => (
            <li key={step.title} className="md:px-6">
              <span className="text-primary font-mono text-sm font-semibold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-heading mt-2 text-xl font-bold tracking-tight">
                {step.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {step.blurb}
              </p>
            </li>
          ))}
        </ol>
        <p className="text-muted-foreground mt-5 text-center text-sm">
          Everything is free to browse. No card, no trial clock, no locked
          directory.
        </p>
      </SectionTight>

      {/* ── Before / after ───────────────────────────────────────────── */}
      <Section>
        <SectionHead
          eyebrow="The difference"
          title="Same AI. Very different results."
        />
        <div className="grid gap-5 md:grid-cols-2">
          <ContrastList
            heading="Without a map"
            items={CONTRAST.map((row) => row.without)}
          />
          <ContrastList
            heading="With Viberation"
            items={CONTRAST.map((row) => row.with)}
            positive
          />
        </div>
      </Section>

      {/* ── Categories ───────────────────────────────────────────────── */}
      <Section>
        <SectionHead
          eyebrow="The directory"
          title="Every AI coding tool, sorted so you can choose."
          lede="Browse by type: models, IDEs, agents, MCP servers and more. Each tool says what it does and who it's best for."
          action={{ label: "View all tools", href: "/tools" }}
        />
        <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {TOOL_CATEGORIES.map((category) => (
            <li key={category.value}>
              <Link
                href={toolsHref({ category: category.value })}
                className="bg-secondary hover:bg-primary/10 flex items-center gap-3.5 rounded-2xl px-5 py-[1.125rem] transition-all hover:-translate-y-0.5"
              >
                <IconTile>
                  <CategoryIcon category={category.value} className="size-5" />
                </IconTile>
                <span className="truncate font-bold tracking-tight">
                  {category.label}
                </span>
                {/*
                  Real totals, queried per category. A tile promising 6 Models
                  that opens on 4 is worse than a tile with no number.
                */}
                <span className="text-muted-foreground ml-auto shrink-0 font-mono text-[0.8125rem]">
                  {categoryCounts.get(category.value) ?? 0}
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
            eyebrow="Collections"
            title="Starter stacks, already picked for you."
            lede="Hand-picked tool sets for common builds. Start from one instead of from zero."
            action={{ label: "View all", href: "/collections" }}
          />
          <ul className="grid gap-5 md:grid-cols-3">
            {collections.map((collection, i) => (
              <li key={collection.id}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="motion-lift bg-secondary flex h-full flex-col overflow-hidden rounded-[1.125rem]"
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
                      return (
                        <Glyph aria-hidden className="size-10 opacity-90" />
                      );
                    })()}
                    {/*
                      Bordered rather than tinted. v3 darkens this chip with a
                      translucent black, which on the blue cover drags the fill
                      under its own ink label — 3.76:1. The three covers have
                      opposite polarity (ink on blue and lime, paper on deep),
                      so no single tint helps all three. With no fill the label
                      keeps the cover's own on-colour pairing, which is AA by
                      construction.
                    */}
                    <span className="absolute top-4 right-4 rounded-full border border-current/40 px-3 py-1 font-mono text-xs font-semibold">
                      {collectionCounts.get(collection.id) ?? 0} tools
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col p-6">
                    <span className="font-heading text-lg font-bold tracking-tight">
                      {collection.title}
                    </span>
                    {collection.description ? (
                      <span className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        {collection.description}
                      </span>
                    ) : null}
                    <span className="text-primary mt-auto flex items-center gap-2 pt-5 text-sm font-bold">
                      See the stack
                      <IconArrowRight aria-hidden className="size-4" />
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
            eyebrow="Learn"
            title="Guides that don't skip steps."
            action={{ label: "All guides", href: "/learn" }}
          />
          <ul className="grid gap-4 md:grid-cols-2">
            {latest.map((item) => {
              const minutes = readingMinutes(item.body);
              return (
                <li key={item.id}>
                  <Link
                    href={`/learn/${item.slug}`}
                    className="motion-lift bg-secondary flex h-full items-start gap-5 rounded-[1.125rem] p-6"
                  >
                    <IconTile size="lg">
                      <IconBook2 aria-hidden className="size-6" />
                    </IconTile>
                    <span className="min-w-0">
                      <span className="font-heading block text-lg font-bold tracking-tight">
                        {item.title}
                      </span>
                      <span className="mt-3 flex flex-wrap items-center gap-3">
                        {item.role_level ? (
                          <TagPill>{item.role_level}</TagPill>
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
          The "deep" surface: this repo has no --deep token (that was in the
          superseded handoff CSS). In v3's own dark theme --deep equals the
          surface colour, so the dark chapter only exists in light mode —
          which is exactly what these two utilities say.
        */}
        <div className="bg-foreground text-background dark:bg-secondary dark:text-foreground rounded-3xl p-9 lg:p-14">
          {/*
            Lime as *text*, which VIB-99's fill-only rule otherwise forbids.
            Narrowed rather than broken: the rule exists because lime fails
            contrast on every light surface, and this block is dark in both
            modes — lime measures ~15:1 on the light-mode ink ground and ~14:1
            on the dark-mode surface. Approved by Ali 2026-09-10 for this block
            specifically. It is still never lime-on-light anywhere else.
          */}
          <p className="text-highlight flex items-center gap-2.5 text-xs font-bold tracking-widest uppercase">
            <span aria-hidden className="bg-highlight h-0.5 w-5 rounded-full" />
            Who it&rsquo;s for
          </p>
          <h2 className="font-heading mt-4 text-3xl font-bold tracking-[-0.04em] lg:text-4xl">
            Wherever you&rsquo;re{" "}
            <span className="text-highlight">starting from.</span>
          </h2>

          {testimonials.length ? (
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {testimonials.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-col rounded-[1.125rem] border border-current/15 bg-current/5 p-6"
                >
                  <blockquote className="text-[0.95rem] leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="mt-5 flex items-center gap-3 pt-1">
                    <span
                      aria-hidden
                      className="flex size-9.5 shrink-0 items-center justify-center rounded-full border border-current/15 bg-current/10 text-xs font-bold"
                    >
                      {initialsFrom(t.author_name, t.initials)}
                    </span>
                    <span className="text-sm opacity-70">
                      {t.author_name}
                      {t.location ? ` · ${t.location}` : ""}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            /*
              No published testimonials. §03's personas stand in, in the
              third person — who the product is for, not who said what.
              Staff add real ones at /admin/testimonials (VIB-102).
            */
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {AUDIENCES.map((audience) => (
                <li
                  key={audience.tier}
                  className="rounded-[1.125rem] border border-current/15 bg-current/5 p-6"
                >
                  <span className="text-xs font-bold tracking-widest uppercase opacity-70">
                    {audience.tier}
                  </span>
                  <h3 className="font-heading mt-3 text-lg font-bold tracking-tight">
                    {audience.headline}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed opacity-80">
                    {audience.blurb}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      {/* ── Flagship wizard band ─────────────────────────────────────── */}
      {flagship ? (
        <Section>
          <div className="bg-highlight text-highlight-foreground grid items-center gap-10 rounded-3xl p-9 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:p-14">
            <div>
              <p className="flex items-center gap-2.5 text-xs font-bold tracking-widest uppercase">
                <span
                  aria-hidden
                  className="bg-highlight-foreground h-0.5 w-5 rounded-full"
                />
                Free guided walkthrough
              </p>
              <h2 className="font-heading mt-4 text-3xl font-bold tracking-[-0.04em] lg:text-4xl">
                {flagship.title}
              </h2>
              <p className="mt-4 text-lg leading-relaxed opacity-75">
                From blank page to a live link you can send to anyone. Copy
                each prompt, paste it into your AI tool, check the result, move
                on.
              </p>
              <ul className="mt-7 flex flex-wrap gap-x-7 gap-y-2.5 border-t border-current/20 pt-6">
                {flagship.steps.map((step, i) => (
                  <li key={step.title} className="text-[0.95rem] font-bold">
                    <span className="mr-2 font-mono text-xs font-semibold opacity-75">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {step.title}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              {/*
                v3's ink button on the lime field: the fill inverts to
                --foreground and the inset badge carries the lime back.
              */}
              <Link
                href={`/wizards/${flagship.slug}`}
                /* v3's ink button on the lime field: the fill inverts to
                   --foreground and the inset badge carries the lime back. */
                className={buttonVariants({
                  size: "pill",
                  className:
                    "bg-foreground text-background hover:bg-foreground/90",
                })}
              >
                <ButtonIcon className="bg-highlight text-highlight-foreground">
                  <IconArrowUpRight />
                </ButtonIcon>
                Start step 1
              </Link>
              {/*
                v3 adds "you can stop anywhere", which reads as a promise to
                remember where you stopped. The app does not autosave, so the
                line is left out rather than reworded into the same claim.
                "No account needed to start" is true: the wizard page reads
                signed out; only saving progress redirects to login.
              */}
              <p className="mt-4 text-sm font-medium opacity-70">
                Free · No account needed to start.
              </p>
            </div>
          </div>
        </Section>
      ) : null}

      {/* ── Founder note ─────────────────────────────────────────────── */}
      {/*
        The honest trust signal while there are no testimonials (VIB-115).
        Bible §01's brand story: the platform is built with the tools it
        teaches. Ali's own words belong here — edit freely.
      */}
      <Section>
        <div className="grid items-center gap-8 md:grid-cols-[auto_minmax(0,1fr)]">
          <span
            aria-hidden
            className="bg-primary text-primary-foreground font-heading flex size-20 items-center justify-center rounded-full text-2xl font-bold"
          >
            AR
          </span>
          <div>
            <p className="text-primary flex items-center gap-2.5 text-xs font-bold tracking-widest uppercase">
              <span aria-hidden className="bg-primary h-0.5 w-5 rounded-full" />
              Why this exists
            </p>
            <h2 className="font-heading mt-3.5 text-3xl font-bold tracking-[-0.04em] lg:text-4xl">
              Built with the tools on this site.
            </h2>
            <p className="text-muted-foreground mt-3.5 max-w-[62ch] text-lg leading-relaxed">
              Viberation is built by one founder, Ali Rizwan, from Pakistan,
              using the same AI coding tools you&rsquo;ll find in the
              directory. No agency, no dev team. If something is on this site,
              it&rsquo;s because I needed it while building this one.
            </p>
          </div>
        </div>
      </Section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      {/* Native <details>: no JS, keyboard and screen-reader support for free. */}
      <Section>
        <SectionHead eyebrow="FAQ" title="Questions, answered." />
        <div className="divide-y rounded-[1.125rem] border">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group px-6 py-5">
              <summary className="font-heading flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold tracking-tight">
                {faq.q}
                <IconArrowRight
                  aria-hidden
                  className="text-primary size-5 shrink-0 transition-transform group-open:rotate-90"
                />
              </summary>
              <p className="text-muted-foreground mt-3 max-w-[70ch] leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </Section>

      {/* ── Closing capture ──────────────────────────────────────────── */}
      <Section>
        <div className="bg-secondary rounded-3xl p-9 text-center lg:p-14">
          <h2 className="font-heading text-3xl font-bold tracking-[-0.04em] lg:text-4xl">
            Stop researching.{" "}
            <span className="text-primary">Start shipping.</span>
          </h2>
          {newsletterEnabled ? (
            <>
              {/*
                VIB-91's flag, already shipped with a server action. v3 draws a
                new form; there was no need to build one.
              */}
              <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg leading-relaxed">
                One email a week: the AI tools worth your time, and one thing
                to build next.
              </p>
              <NewsletterForm />
            </>
          ) : (
            <>
              <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg leading-relaxed">
                A free account lets you save tools, keep track of what
                you&rsquo;ve read, and save your walkthrough progress.
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
                  /* This block is already --secondary, so the soft pill
                     lifts to --card and its badge drops back to --secondary.
                     Left at the defaults the badge and the button are the
                     same colour and it disappears. */
                  className={buttonVariants({
                    variant: "pill-soft",
                    size: "pill",
                    className: "bg-card hover:bg-accent",
                  })}
                >
                  <ButtonIcon tone="on-soft" className="bg-secondary">
                    <IconArrowRight />
                  </ButtonIcon>
                  Read the guides
                </Link>
              </div>
              <p className="text-muted-foreground mt-5 text-sm">
                No account required to browse the directory.
              </p>
            </>
          )}
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
    tier: "Just starting",
    headline: "You've used ChatGPT. Now you want to build something real.",
    blurb:
      "Plain-English explanations of context windows, tokens and system prompts — without the condescension — plus prompts you can actually copy.",
  },
  {
    tier: "Already shipping",
    headline: "Your projects work. Your process doesn't.",
    blurb:
      "Context engineering, project structure and prompt templates you can clone, for people who do not need the fundamentals re-explained.",
  },
  {
    tier: "Founder, no dev background",
    headline: "You have the idea. You need the MVP.",
    blurb:
      "Curated tools with honest tradeoffs, and a step-by-step path from idea to a deployed MVP framed around business outcomes.",
  },
] as const;

/** v3's `.sec` rhythm: clamp(56px, 7vw, 104px). */
function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="reveal mt-[clamp(3.5rem,7vw,6.5rem)]">
      {children}
    </section>
  );
}

/** v3's `.sec-t` rhythm — the tighter one, clamp(36px, 4.5vw, 64px). */
function SectionTight({ children }: { children: React.ReactNode }) {
  return (
    <section className="reveal mt-[clamp(2.25rem,4.5vw,4rem)]">
      {children}
    </section>
  );
}

/**
 * The square icon plate used by the category tiles and article cards.
 *
 * v3 draws these as a --card plate with a blue glyph; Ali asked for the
 * inverse — blue plate, light glyph — on 2026-09-10. The glyph is
 * --primary-foreground rather than lime: `--highlight` is a fill-only colour
 * (VIB-99) and a stroke is not a fill, so lime here would be the first break
 * of that rule. --primary-foreground is also the token that already resolves
 * against a --primary fill in both modes.
 */
function IconTile({
  size = "md",
  children,
}: {
  size?: "md" | "lg";
  children: React.ReactNode;
}) {
  return (
    <span
      className={`bg-primary text-primary-foreground flex shrink-0 items-center justify-center ${
        size === "lg" ? "size-13 rounded-2xl" : "size-10 rounded-xl"
      }`}
    >
      {children}
    </span>
  );
}

/** v3's `.tag`: a wash of the accent with the accent as its text. */
function TagPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-bold capitalize">
      {children}
    </span>
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
        <p className="text-primary flex items-center gap-2.5 text-xs font-bold tracking-widest uppercase">
          <span aria-hidden className="bg-primary h-0.5 w-5 rounded-full" />
          {eyebrow}
        </p>
        <h2 className="font-heading mt-3.5 text-3xl font-bold tracking-[-0.04em] lg:text-4xl">
          {title}
        </h2>
        {lede ? (
          <p className="text-muted-foreground mt-3.5 max-w-[56ch] text-lg leading-relaxed">
            {lede}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="text-primary flex shrink-0 items-center gap-2 text-[0.9375rem] font-bold hover:underline"
        >
          {action.label}
          <IconArrowRight aria-hidden className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}

/** One side of the before/after pair: soft surface for "without", primary fill for "with". */
function ContrastList({
  heading,
  items,
  positive,
}: {
  heading: string;
  items: readonly string[];
  positive?: boolean;
}) {
  const Icon = positive ? IconCheck : IconX;
  return (
    <div
      className={`rounded-[1.125rem] p-8 ${positive ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
    >
      <h3 className="font-heading text-xl font-bold tracking-tight">
        {heading}
      </h3>
      <ul className="mt-5 grid gap-3.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 font-semibold">
            <Icon
              aria-hidden
              className={`mt-0.5 size-5 shrink-0 ${positive ? "" : "text-muted-foreground"}`}
            />
            <span className={positive ? "" : "text-muted-foreground"}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const STEPS = [
  {
    title: "Pick your tools.",
    blurb: "Find your stack in minutes, not a weekend of YouTube.",
  },
  {
    title: "Follow the steps.",
    blurb: "Copy the prompt, paste it into your AI, check the result.",
  },
  {
    title: "Ship it.",
    blurb: "Finish with a real link you can send to anyone.",
  },
] as const;

const CONTRAST = [
  {
    without: "Prompts copied from random threads",
    with: "A prompt written for the step you're on",
  },
  {
    without: "Tools picked from sponsored top-10 lists",
    with: "Honest tradeoffs, affiliate links labelled",
  },
  {
    without: "Tutorials that skip the step you're stuck on",
    with: "Every step shown, nothing assumed",
  },
  {
    without: "A half-finished project stuck on localhost",
    with: "A live URL you can share",
  },
] as const;

/**
 * Every answer must stay true of the product as shipped — no "free forever",
 * no autosave, no tool recommendation the directory does not back up.
 */
const FAQS = [
  {
    q: "Do I need to know how to code?",
    a: "No. The walkthrough assumes no experience, and every step gives you a prompt to paste into your AI tool. You'll learn what the code does as you go, in plain English.",
  },
  {
    q: "Is it really free?",
    a: "Yes. The directory, the guides and the walkthrough are free to browse, with no card and no trial. A free account adds bookmarks, reading history and saved walkthrough progress.",
  },
  {
    q: "How does Viberation make money?",
    a: "Some tool links are affiliate links, which means we may earn a commission if you sign up. Every one is labelled, and it never changes what we say about a tool.",
  },
  {
    q: "Which AI tool should I start with?",
    a: "Start the walkthrough. It tells you what to use at each step. If you'd rather compare first, the directory shows who each tool is best for.",
  },
  {
    q: "I'm not a beginner. Is this for me?",
    a: "Yes. The guides have tracks for people already shipping: context engineering, project structure, and prompt templates you can reuse.",
  },
] as const;
