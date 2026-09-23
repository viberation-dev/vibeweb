import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildCommentTree,
  countCommentNodes,
  displayName,
  initialsFor,
  type CommentRow,
} from "./comment-tree.ts";

const row = (over: Partial<CommentRow> & Pick<CommentRow, "id">): CommentRow => ({
  body: "...",
  created_at: "2026-09-23T10:00:00Z",
  parent_id: null,
  user_id: "user-1",
  author: { username: "sana", avatar_path: null },
  comment_appreciations: [],
  ...over,
});

test("names a profile without a username rather than showing a blank", () => {
  assert.equal(displayName(null), "Member");
  assert.equal(displayName("   "), "Member");
  assert.equal(displayName("danish"), "danish");
});

test("takes initials from the first two words", () => {
  assert.equal(initialsFor("Ali Rizwan"), "AR");
  assert.equal(initialsFor("sana"), "SA");
});

test("nests replies under their parent", () => {
  const tree = buildCommentTree([
    row({ id: "a" }),
    row({ id: "b" }),
    row({ id: "a1", parent_id: "a" }),
  ]);

  assert.deepEqual(
    tree.map((node) => node.id),
    ["a", "b"],
  );
  assert.deepEqual(
    tree[0].replies.map((node) => node.id),
    ["a1"],
  );
  assert.equal(tree[1].replies.length, 0);
});

test("promotes a reply whose parent was moderated away", () => {
  // The parent is hidden, so RLS never returned it — the reply must survive.
  const tree = buildCommentTree([row({ id: "orphan", parent_id: "gone" })]);

  assert.deepEqual(
    tree.map((node) => node.id),
    ["orphan"],
  );
});

test("counts appreciations and marks the reader's own", () => {
  const tree = buildCommentTree(
    [
      row({
        id: "a",
        comment_appreciations: [{ user_id: "me" }, { user_id: "someone" }],
      }),
      row({ id: "b", comment_appreciations: [{ user_id: "someone" }] }),
    ],
    "me",
  );

  assert.equal(tree[0].appreciations, 2);
  assert.equal(tree[0].mine, true);
  assert.equal(tree[1].appreciations, 1);
  assert.equal(tree[1].mine, false);
});

test("a signed-out reader owns nothing and has appreciated nothing", () => {
  const tree = buildCommentTree(
    [row({ id: "a", user_id: "me", comment_appreciations: [{ user_id: "me" }] })],
    null,
  );

  assert.equal(tree[0].mine, false);
  assert.equal(tree[0].isAuthor, false);
});

test("counts replies as comments", () => {
  const tree = buildCommentTree([
    row({ id: "a" }),
    row({ id: "a1", parent_id: "a" }),
    row({ id: "a2", parent_id: "a" }),
    row({ id: "b" }),
  ]);

  assert.equal(countCommentNodes(tree), 4);
});
