import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { createClient } from "@/lib/integrations/supabase/server";
import { listBookmarks } from "@/lib/queries/bookmarks";
import { listContent } from "@/lib/queries/content";
import { getTagBySlug } from "@/lib/queries/tags";
import { listTools } from "@/lib/queries/tools";
import { contentView, toolView } from "@/lib/resource-view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const tag = await getTagBySlug(supabase, slug);

  if (!tag) {
    return { title: "Tag not found — Viberation" };
  }
  return {
    title: `${tag.name} — Viberation`,
    description: `Tools and guides tagged ${tag.name}.`,
  };
}

/**
 * Tag landing (§31, VIB-50).
 *
 * A tag spans tools *and* Learn content, which is the whole reason this
 * route exists: `/tools?tag=` could only ever answer half the question, so a
 * tagged article sent you to a directory that had never heard of it.
 */
export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const [tag, { data: auth }] = await Promise.all([
    getTagBySlug(supabase, slug),
    supabase.auth.getUser(),
  ]);

  if (!tag) {
    notFound();
  }

  // Both sides of the tag, plus the saved state, in one wave (VIB-56).
  const [tools, content, bookmarks] = await Promise.all([
    listTools(supabase, { tag: tag.slug }),
    listContent(supabase, { tag: tag.slug }),
    auth.user ? listBookmarks(supabase, auth.user.id) : Promise.resolve([]),
  ]);

  const bookmarkedIds = new Set(bookmarks.map((bookmark) => bookmark.target_id));

  // Tools first, then guides: a tag is most often a thing you want before it
  // is a thing you want to read about.
  const views = [...tools.tools.map(toolView), ...content.items.map(contentView)];
  const total = tools.total + content.total;

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <Link href="/tools" className="text-sm text-muted-foreground hover:underline">
        ← All tools
      </Link>

      <h1 className="mt-4 font-heading text-2xl font-semibold">{tag.name}</h1>
      <p className="mt-1 text-muted-foreground" aria-live="polite">
        {total === 0
          ? "Nothing carries this tag yet."
          : `${total} result${total === 1 ? "" : "s"} across tools and Learn.`}
      </p>

      {views.length ? (
        <ul className="mt-6 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    returnTo={`/tags/${tag.slug}`}
                  />
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-muted-foreground">
          Browse the{" "}
          <Link href="/tools" className="underline">
            directory
          </Link>{" "}
          or{" "}
          <Link href="/learn" className="underline">
            Learn
          </Link>{" "}
          instead.
        </p>
      )}
    </main>
  );
}
