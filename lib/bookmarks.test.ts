import assert from "node:assert/strict";
import { test } from "node:test";

import {
  bookmarkFolders,
  groupBookmarksByFolder,
  modelBookmarkView,
  UNFILED,
} from "./bookmarks.ts";
import type { Bookmark } from "./queries/bookmarks.ts";

function bookmark(targetId: string, folder: string | null): Bookmark {
  return {
    id: `bm-${targetId}`,
    user_id: "user-1",
    target_type: "tool",
    target_id: targetId,
    model_id: null,
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

test("a saved model's card is its family's, retitled and linked to the model", () => {
  const family = { href: "/tools/gemini", title: "Gemini", eyebrow: "AI model", description: "x" };

  assert.deepEqual(modelBookmarkView(family, "google/gemini-3.7-flash", "Gemini 3.7 Flash"), {
    href: "/tools/gemini?model=google/gemini-3.7-flash",
    title: "Gemini 3.7 Flash",
    eyebrow: "Gemini",
    description: "x",
  });
  // OpenRouter dropped it: the id stands in, the link still opens the family.
  assert.equal(modelBookmarkView(family, "google/gemini-old", undefined).title, "google/gemini-old");
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
