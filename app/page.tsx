import Link from "next/link";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/integrations/supabase/server";
import { LEARN_TYPE_VALUES } from "@/lib/learn";
import { listBookmarks } from "@/lib/queries/bookmarks";
import { listFeaturedCollections } from "@/lib/queries/collections";
import { listContent } from "@/lib/queries/content";
import { getProfile } from "@/lib/queries/profiles";
import { listTools } from "@/lib/queries/tools";
import { listWizards } from "@/lib/queries/wizards";
import { contentView, toolView, type ResourceView } from "@/lib/resource-view";

/**
 * Home / discovery feed (§31 Part 2).
 *
 * Sections, top to bottom: hero or greeting · onboarding nudge · featured
 * collections · latest content (role-adaptive) · most-viewed tools · the
 * flagship wizard promo.
 */
export default async function HomePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  // The signed-in tier drives the "latest content" section, so it is needed
  // before those queries run.
  const profile = auth.user ? await getProfile(supabase, auth.user.id) : null;

  const [collections, { items: latest }, { tools }, bookmarks, wizards] = await Promise.all([
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
  ]);

  // §31 puts the flagship promo last. Nothing renders it when no wizard is
  // published, so the section cannot point at a route that 404s.
  const flagship = wizards[0];

  const bookmarkedIds = new Set(bookmarks.map((bookmark) => bookmark.target_id));
  const greeting = profile?.username ?? auth.user?.email?.split("@")[0];

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      {auth.user ? (
        <section>
          <h1 className="font-heading text-3xl font-semibold">
            Welcome back{greeting ? `, ${greeting}` : ""}.
          </h1>
          <p className="mt-2 text-muted-foreground">
            Picking up where the directory and your saved things left off.
          </p>
        </section>
      ) : (
        <section className="py-6">
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            The tools that actually get your project shipped.
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
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
      )}

      {/* Only for someone who has not been through it — never for visitors. */}
      {profile && !profile.onboarding_completed ? (
        <section className="mt-8 rounded-xl border bg-muted/40 p-5">
          <h2 className="font-heading text-lg font-medium">Set yourself up in under a minute</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us the level you are at and we will tune what you see across the site.
          </p>
          <Link href="/onboarding" className={buttonVariants({ className: "mt-4" })}>
            Get started
          </Link>
        </section>
      ) : null}

      {collections.length ? (
        <FeedSection title="Featured collections" href="/collections" linkLabel="All collections">
          <ul className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <li key={collection.id}>
                <Card className="relative h-full transition-colors hover:bg-muted/40 focus-within:ring-2 focus-within:ring-ring">
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit">
                      Collection
                    </Badge>
                    <CardTitle>
                      <Link
                        href={`/collections/${collection.slug}`}
                        className="after:absolute after:inset-0 outline-none"
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
      ) : null}

      {latest.length ? (
        <FeedSection
          title={profile ? `Written for ${profile.role_level}s` : "Latest from Learn"}
          href="/learn"
          linkLabel="All of Learn"
        >
          <CardGrid views={latest.map(contentView)} bookmarkedIds={bookmarkedIds} />
        </FeedSection>
      ) : null}

      {tools.length ? (
        <FeedSection title="Most viewed tools" href="/tools" linkLabel="All tools">
          <CardGrid views={tools.map(toolView)} bookmarkedIds={bookmarkedIds} />
        </FeedSection>
      ) : null}

      {flagship ? (
        <section className="mt-12 rounded-xl border bg-muted/40 p-6">
          <Badge variant="secondary" className="w-fit">
            Guided build
          </Badge>
          <h2 className="mt-2 font-heading text-xl font-medium">{flagship.title}</h2>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            {flagship.steps.length} steps, ending with something real on the internet:{" "}
            {flagship.steps.map((step) => step.title).join(" → ")}.
          </p>
          <Link href={`/wizards/${flagship.slug}`} className={buttonVariants({ className: "mt-4" })}>
            Start the build
          </Link>
        </section>
      ) : null}
    </main>
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
        <Link href={href} className="text-sm text-muted-foreground hover:underline">
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
