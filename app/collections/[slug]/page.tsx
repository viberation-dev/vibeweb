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
  const collection = await getCollectionBySlug(supabase, slug);

  if (!collection) {
    notFound();
  }

  const entries = await getCollectionEntries(supabase, collection.id);
  const views = entries.map((entry) =>
    entry.kind === "tool" ? toolView(entry.tool) : contentView(entry.content),
  );

  /*
   * Signed-out visitors still see Save buttons; pressing one sends them to
   * sign in. Only which ones read as saved needs a user. Both kinds are
   * fetched because a collection mixes tools and articles in one list.
   */
  const { data: auth } = await supabase.auth.getUser();
  const bookmarks = auth.user ? await listBookmarks(supabase, auth.user.id) : [];
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
