import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { FolderForm, RenameFolderForm } from "@/components/features/bookmarks/FolderForm";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { bookmarkFolders, groupBookmarksByFolder, UNFILED } from "@/lib/bookmarks";
import { createClient } from "@/lib/integrations/supabase/server";
import { listBookmarks } from "@/lib/queries/bookmarks";
import { getToolsByIds } from "@/lib/queries/tools";
import { toolCategoryLabel } from "@/lib/tool-categories";

export const metadata: Metadata = {
  title: "Bookmarks — Viberation",
  description: "Everything you have saved, organised into folders.",
};

export default async function BookmarksPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    // The middleware already gates /bookmarks; this is the belt to its braces
    // and gives TypeScript a non-null user.
    redirect("/login?redirectTo=/bookmarks");
  }

  /*
   * Tools only for now — they are the one bookmarkable thing that exists.
   * Learn articles and collections join this page by hydrating their own ids
   * the same way, once those slices land.
   */
  const bookmarks = await listBookmarks(supabase, data.user.id, "tool");
  const tools = await getToolsByIds(
    supabase,
    bookmarks.map((bookmark) => bookmark.target_id),
  );

  const toolsById = new Map(tools.map((tool) => [tool.id, tool]));
  const folders = bookmarkFolders(bookmarks);
  const grouped = groupBookmarksByFolder(bookmarks, toolsById);

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <h1 className="font-heading text-2xl font-semibold">Bookmarks</h1>
      <p className="mt-1 text-muted-foreground">
        {bookmarks.length
          ? "Everything you have saved. Type a folder name to organise it."
          : "Nothing saved yet."}
      </p>

      {grouped.length ? (
        grouped.map(([folder, entries]) => (
          <section key={folder} className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-heading text-lg font-medium">{folder}</h2>
              {/* Unfiled is the absence of a folder, so there is nothing to rename. */}
              {folder === UNFILED ? null : <RenameFolderForm folder={folder} />}
            </div>
            <ul className="mt-3 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map(({ bookmark, target: tool }) => (
                <li key={bookmark.id}>
                  <ResourceCard
                    href={`/tools/${tool.slug}`}
                    title={tool.name}
                    eyebrow={toolCategoryLabel(tool.category)}
                    description={tool.tagline}
                    badges={tool.pricing_tier ? [tool.pricing_tier] : undefined}
                    action={
                      <>
                        <FolderForm
                          bookmarkId={bookmark.id}
                          folderName={bookmark.folder_name}
                          folders={folders}
                        />
                        <BookmarkButton
                          targetType="tool"
                          targetId={tool.id}
                          bookmarked
                          returnTo="/bookmarks"
                        />
                      </>
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        ))
      ) : (
        <p className="mt-8 text-muted-foreground">
          Browse the{" "}
          <Link href="/tools" className="underline">
            tools directory
          </Link>{" "}
          and hit Save on anything worth coming back to.
        </p>
      )}
    </main>
  );
}
