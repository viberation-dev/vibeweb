import assert from "node:assert/strict";
import { test } from "node:test";

import { compareRows } from "./compare.ts";

const cursor = {
  category: "ides" as const,
  pricing_tier: "Freemium",
  platform: ["macos", "windows"],
  best_for: "beginner" as const,
  key_facts: [
    { label: "Paid plans from", value: "$20 a month" },
    { label: "Local models", value: "No" },
    { label: "Pricing", value: "a duplicate of the fixed row" },
  ],
};
const devin = {
  category: "ides" as const,
  pricing_tier: null,
  platform: [],
  best_for: null,
  key_facts: [
    { label: "Agent", value: "Devin Local" },
    { label: "Paid plans from", value: "$20 a month (Pro)" },
  ],
};

test("fixed rows first, then key facts in first-seen order", () => {
  const labels = compareRows(cursor, devin).map((r) => r.label);
  assert.deepEqual(labels, [
    "Category",
    "Pricing",
    "Free tier",
    "Platform",
    "Best for",
    "Paid plans from",
    "Local models",
    "Agent",
  ]);
});

test("a side without a value says so instead of guessing", () => {
  const rows = new Map(compareRows(cursor, devin).map((r) => [r.label, r]));
  assert.equal(rows.get("Pricing")?.b, "Not stated");
  assert.equal(rows.get("Local models")?.b, "Not stated");
  assert.equal(rows.get("Agent")?.a, "Not stated");
  assert.equal(rows.get("Paid plans from")?.b, "$20 a month (Pro)");
});

test("a key fact reusing a fixed label never prints twice", () => {
  const pricing = compareRows(cursor, devin).filter((r) => r.label === "Pricing");
  assert.equal(pricing.length, 1);
  assert.equal(pricing[0].a, "Freemium");
});

test("a row neither side states is left out", () => {
  const bare = { ...devin, key_facts: [] };
  const labels = compareRows(bare, bare).map((r) => r.label);
  assert.deepEqual(labels, ["Category"]);
});
