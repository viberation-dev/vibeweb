import assert from "node:assert/strict";
import { test } from "node:test";

import { BEGINNER_CATEGORIES, CATEGORY_GROUPS, TOOL_CATEGORIES } from "./tool-categories.ts";

test("every category sits in exactly one All tools group", () => {
  const grouped = CATEGORY_GROUPS.flatMap((group) => group.categories).sort();
  assert.deepEqual(grouped, TOOL_CATEGORIES.map((c) => c.value).sort());
});

test("the beginner row only names real categories", () => {
  const known = new Set(TOOL_CATEGORIES.map((c) => c.value));
  assert.ok(BEGINNER_CATEGORIES.every((value) => known.has(value)));
});
