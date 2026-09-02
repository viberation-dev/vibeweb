import { IconArrowRight, IconSearch } from "@tabler/icons-react";
import Link from "next/link";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { CategoryIcon } from "@/components/features/tools/CategoryIcon";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FEED_TABS,
  greetingFor,
  progressLabel,
  readingMinutes,
  toFeedTab,
} from "@/lib/home-feed";
import { createClient } from "@/lib/integrations/supabase/server";
import { contentTypeLabel, LEARN_TYPE_VALUES } from "@/lib/learn";
import { listBookmarks } from "@/lib/queries/bookmarks";
import {
  countCollectionItems,
  listFeaturedCollections,
  type Collection,
} from "@/lib/queries/collections";
import { listContent, type Content } from "@/lib/queries/content";
import { listHistory } from "@/lib/queries/history";
import { getProfile, type Profile } from "@/lib/queries/profiles";
import { resolveTargetViews } from "@/lib/queries/resources";
import { listPopularTags } from "@/lib/queries/tags";
import { listTools } from "@/lib/queries/tools";
import {
  getWizardProgress,
  listWizards,
  type Wizard,
} from "@/lib/queries/wizards";
import { contentView, toolView, type ResourceView } from "@/lib/resource-view";
import { TOOL_CATEGORIES } from "@/lib/tool-categories";
import { toolsHref } from "@/lib/tools-url";

/**
 * Home (§31 Part 2) — two shapes, not one (VIB-78, handoff Screen 2).
 *
 * Signed in this is the app shell's centre and right rail; the left zone is
 * the sidebar, which lives in the layout. Signed out it stays the stacked
 * marketing page, unchanged pending the marketing homepage rebuild.
 */
