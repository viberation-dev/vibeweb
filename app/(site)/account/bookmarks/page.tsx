import { IconBook2, IconCompass } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import {
  FolderForm,
  RenameFolderForm,
} from "@/components/features/bookmarks/FolderForm";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { ButtonIcon, buttonVariants } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { SectionHead } from "@/components/ui/section-head";
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
    "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
    active
      ? "bg-primary text-primary-foreground"
      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-primary/10",
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
      <SectionHead
        level="h1"
        title="Bookmarks"
        lede={
          bookmarks.length
            ? "Everything you have saved. Type a folder name on a card to file it."
            : "Nothing saved yet."
        }
        className="mb-7"
      />

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
              <h2 className="font-heading text-lg font-bold tracking-tight">
                {folder}
              </h2>
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
        <Panel className="text-center">
          <h2 className="font-heading text-xl font-bold tracking-tight">
            Nothing saved yet
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-[46ch] leading-relaxed">
            Press Save on any tool or guide and it lands here. Name a folder on
            a card and you have somewhere to put the next one.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/tools"
              className={buttonVariants({ variant: "pill", size: "pill-sm" })}
            >
              <ButtonIcon size="sm">
                <IconCompass />
              </ButtonIcon>
              Find a tool
            </Link>
            <Link
              href="/learn"
              className={buttonVariants({
                variant: "pill-soft",
                size: "pill-sm",
                className: "bg-card hover:bg-accent",
              })}
            >
              <ButtonIcon tone="on-soft" size="sm" className="bg-secondary">
                <IconBook2 />
              </ButtonIcon>
              Read a guide
            </Link>
          </div>
        </Panel>
      )}
    </>
  );
}
