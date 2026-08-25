import type { Bookmark } from "@/lib/queries/bookmarks";

/** Bookmarks with no folder collect here, always shown last. */
export const UNFILED = "Unfiled";

/** The folder names a user has actually used, alphabetical. */
export function bookmarkFolders(bookmarks: Bookmark[]): string[] {
  const names = new Set<string>();
  for (const bookmark of bookmarks) {
    if (bookmark.folder_name) {
      names.add(bookmark.folder_name);
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

export type BookmarkGroup<T> = [folder: string, entries: { bookmark: Bookmark; target: T }[]];

/**
 * Bookmarks bucketed by folder, folders alphabetical and Unfiled last.
 *
 * `targets` is the hydrated map for one target kind, keyed by id. Bookmarks
 * whose target is missing from it are dropped: nothing deletes a bookmark
 * when its tool goes away (no foreign key can span a polymorphic target), so
 * this is the place that notices.
 */
export function groupBookmarksByFolder<T>(
  bookmarks: Bookmark[],
  targets: Map<string, T>,
): BookmarkGroup<T>[] {
  const groups = new Map<string, { bookmark: Bookmark; target: T }[]>();

  for (const bookmark of bookmarks) {
    const target = targets.get(bookmark.target_id);
    if (target === undefined) continue;

    const folder = bookmark.folder_name ?? UNFILED;
    const entries = groups.get(folder) ?? [];
    entries.push({ bookmark, target });
    groups.set(folder, entries);
  }

  return [...groups].sort(([a], [b]) => {
    if (a === UNFILED) return 1;
    if (b === UNFILED) return -1;
    return a.localeCompare(b);
  });
}
