import {
  IconArrowRight,
  IconArrowUpRight,
  IconSearch,
} from "@tabler/icons-react";
import Link from "next/link";

import { MarketingHome } from "@/components/features/marketing/MarketingHome";
import { CategoryIcon } from "@/components/features/tools/CategoryIcon";
import { Badge } from "@/components/ui/badge";
import { ButtonIcon, buttonVariants } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import {
  FEED_TABS,
  feedQueryFor,
  greetingFor,
  progressLabel,
  toFeedTab,
} from "@/lib/home-feed";
import { createClient } from "@/lib/integrations/supabase/server";
import { contentTypeLabel, LEARN_TYPE_VALUES } from "@/lib/learn";
import { newsletterFormEnabled } from "@/lib/newsletter";
import {
  countCollectionItems,
  listFeaturedCollections,
} from "@/lib/queries/collections";
import { listContent } from "@/lib/queries/content";
import { listHistory } from "@/lib/queries/history";
import { getProfile, type Profile } from "@/lib/queries/profiles";
import { resolveTargetViews } from "@/lib/queries/resources";
import { listPopularTags } from "@/lib/queries/tags";
import { listPublishedTestimonials } from "@/lib/queries/testimonials";
import { listTools } from "@/lib/queries/tools";
import {
  getWalkthroughProgress,
  listWalkthroughs,
} from "@/lib/queries/walkthroughs";
import { TOOL_CATEGORIES } from "@/lib/tool-categories";
import { toolsHref } from "@/lib/tools-url";

/**
 * Home — two shapes, not one (VIB-78 and VIB-77, handoff screens 2 and 1).
 *
 * Signed in this is the app shell's centre and right rail; the left zone is
 * the sidebar, which lives in the layout. Signed out it hands off to
 * MarketingHome. The queries are shared because both shapes want the same
 * rows — collections, latest content, popular tools, the flagship walkthrough —
 * just arranged and framed differently.
 */
