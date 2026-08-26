import assert from "node:assert/strict";
import { test } from "node:test";

import { normaliseQuery } from "./search-query.ts";

test("blank input is not a search", () => {
  // The page uses this to decide whether to query at all — an empty tsquery
  // would otherwise go to the database to match nothing.
  assert.equal(normaliseQuery(undefined), "");
  assert.equal(normaliseQuery(""), "");
  assert.equal(normaliseQuery("   "), "");
  assert.equal(normaliseQuery("\n\t "), "");
});

test("surrounding whitespace is trimmed", () => {
  assert.equal(normaliseQuery("  deploy  "), "deploy");
});

test("a pasted essay is capped rather than sent whole", () => {
  const long = "a".repeat(5000);
  assert.equal(normaliseQuery(long).length, 200);
});

test("ordinary queries pass through untouched", () => {
  assert.equal(normaliseQuery("deploy vercel"), "deploy vercel");
  // websearch_to_tsquery handles operators itself; nothing is stripped here.
  assert.equal(normaliseQuery('"exact phrase" -excluded'), '"exact phrase" -excluded');
});
