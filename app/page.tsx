import Link from "next/link";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { SearchInput } from "@/components/features/search/SearchInput";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/integrations/supabase/server";
import { LEARN_TYPE_VALUES } from "@/lib/learn";
import { listBookmarks } from "@/lib/queries/bookmarks";
import { listFeaturedCollections, type Collection } from "@/lib/queries/collections";
import { listContent, type Content } from "@/lib/queries/content";
import { listHistory } from "@/lib/queries/history";
import { getProfile, type Profile } from "@/lib/queries/profiles";
import { resolveTargetViews } from "@/lib/queries/resources";
import { listTools } from "@/lib/queries/tools";
import { listWizards, type Wizard } from "@/lib/queries/wizards";
import { contentView, toolView, type ResourceView } from "@/lib/resource-view";
import { TOOL_CATEGORIES } from "@/lib/tool-categories";
import { toolsHref } from "@/lib/tools-url";

/**
 * Home (§31 Part 2) — two shapes, not one (VIB-78, handoff Screen 2).
 *
 * Signed in this is the app shell's centre and right rail; the left zone is
 * the sidebar, which lives in the layout. Signed out it stays the stacked
 * marketing page, unchanged pending the marketing homepage rebuild.
 *
 * The sections both shapes share are components below rather than two
 * copies of the same JSX — what differs between the shapes is layout and
 * emphasis, not content.
 */
export default async function HomePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  // The signed-in tier drives the role-adaptive feed, so it is needed before
  // those queries run.
  const profile = auth.user ? await getProfile(supabase, auth.user.id) : null;

  const [collections, { items: latest }, { tools }, bookmarks, wizards, history] =
    await Promise.all([
      listFeaturedCollections(supabase),
      listContent(supabase, {
        types: LEARN_TYPE_VALUES,
        // Signed out this is undefined, which means no tier filter — a visitor
        // sees everything rather than an arbitrary default tier's slice.
        roleLevel: profile?.role_level,
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
  const bookmarkedIds = new Set(bookmarks.map((bookmark) => bookmark.target_id));

  if (!auth.user) {
    return (
      <main className="mx-auto w-full max-w-6xl p-6">
        <section className="py-6">
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            The tools that actually get your project shipped.
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
            A curated directory of AI tools for vibe coders, with guides written for the level you
            are actually at — not the one the docs assume.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/tools" className={buttonVariants({ size: "lg" })}>
              Browse the directory
            </Link>
            <Link href="/learn" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Start learning
            </Link>
          </div>
        </section>

        <CollectionsSection collections={collections} />
        <LatestSection items={latest} profile={null} bookmarkedIds={bookmarkedIds} />
        {tools.length ? (
          <FeedSection title="Most viewed tools" href="/tools" linkLabel="All tools">
            <CardGrid views={tools.map(toolView)} bookmarkedIds={bookmarkedIds} />
          </FeedSection>
        ) : null}
        <FlagshipSection wizard={flagship} />
      </main>
    );
  }

  const recent = await resolveTargetViews(supabase, history);
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
    <div className="mx-auto flex w-full max-w-6xl gap-8 p-6">
      <main className="min-w-0 flex-1">
        <section>
          <h1 className="font-heading text-3xl font-semibold">
            Welcome back{greeting ? `, ${greeting}` : ""}.
          </h1>
          <p className="text-muted-foreground mt-2">
            Say what you are trying to build, or start from a category.
          </p>
          {/* Intent search: the same GET form as the header, given room. */}
          <SearchInput className="mt-4 max-w-xl" />
        </section>

        <section className="mt-8">
          <h2 className="sr-only">Categories</h2>
          <ul className="flex flex-wrap gap-2">
            {TOOL_CATEGORIES.map((category) => (
              <li key={category.value}>
                <Link
                  href={toolsHref({ category: category.value })}
                  className="hover:bg-accent hover:text-accent-foreground block rounded-md border px-3 py-1.5 text-sm"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <OnboardingNudge profile={profile} />
        <CollectionsSection collections={collections} />
        <LatestSection items={latest} profile={profile} bookmarkedIds={bookmarkedIds} />
        <FlagshipSection wizard={flagship} />
      </main>

      {/*
        The rail is supplementary, so it drops below lg rather than squeezing
        the feed — everything in it is reachable from the sidebar and the
        History tab either way.
      */}
      <aside aria-label="Your activity" className="hidden w-72 shrink-0 lg:block">
        {continueItems.length ? (
          <section>
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="font-heading text-sm font-medium">Continue where you left off</h2>
              <Link
                href="/account/history"
                className="text-muted-foreground text-xs hover:underline"
              >
                All
              </Link>
            </div>
            <ul className="space-y-2">
              {continueItems.map(({ id, target }) => (
                <li key={id}>
                  <Link
                    href={target.href}
                    className="hover:bg-accent/50 block rounded-md border px-3 py-2"
                  >
                    <span className="text-muted-foreground block text-xs">{target.eyebrow}</span>
                    <span className="block text-sm font-medium">{target.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {tools.length ? (
          /*
           * The same popularity signal the directory sorts by, labelled as
           * what it is. tool_clicks holds a handful of rows, so calling this
           * "trending" would promise a live trend the data cannot support.
           * It lives here rather than in the feed as well — one place per
           * thing.
           */
          <section className={continueItems.length ? "mt-8" : undefined}>
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="font-heading text-sm font-medium">Most viewed</h2>
              <Link href="/tools" className="text-muted-foreground text-xs hover:underline">
                All
              </Link>
            </div>
            <ul className="space-y-2">
              {tools.slice(0, 5).map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="hover:bg-accent/50 block rounded-md border px-3 py-2 text-sm font-medium"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </aside>
    </div>
  );
}

/** Only for someone who has not been through it — never for visitors. */
function OnboardingNudge({ profile }: { profile: Profile | null }) {
  if (!profile || profile.onboarding_completed) return null;

  return (
    <section className="bg-muted/40 mt-8 rounded-xl border p-5">
      <h2 className="font-heading text-lg font-medium">Set yourself up in under a minute</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Tell us the level you are at and we will tune what you see across the site.
      </p>
      <Link href="/onboarding" className={buttonVariants({ className: "mt-4" })}>
        Get started
      </Link>
    </section>
  );
}

function CollectionsSection({ collections }: { collections: Collection[] }) {
  if (!collections.length) return null;

  return (
    <FeedSection title="Featured collections" href="/collections" linkLabel="All collections">
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
      title={profile ? `Written for ${profile.role_level}s` : "Latest from Learn"}
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
      <Link href={`/wizards/${wizard.slug}`} className={buttonVariants({ className: "mt-4" })}>
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
        <Link href={href} className="text-muted-foreground text-sm hover:underline">
          {linkLabel} →
        </Link>
      </div>
      {children}
    </section>
  );
}

function CardGrid({ views, bookmarkedIds }: { views: ResourceView[]; bookmarkedIds: Set<string> }) {
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