type Props = { searchParams: Promise<{ feed?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const tab = toFeedTab((await searchParams).feed);

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  // The signed-in tier drives the role-adaptive feed, so it is needed before
  // those queries run.
  const profile = auth.user ? await getProfile(supabase, auth.user.id) : null;

  const [collections, { items: latest }, { tools }, walkthroughs, history] =
    await Promise.all([
      listFeaturedCollections(supabase),
      listContent(supabase, {
        types: LEARN_TYPE_VALUES,
        /*
         * Which tier and which order each tab wants lives in feedQueryFor, so
         * the tabs cannot quietly disagree with their own labels.
         */
        ...feedQueryFor(tab, profile?.role_level ?? undefined),
        pageSize: 3,
      }),
      listTools(supabase, { sort: "popular", pageSize: 6 }),
      listWalkthroughs(supabase),
      // Four is what the rail has room for; the full list is the History tab.
      auth.user ? listHistory(supabase, auth.user.id, 4) : [],
    ]);

  // §31 puts the flagship promo last. Nothing renders it when no walkthrough is
  // published, so the section cannot point at a route that 404s.
  const flagship = walkthroughs[0];

  if (!auth.user) {
    // The marketing page shows no counts (VIB-116), so it no longer asks for
    // any. Real quotes, or none — the proof section falls back to describing
    // who the product is for rather than inventing anyone (VIB-102).
    const testimonials = await listPublishedTestimonials(supabase);
    return (
      <MarketingHome
        previewTools={tools.slice(0, 3)}
        collections={collections}
        testimonials={testimonials}
        latest={latest}
        flagship={flagship}
        newsletterEnabled={newsletterFormEnabled()}
      />
    );
  }

  const [recent, collectionCounts, tags, progress] = await Promise.all([
    resolveTargetViews(supabase, history),
    countCollectionItems(
      supabase,
      collections.map((collection) => collection.id),
    ),
    listPopularTags(supabase),
    flagship
      ? getWalkthroughProgress(supabase, auth.user.id, flagship.id)
      : null,
  ]);

  /*
   * Nothing deletes a history row when its tool goes away — no foreign key
   * can span a polymorphic target — so entries whose target has vanished
   * are dropped rather than rendered as holes.
   */
  const continueItems = history.flatMap((item) => {
    const target = recent.get(item.target_id);
    return target ? [{ id: item.id, target }] : [];
  });

  const greeting = profile?.username ?? auth.user.email?.split("@")[0];

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="font-heading text-3xl font-bold tracking-[-0.04em]">
          {greetingFor(new Date().getHours())}
          {greeting ? `, ${greeting}` : ""} — what are you building?
        </h1>
        {/*
          Intent search: the same GET form as everywhere else, so it works
          without JavaScript and produces a shareable /search URL.
        */}
        <form method="get" action="/search" role="search" className="mt-4">
          <label htmlFor="search-intent" className="sr-only">
            Describe what you want to build
          </label>
          <div className="bg-secondary focus-within:ring-ring/50 flex h-14 items-center gap-3 rounded-full pr-2 pl-5 focus-within:ring-3">
            <IconSearch
              aria-hidden
              className="text-muted-foreground size-4 shrink-0"
            />
            <input
              id="search-intent"
              type="search"
              name="q"
              placeholder="Describe what you want to build, or find a tool…"
              className="placeholder:text-muted-foreground w-full bg-transparent text-[0.9375rem] outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full"
            >
              <IconArrowRight aria-hidden className="size-[1.1rem]" />
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="sr-only">Categories</h2>
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
          {TOOL_CATEGORIES.map((category) => (
            <li key={category.value}>
              <Link
                href={toolsHref({ category: category.value })}
                className="bg-secondary hover:bg-primary/10 flex flex-col items-center gap-2 rounded-2xl px-2 py-3.5 text-center text-xs font-bold transition-colors"
              >
                <CategoryIcon category={category.value} className="size-4" />
                {category.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="sr-only">Hubs</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HUBS.map((hub) => (
            <li key={hub.title}>
              {/*
                Setups and Paths are Phase 1.5 — signposted, never linked.
                CLAUDE.md is explicit that nothing from 1.5 gets built, and a
                card that navigates somewhere is the first half of building it.
              */}
              {hub.href ? (
                <Link
                  href={hub.href}
                  className="bg-secondary hover:bg-primary/10 motion-lift block h-full rounded-[1.125rem] p-5 transition-colors"
                >
                  <HubBody {...hub} />
                </Link>
              ) : (
                <div
                  aria-disabled
                  className="bg-secondary/50 text-muted-foreground/60 h-full rounded-[1.125rem] p-5"
                >
                  <HubBody {...hub} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div>
          <h2 className="sr-only">Your feed</h2>
          <div className="bg-secondary mb-5 inline-flex flex-wrap gap-1 rounded-full p-1.5 text-sm">
            {FEED_TABS.map((feedTab) =>
              "disabled" in feedTab && feedTab.disabled ? (
                <span
                  key={feedTab.value}
                  aria-disabled="true"
                  title="Needs a popularity signal that does not exist yet"
                  className="text-muted-foreground/50 cursor-default rounded-full px-4 py-2 font-bold"
                >
                  {feedTab.label}
                </span>
              ) : (
                <Link
                  key={feedTab.value}
                  href={
                    feedTab.value === "for-you"
                      ? "/"
                      : `/?feed=${feedTab.value}`
                  }
                  aria-current={tab === feedTab.value ? "page" : undefined}
                  className={
                    tab === feedTab.value
                      ? "bg-primary text-primary-foreground rounded-full px-4 py-2 font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-card rounded-full px-4 py-2 font-bold transition-colors"
                  }
                >
                  {feedTab.label}
                </Link>
              ),
            )}
          </div>

          <ul className="space-y-3">
            {flagship ? (
              <li>
                <FeedCard
                  href={`/walkthroughs/${flagship.slug}`}
                  eyebrow="Walkthrough"
                  title={flagship.title}
                  meta={`${flagship.steps.length} steps`}
                />
              </li>
            ) : null}
            {latest.map((item) => (
              <li key={item.id}>
                <FeedCard
                  href={`/learn/${item.slug}`}
                  eyebrow={[contentTypeLabel(item.type), item.role_level]
                    .filter(Boolean)
                    .join(" · ")}
                  title={item.title}
                  meta={null}
                />
              </li>
            ))}
            {collections.map((collection) => (
              <li key={collection.id}>
                <FeedCard
                  href={`/collections/${collection.slug}`}
                  eyebrow="New in directory"
                  title={collection.title}
                  meta={`Collection · ${collectionCounts.get(collection.id) ?? 0} tools`}
                />
              </li>
            ))}
          </ul>
        </div>

        {/*
          The rail stacks under the feed on narrow screens rather than being
          hidden. It was `hidden lg:block`, which meant anything under 1024px
          — including a 1007px window — lost the whole column silently.
        */}
        <aside aria-label="Your activity" className="space-y-3">
          {flagship && progress ? (
            <RailCard title="Continue where you left off">
              <Link
                href={`/walkthroughs/${flagship.slug}`}
                className="hover:underline"
              >
                <p className="text-muted-foreground text-sm">
                  {flagship.title}
                </p>
              </Link>
              {(() => {
                const { label, percent } = progressLabel(
                  progress.stepIndex,
                  flagship.steps[progress.stepIndex]?.title,
                  flagship.steps.length,
                );
                return (
                  <>
                    <div
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={label}
                      className="bg-muted mt-2 h-1 rounded-full"
                    >
                      <div
                        className="bg-primary h-1 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-muted-foreground mt-1.5 text-xs">
                      {label}
                    </p>
                  </>
                );
              })()}
            </RailCard>
          ) : continueItems.length ? (
            <RailCard
              title="Continue where you left off"
              href="/account/history"
            >
              <ul className="space-y-2">
                {continueItems.map(({ id, target }) => (
                  <li key={id}>
                    <Link href={target.href} className="block hover:underline">
                      <span className="text-muted-foreground block text-xs">
                        {target.eyebrow}
                      </span>
                      <span className="block text-sm">{target.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </RailCard>
          ) : null}

          {tools.length ? (
            /*
             * The mockup labels this "Trending tools". It is the directory's
             * popularity sort, which is the only ranking signal that exists —
             * tool_clicks currently holds a handful of rows, so treat the
             * order as thin rather than meaningful until there is traffic.
             */
            <RailCard title="Trending tools" href="/tools">
              <ul className="space-y-1.5">
                {tools.slice(0, 4).map((tool) => (
                  <li key={tool.id}>
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="text-sm hover:underline"
                    >
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </RailCard>
          ) : null}

          {tags.length ? (
            /*
             * Genuinely ordered by use, not alphabetically: `tags` has no
             * count column, but tool_tags and content_tags do, so the
             * ordering is real and the heading is honest.
             */
            <RailCard title="Popular tags">
              <ul className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <li key={tag.id}>
                    <Link
                      href={`/tags/${tag.slug}`}
                      className="hover:bg-accent block rounded-full border px-2 py-0.5 text-xs"
                    >
                      #{tag.slug}
                    </Link>
                  </li>
                ))}
              </ul>
            </RailCard>
          ) : null}
        </aside>
      </div>

      <OnboardingNudge profile={profile} />
    </div>
  );
}

const HUBS = [
  { title: "Setups", blurb: "Reusable config", pill: "Phase 1.5", href: null },
  { title: "Paths", blurb: "Guided builds", pill: "Phase 1.5", href: null },
  {
    title: "Collections",
    blurb: "Curated tool sets",
    pill: "MVP",
    href: "/collections",
  },
  {
    title: "Library",
    blurb: "Your saved items",
    pill: "MVP",
    href: "/account/bookmarks",
  },
] as const;

function HubBody({
  title,
  blurb,
  pill,
}: {
  title: string;
  blurb: string;
  pill: string;
}) {
  return (
    <>
      <h3 className="font-heading font-bold tracking-tight">{title}</h3>
      <p className="text-muted-foreground mt-1 text-xs">{blurb}</p>
      <Badge
        variant={pill === "MVP" ? "default" : "secondary"}
        className="mt-2"
      >
        {pill}
      </Badge>
    </>
  );
}

function FeedCard({
  href,
  eyebrow,
  title,
  meta,
}: {
  href: string;
  eyebrow: string;
  title: string;
  meta: string | null;
}) {
  return (
    <div className="bg-secondary hover:bg-primary/10 focus-within:ring-ring relative rounded-[1.125rem] p-5 transition-colors focus-within:ring-2">
      <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
        {eyebrow}
      </p>
      <h3 className="font-heading mt-2 text-lg font-bold tracking-tight">
        <Link href={href} className="outline-none after:absolute after:inset-0">
          {title}
        </Link>
      </h3>
      {meta ? (
        <p className="text-muted-foreground mt-1.5 text-xs">{meta}</p>
      ) : null}
    </div>
  );
}

function RailCard({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <Panel className="p-5 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-heading font-bold tracking-tight">{title}</h2>
        {href ? (
          <Link
            href={href}
            className="text-muted-foreground text-xs hover:underline"
          >
            All
          </Link>
        ) : null}
      </div>
      {children}
    </Panel>
  );
}

/** Only for someone who has not been through it — never for visitors. */
function OnboardingNudge({ profile }: { profile: Profile | null }) {
  if (!profile || profile.onboarding_completed) return null;

  return (
    <Panel className="mt-8">
      <h2 className="font-heading text-xl font-bold tracking-tight">
        Set yourself up in under a minute
      </h2>
      <p className="text-muted-foreground mt-2.5 leading-relaxed">
        Tell us the level you are at and we will tune what you see across the
        site.
      </p>
      <Link
        href="/onboarding"
        className={buttonVariants({
          variant: "pill",
          size: "pill-sm",
          className: "mt-6",
        })}
      >
        <ButtonIcon size="sm">
          <IconArrowUpRight />
        </ButtonIcon>
        Get started
      </Link>
    </Panel>
  );
}
