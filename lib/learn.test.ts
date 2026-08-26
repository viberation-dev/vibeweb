import assert from "node:assert/strict";
import { test } from "node:test";

import {
  contentPreview,
  contentTypeLabel,
  learnHref,
  LEARN_TYPE_VALUES,
  toContentType,
} from "./learn.ts";

const CHEATSHEET_BODY = `git status                 what is actually changed right now
git diff                   what changed, line by line, unstaged
git add -p                 stage selected chunks, not whole files`;

const PROSE_BODY = `Vibe coding is building software by describing what you want.

That does not mean you stop thinking.`;

test("a cheatsheet preview is one line, not the whole collapsed table", () => {
  // Collapsing a cheatsheet's first paragraph runs every column together:
  // "git status what is actually changed right now git diff what changed…".
  assert.equal(
    contentPreview("cheatsheet", CHEATSHEET_BODY),
    "git status what is actually changed right now",
  );
});

test("prose still previews its opening paragraph", () => {
  assert.equal(
    contentPreview("article", PROSE_BODY),
    "Vibe coding is building software by describing what you want.",
  );
});

test("previews handle an empty or missing body", () => {
  assert.equal(contentPreview("article", null), null);
  assert.equal(contentPreview("article", "   "), null);
});

test("a long preview is truncated with an ellipsis", () => {
  const preview = contentPreview("article", "word ".repeat(80));
  assert.ok(preview);
  assert.ok(preview.length <= 160);
  assert.ok(preview.endsWith("…"));
});

test("the hub lists every content type except staff-facing role guides", () => {
  assert.ok(LEARN_TYPE_VALUES.includes("help_article"));
  assert.ok(!LEARN_TYPE_VALUES.includes("role_guide"));
});

test("untrusted params narrow to real values", () => {
  assert.equal(toContentType("guide"), "guide");
  // Listable types only — role_guide has a detail page but no filter chip.
  assert.equal(toContentType("role_guide"), undefined);
  assert.equal(toContentType("nonsense"), undefined);
  assert.equal(toContentType(undefined), undefined);
});

test("hrefs drop empty params and omit page 1", () => {
  assert.equal(learnHref({}), "/learn");
  assert.equal(learnHref({ page: 1 }), "/learn");
  assert.equal(learnHref({ type: "guide", page: 3 }), "/learn?type=guide&page=3");
  assert.equal(learnHref({ level: "all" }), "/learn?level=all");
});

test("every content type has a display label", () => {
  assert.equal(contentTypeLabel("course_link"), "Course");
  assert.equal(contentTypeLabel("role_guide"), "Role guide");
});
