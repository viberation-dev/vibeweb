import type { Metadata } from "next";
import Link from "next/link";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { CollectionCard } from "@/components/features/collections/CollectionCard";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { SearchInput } from "@/components/features/search/SearchInput";
import { search } from "@/lib/integrations/search";
import { createClient } from "@/lib/integrations/supabase/server";
import { listBookmarks } from "@/lib/queries/bookmarks";
import { contentView, toolView } from "@/lib/resource-view";

export const metadata: Metadata = {
  title: "Search — Viberation",
  description: "Search the tool directory, Learn, and curated collections.",
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

/**
 * Search results (§31, VIB-49).
 *
 * Tools and Learn content in one relevance-ordered list, rendered through
 * the shared ResourceCard so a result looks like the thing it points at.
 */
export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;

  const supabase = await createClient();

  /*
   * The search and the session do not depend on each other, so they go out
   * together (VIB-56). Bookmarks need the user id, hence the second wave.
   */
  const [results, { data: auth }] = await Promise.all([
    search(supabase, q),
    supabase.auth.getUser(),
  ]);

  const bookmarks = auth.user ? await listBookmarks(supabase, auth.user.id) : [];
  const bookmarkedIds = new Set(bookmarks.map((bookmark) => bookmark.target_id));

  const returnTo = results.query ? `/search?q=${encodeURIComponent(results.query)}` : "/search";

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <h1 className="font-heading text-2xl font-semibold">Search</h1>
      <p className="mt-1 text-muted-foreground">
        Across the tool directory, Learn, and curated collections — including their tags.
      </p>

      <SearchInput defaultValue={results.query} className="mt-6 max-w-xl" />

      {results.query ? (
        <p aria-live="polite" className="mt-6 text-sm text-muted-foreground">
          {results.total === 0
            ? `Nothing matches “${results.query}”.`
            : `${results.total} result${results.total === 1 ? "" : "s"} for “${results.query}”.`}
        </p>
      ) : null}

      {results.hits.length ? (
        <ul className="mt-6 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.hits.map((hit) => {
            /*
             * Collections render as themselves rather than through
             * ResourceCard — a result should look like the thing it points
             * at, and a collection is a container with no bookmark toggle.
             */
            if (hit.kind === "collection") {
              return (
                <li key={`collection:${hit.collection.id}`}>
                  <CollectionCard collection={hit.collection} eyebrow="Collection" />
                </li>
              );
            }

            const view = hit.kind === "tool" ? toolView(hit.tool) : contentView(hit.content);
            return (
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
            );
          })}
        </ul>
      ) : (
        <div className="mt-8 text-muted-foreground">
          {results.query ? (
            <p>
              Try a different word, or browse the{" "}
              <Link href="/tools" className="underline">
                directory
              </Link>{" "}
              and{" "}
              <Link href="/learn" className="underline">
                Learn
              </Link>{" "}
              instead.
            </p>
          ) : (
            <p>Type something above to search tools and guides.</p>
          )}
        </div>
      )}
    </main>
  );
}
