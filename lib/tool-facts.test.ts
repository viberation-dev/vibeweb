import assert from "node:assert/strict";
import { test } from "node:test";

import { hasFreeTier, isOpenSource } from "./tool-facts.ts";

test("everything but Paid has a free tier", () => {
  assert.ok(hasFreeTier("Free"));
  assert.ok(hasFreeTier("Freemium"));
  // The regression this file exists for: reading this off the free-tier tag
  // claimed "No" for all ten Open-source-priced tools in the seed.
  assert.ok(hasFreeTier("Open source"));
  assert.equal(hasFreeTier("Paid"), false);
});

test("an unknown or missing tier answers No, not Yes", () => {
  // Claiming something is free is the direction that costs a reader money
  // to discover is wrong.
  assert.equal(hasFreeTier(null), false);
  assert.equal(hasFreeTier(""), false);
  assert.equal(hasFreeTier("Enterprise"), false);
});

test("open source is true from the pricing tier alone", () => {
  // One seeded tool is priced "Open source" but carries no open-source tag,
  // and would otherwise have denied being open source about itself.
  assert.ok(isOpenSource("Open source", []));
});

test("open source is also true from the tag alone", () => {
  // And one is tagged open-source while priced "Free", which the pricing
  // tier alone would miss.
  assert.ok(isOpenSource("Free", ["beginner-friendly", "open-source"]));
});

test("neither signal means No", () => {
  assert.equal(isOpenSource("Freemium", ["beginner-friendly", "code-generation"]), false);
  assert.equal(isOpenSource("Paid", []), false);
  assert.equal(isOpenSource(null, []), false);
});

test("a Set of slugs works as well as an array", () => {
  // The page holds tag slugs in a Set for the header pills.
  assert.ok(isOpenSource("Paid", new Set(["open-source"])));
  assert.equal(isOpenSource("Paid", new Set(["automation"])), false);
});
