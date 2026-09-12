import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import {
  FolderForm,
  RenameFolderForm,
} from "@/components/features/bookmarks/FolderForm";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import {
  bookmarkFolders,
  groupBookmarksByFolder,
  modelBookmarkView,
  UNFILED,
} from "@/lib/bookmarks";
import { getOpenRouterModels } from "@/lib/integrations/openrouter";
import { createClient } from "@/lib/integrations/supabase/server";
import { modelDisplayName } from "@/lib/model-facts";
import { listBookmarks } from "@/lib/queries/bookmarks";
import { resolveTargetViews } from "@/lib/queries/resources";
import { cn } from "@/lib/utils";

const chip = (active: boolean) =>
  cn(
    "rounded-full border px-3 py-1 text-xs transition-colors",
    active
      ? "border-transparent bg-primary text-primary-foreground"
      : "hover:bg-muted",
  );

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Everything you have saved, organised into folders.",
};

type Props = { searchParams: Promise<{ folder?: string }> };

export default async function BookmarksPage({ searchParams }: Props) {
  const active = (await searchParams).folder?.trim() || undefined;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    // The middleware already gates /account/bookmarks; this is the belt to its braces
    // and gives TypeScript a non-null user.
    redirect("/login?redirectTo=/account/bookmarks");
  }

  // The one list that shows saved models as well as saved tools (VIB-113).
  const bookmarks = await listBookmarks(supabase, data.user.id, undefined, {
    includeModels: true,
  });

  /*
   * groupBookmarksByFolder drops bookmarks whose target it cannot find —
   * the same path a deleted tool takes. Model names come from OpenRouter,
   * fetched only when something here is a model; it is cached for an hour
   * and empty rather than throwing, so an outage costs names, not the page.
   */
  const [saved, models] = await Promise.all([
    resolveTargetViews(supabase, bookmarks),
    bookmarks.some((bookmark) => bookmark.model_id)
      ? getOpenRouterModels()
      : null,
  ]);

  const folders = bookmarkFolders(bookmarks);
  /*
   * An unknown ?folder= narrows to nothing rather than 404ing — renaming a
   * folder invalidates any link to the old name, and a stale bookmark of
   * your own bookmarks page should still open.
   */
  const grouped = groupBookmarksByFolder(bookmarks, saved).filter(
    ([folder]) => !active || folder === active,
  );

  return (
    <>
      <h1 className="font-heading text-2xl font-semibold">Bookmarks</h1>
      <p className="text-muted-foreground mt-1">
        {bookmarks.length
          ? "Everything you have saved. Type a folder name on a card to organise it."
          : "Nothing saved yet."}
      </p>

      {folders.length > 1 ? (
        /*
          Folder chips, per mockup screen 9. Plain links so the filter is a
          real URL — shareable, back-button correct, no JavaScript.

          There is no "+ New" chip. `bookmarks.folder_name` is a column on
          the bookmark row, not a folders table, so a folder with nothing in
          it cannot exist — you make one by naming it on a card, which is
          what FolderForm already does. A chip that created nothing would be
          a control that lies.
        */
        <nav
          aria-label="Folders"
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <span className="text-muted-foreground text-xs">Folders:</span>
          <Link
            href="/account/bookmarks"
            aria-current={active ? undefined : "page"}
            className={chip(!active)}
          >
            All
          </Link>
          {folders.map((folder) => (
            <Link
              key={folder}
              href={`/account/bookmarks?folder=${encodeURIComponent(folder)}`}
              aria-current={active === folder ? "page" : undefined}
              className={chip(active === folder)}
            >
              {folder}
            </Link>
          ))}
        </nav>
      ) : null}

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
              {entries.map(({ bookmark, target }) => {
                const modelName =
                  bookmark.model_id && models?.get(bookmark.model_id)?.name;
                const view = bookmark.model_id
                  ? modelBookmarkView(
                      target,
                      bookmark.model_id,
                      modelName ? modelDisplayName(modelName) : undefined,
                    )
                  : target;
                return (
                  <li key={bookmark.id}>
                    <ResourceCard
                      href={view.href}
                      title={view.title}
                      eyebrow={view.eyebrow}
                      description={view.description}
                      badges={view.badges}
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
                            modelId={bookmark.model_id}
                            bookmarked
                            returnTo="/account/bookmarks"
                          />
                        </>
                      }
                    />
                  </li>
                );
              })}
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
    </>
  );
}
