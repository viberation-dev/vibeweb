import assert from "node:assert/strict";
import test from "node:test";

import { CATEGORY_GUIDES, hiddenGuides } from "./category-guides.ts";
import { TOOL_CATEGORIES, toToolCategory } from "./tool-categories.ts";

test("every category has a guide and every guide link targets a real category", () => {
  for (const { value } of TOOL_CATEGORIES) {
    const guide = CATEGORY_GUIDES[value];
    assert.ok(guide, value);
    for (const kind of guide.kinds) {
      for (const link of kind.links) {
        assert.ok(toToolCategory(link.category), `${value}: ${link.category}`);
      }
    }
  }
});

test("visitor-facing guide copy has no em dashes", () => {
  assert.doesNotMatch(JSON.stringify(CATEGORY_GUIDES), /—/);
});

test("hiddenGuides reads the cookie list", () => {
  assert.deepEqual(hiddenGuides(undefined), []);
  assert.deepEqual(hiddenGuides(""), []);
  assert.deepEqual(hiddenGuides("agents,ides"), ["agents", "ides"]);
});
