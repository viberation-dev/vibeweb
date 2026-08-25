import assert from "node:assert/strict";
import { test } from "node:test";

import { bookmarkFolders, groupBookmarksByFolder, UNFILED } from "./bookmarks.ts";
import type { Bookmark } from "./queries/bookmarks.ts";

function bookmark(targetId: string, folder: string | null): Bookmark {
  return {
    id: `bm-${targetId}`,
    user_id: "user-1",
    target_type: "tool",
    target_id: targetId,
    folder_name: folder,
    created_at: "2026-08-25T00:00:00Z",
  };
}

const targets = new Map([
  ["a", "Tool A"],
  ["b", "Tool B"],
  ["c", "Tool C"],
]);

test("folders are alphabetical, deduped, and exclude unfiled bookmarks", () => {
  const folders = bookmarkFolders([
    bookmark("a", "Shipping"),
    bookmark("b", null),
    bookmark("c", "Reading"),
    bookmark("d", "Shipping"),
  ]);

  assert.deepEqual(folders, ["Reading", "Shipping"]);
});

test("groups sort alphabetically with Unfiled last", () => {
  const grouped = groupBookmarksByFolder(
    [bookmark("a", null), bookmark("b", "Shipping"), bookmark("c", "Reading")],
    targets,
  );

  assert.deepEqual(
    grouped.map(([folder]) => folder),
    ["Reading", "Shipping", UNFILED],
  );
});

test("bookmarks whose target no longer exists are dropped", () => {
  const grouped = groupBookmarksByFolder(
    [bookmark("a", "Shipping"), bookmark("gone", "Shipping")],
    targets,
  );

  assert.equal(grouped.length, 1);
  assert.deepEqual(
    grouped[0][1].map((entry) => entry.target),
    ["Tool A"],
  );
});
