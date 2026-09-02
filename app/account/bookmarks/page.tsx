import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { FolderForm, RenameFolderForm } from "@/components/features/bookmarks/FolderForm";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { bookmarkFolders, groupBookmarksByFolder, UNFILED } from "@/lib/bookmarks";
import { createClient } from "@/lib/integrations/supabase/server";
import { listBookmarks } from "@/lib/queries/bookmarks";
import { resolveTargetViews } from "@/lib/queries/resources";

export const metadata: Metadata = {
  title: "Bookmarks — Viberation",
  description: "Everything you have saved, organised into folders.",
};

export default async function BookmarksPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    // The middleware already gates /account/bookmarks; this is the belt to its braces
    // and gives TypeScript a non-null user.
    redirect("/login?redirectTo=/account/bookmarks");
  }

  const bookmarks = await listBookmarks(supabase, data.user.id);

  /*
   * groupBookmarksByFolder drops bookmarks whose target it cannot find —
   * the same path a deleted tool takes.
   */
  const saved = await resolveTargetViews(supabase, bookmarks);

  const folders = bookmarkFolders(bookmarks);
  const grouped = groupBookmarksByFolder(bookmarks, saved);

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
            {/*
              Not justify-between: that threw the rename control to the far
              right edge of the page, where it read as unrelated to the
              heading it renames. It belongs next to the folder name.
            */}
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-heading text-lg font-medium">{folder}</h2>
              {/* Unfiled is the absence of a folder, so there is nothing to rename. */}
              {folder === UNFILED ? null : <RenameFolderForm folder={folder} />}
            </div>
            <ul className="mt-3 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map(({ bookmark, target }) => (
                <li key={bookmark.id}>
                  <ResourceCard
                    href={target.href}
                    title={target.title}
                    eyebrow={target.eyebrow}
                    description={target.description}
                    badges={target.badges}
                    action={
                      <>
                        <FolderForm
                          bookmarkId={bookmark.id}
                          folderName={bookmark.folder_name}
                          folders={folders}
                        />
                        <BookmarkButton
                          targetType={target.targetType}
                          targetId={bookmark.target_id}
                          bookmarked
                          returnTo="/account/bookmarks"
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
          or{" "}
          <Link href="/learn" className="underline">
            Learn
          </Link>{" "}
          and hit Save on anything worth coming back to.
        </p>
      )}
    </main>
  );
}
