import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { createClient } from "@/lib/integrations/supabase/server";
import { listBookmarks } from "@/lib/queries/bookmarks";
import { getCollectionBySlug, getCollectionEntries } from "@/lib/queries/collections";
import { contentView, toolView } from "@/lib/resource-view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const collection = await getCollectionBySlug(supabase, slug);

  if (!collection) {
    return { title: "Collection not found — Viberation" };
  }
  return {
    title: `${collection.title} — Viberation`,
    description: collection.description ?? undefined,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  /*
   * Two waves, not four. The row and the session do not depend on each other,
   * and neither do the tags and the saved state — issuing them serially cost
   * two extra Supabase round trips per view, which is the whole page budget
   * when the database is a continent away (VIB-56).
   */
  const [collection, { data: auth }] = await Promise.all([
    getCollectionBySlug(supabase, slug),
    supabase.auth.getUser(),
  ]);

  if (!collection) {
    notFound();
  }

  /*
   * Signed-out visitors still see Save buttons; pressing one sends them to
   * sign in. Only which ones read as saved needs a user. Both kinds are
   * fetched because a collection mixes tools and articles in one list.
   */
  const [entries, bookmarks] = await Promise.all([
    getCollectionEntries(supabase, collection.id),
    auth.user ? listBookmarks(supabase, auth.user.id) : Promise.resolve([]),
  ]);

  const views = entries.map((entry) =>
    entry.kind === "tool" ? toolView(entry.tool) : contentView(entry.content),
  );
  const bookmarkedIds = new Set(bookmarks.map((bookmark) => bookmark.target_id));

  const returnTo = `/collections/${collection.slug}`;

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <Link href="/collections" className="text-sm text-muted-foreground hover:underline">
        ← All collections
      </Link>

      <h1 className="mt-4 font-heading text-3xl font-semibold">{collection.title}</h1>
      {collection.description ? (
        <p className="mt-2 text-lg text-muted-foreground">{collection.description}</p>
      ) : null}

      {views.length ? (
        <ul className="mt-8 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    returnTo={returnTo}
                  />
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-muted-foreground">
          Nothing in this collection yet — or everything in it has since been removed.
        </p>
      )}
    </main>
  );
}