type Props = { searchParams: Promise<{ feed?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const tab = toFeedTab((await searchParams).feed);

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  // The signed-in tier drives the role-adaptive feed, so it is needed before
  // those queries run.
  const profile = auth.user ? await getProfile(supabase, auth.user.id) : null;

  const [
    collections,
    { items: latest },
    { tools },
    bookmarks,
    wizards,
    history,
  ] = await Promise.all([
    listFeaturedCollections(supabase),
    listContent(supabase, {
      types: LEARN_TYPE_VALUES,
      /*
       * "For you" is the tier filter; "Latest" deliberately drops it, which
       * is the only difference between the two tabs — listContent already
       * orders by created_at descending either way.
       */
      roleLevel:
        tab === "latest" ? undefined : (profile?.role_level ?? undefined),
      pageSize: 3,
    }),
    listTools(supabase, { sort: "popular", pageSize: 6 }),
    auth.user ? listBookmarks(supabase, auth.user.id) : [],
    listWizards(supabase),
    // Four is what the rail has room for; the full list is the History tab.
    auth.user ? listHistory(supabase, auth.user.id, 4) : [],
  ]);

  // §31 puts the flagship promo last. Nothing renders it when no wizard is
  // published, so the section cannot point at a route that 404s.
  const flagship = wizards[0];
  const bookmarkedIds = new Set(
    bookmarks.map((bookmark) => bookmark.target_id),
  );

  if (!auth.user) {
    return (
      <main className="mx-auto w-full max-w-6xl p-6">
        <section className="py-6">
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            The tools that actually get your project shipped.
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
            A curated directory of AI tools for vibe coders, with guides written
            for the level you are actually at — not the one the docs assume.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/tools" className={buttonVariants({ size: "lg" })}>
              Browse the directory
            </Link>
            <Link
              href="/learn"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              Start learning
            </Link>
          </div>
        </section>

        <CollectionsSection collections={collections} />
        <LatestSection
          items={latest}
          profile={null}
          bookmarkedIds={bookmarkedIds}
        />
        {tools.length ? (
          <FeedSection
            title="Most viewed tools"
            href="/tools"
            linkLabel="All tools"
          >
            <CardGrid
              views={tools.map(toolView)}
              bookmarkedIds={bookmarkedIds}
            />
          </FeedSection>
        ) : null}
        <FlagshipSection wizard={flagship} />
      </main>
    );
  }

  const [recent, collectionCounts, tags, progress] = await Promise.all([
    resolveTargetViews(supabase, history),
    countCollectionItems(
      supabase,
      collections.map((collection) => collection.id),
    ),
    listPopularTags(supabase),
    flagship ? getWizardProgress(supabase, auth.user.id, flagship.id) : null,
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
        <h1 className="font-heading text-2xl font-semibold">
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
          <div className="focus-within:border-ring flex items-center gap-2 rounded-lg border px-4 py-2.5">
            <IconSearch
              aria-hidden
              className="text-muted-foreground size-4 shrink-0"
            />
            <input
              id="search-intent"
              type="search"
              name="q"
              placeholder="Describe what you want to build, or find a tool…"
              className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-md"
            >
              <IconArrowRight aria-hidden className="size-4" />
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
                className="hover:bg-accent hover:text-accent-foreground flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center text-xs"
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
                  className="border-primary hover:bg-accent/40 block h-full rounded-xl border-2 p-4"
                >
                  <HubBody {...hub} />
                </Link>
              ) : (
                <div
                  aria-disabled
                  className="text-muted-foreground/60 h-full rounded-xl border p-4"
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
          <div className="mb-4 flex gap-4 border-b text-sm">
            {FEED_TABS.map((feedTab) =>
              "disabled" in feedTab && feedTab.disabled ? (
                <span
                  key={feedTab.value}
                  aria-disabled="true"
                  title="Needs a popularity signal that does not exist yet"
                  className="text-muted-foreground/50 cursor-default pb-2"
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
                      ? "border-primary -mb-px border-b-2 pb-2 font-medium"
                      : "text-muted-foreground hover:text-foreground -mb-px border-b-2 border-transparent pb-2"
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
                  href={`/wizards/${flagship.slug}`}
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
                  meta={
                    readingMinutes(item.body)
                      ? `${readingMinutes(item.body)} min read`
                      : null
                  }
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
                href={`/wizards/${flagship.slug}`}
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
      <h3 className="font-heading text-sm font-medium">{title}</h3>
      <p className="text-muted-foreground mt-0.5 text-xs">{blurb}</p>
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
    <Card className="hover:bg-muted/40 relative transition-colors">
      <CardHeader>
        <p className="text-muted-foreground text-xs">{eyebrow}</p>
        <CardTitle className="text-base">
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0"
          >
            {title}
          </Link>
        </CardTitle>
        {meta ? (
          <CardDescription className="text-xs">{meta}</CardDescription>
        ) : null}
      </CardHeader>
    </Card>
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
    <section className="rounded-xl border p-4">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="font-heading text-sm font-medium">{title}</h2>
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
    </section>
  );
}

/** Only for someone who has not been through it — never for visitors. */
function OnboardingNudge({ profile }: { profile: Profile | null }) {
  if (!profile || profile.onboarding_completed) return null;

  return (
    <section className="bg-muted/40 mt-8 rounded-xl border p-5">
      <h2 className="font-heading text-lg font-medium">
        Set yourself up in under a minute
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Tell us the level you are at and we will tune what you see across the
        site.
      </p>
      <Link
        href="/onboarding"
        className={buttonVariants({ className: "mt-4" })}
      >
        Get started
      </Link>
    </section>
  );
}

function CollectionsSection({ collections }: { collections: Collection[] }) {
  if (!collections.length) return null;

  return (
    <FeedSection
      title="Featured collections"
      href="/collections"
      linkLabel="All collections"
    >
      <ul className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <li key={collection.id}>
            <Card className="focus-within:ring-ring hover:bg-muted/40 relative h-full transition-colors focus-within:ring-2">
              <CardHeader>
                <Badge variant="secondary" className="w-fit">
                  Collection
                </Badge>
                <CardTitle>
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="outline-none after:absolute after:inset-0"
                  >
                    {collection.title}
                  </Link>
                </CardTitle>
                {collection.description ? (
                  <CardDescription>{collection.description}</CardDescription>
                ) : null}
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </FeedSection>
  );
}

function LatestSection({
  items,
  profile,
  bookmarkedIds,
}: {
  items: Content[];
  profile: Profile | null;
  bookmarkedIds: Set<string>;
}) {
  if (!items.length) return null;

  return (
    <FeedSection
      title={
        profile ? `Written for ${profile.role_level}s` : "Latest from Learn"
      }
      href="/learn"
      linkLabel="All of Learn"
    >
      <CardGrid views={items.map(contentView)} bookmarkedIds={bookmarkedIds} />
    </FeedSection>
  );
}

function FlagshipSection({ wizard }: { wizard: Wizard | undefined }) {
  if (!wizard) return null;

  return (
    <section className="bg-muted/40 mt-12 rounded-xl border p-6">
      <Badge variant="secondary" className="w-fit">
        Guided build
      </Badge>
      <h2 className="font-heading mt-2 text-xl font-medium">{wizard.title}</h2>
      <p className="text-muted-foreground mt-1 max-w-2xl">
        {wizard.steps.length} steps, ending with something real on the internet:{" "}
        {wizard.steps.map((step) => step.title).join(" → ")}.
      </p>
      <Link
        href={`/wizards/${wizard.slug}`}
        className={buttonVariants({ className: "mt-4" })}
      >
        Start the build
      </Link>
    </section>
  );
}

function FeedSection({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-xl font-medium">{title}</h2>
        <Link
          href={href}
          className="text-muted-foreground text-sm hover:underline"
        >
          {linkLabel} →
        </Link>
      </div>
      {children}
    </section>
  );
}

function CardGrid({
  views,
  bookmarkedIds,
}: {
  views: ResourceView[];
  bookmarkedIds: Set<string>;
}) {
  return (
    <ul className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {views.map((view) => (
        <li key={`${view.targetType}:${view.id}`}>
          <ResourceCard
            href={view.href}
            title={view.title}
            eyebrow={view.eyebrow}
            description={view.description}
            badges={view.badges}
            difficulty={view.difficulty}
            meta={view.meta}
            action={
              <BookmarkButton
                targetType={view.targetType}
                targetId={view.id}
                bookmarked={bookmarkedIds.has(view.id)}
                returnTo="/"
              />
            }
          />
        </li>
      ))}
    </ul>
  );
}
