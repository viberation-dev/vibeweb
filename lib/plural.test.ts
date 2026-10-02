import assert from "node:assert/strict";
import { test } from "node:test";

import { countLabel, formatCount, pluralise } from "./plural.ts";

test("one takes the singular, everything else the plural", () => {
  assert.equal(pluralise(1, "view"), "view");
  assert.equal(pluralise(2, "view"), "views");
  assert.equal(pluralise(0, "view"), "views");
});

test("an explicit plural wins over stem plus s", () => {
  assert.equal(pluralise(1, "entry", "entries"), "entry");
  assert.equal(pluralise(3, "entry", "entries"), "entries");
});

test("groups thousands the en-GB way", () => {
  assert.equal(formatCount(999), "999");
  assert.equal(formatCount(1204), "1,204");
  assert.equal(formatCount(1234567), "1,234,567");
});

test("labels the count with the right noun form", () => {
  assert.equal(countLabel(1, "view"), "1 view");
  assert.equal(countLabel(2, "view"), "2 views");
  assert.equal(countLabel(1204, "view"), "1,204 views");
  assert.equal(countLabel(0, "step"), "0 steps");
});
