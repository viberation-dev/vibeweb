import assert from "node:assert/strict";
import { test } from "node:test";

import {
  greetingFor,
  pickFeedTabs,
  progressLabel,
  toFeedTab,
} from "./home-feed.ts";

test("the greeting turns over at noon and six", () => {
  assert.equal(greetingFor(0), "Good morning");
  assert.equal(greetingFor(11), "Good morning");
  assert.equal(greetingFor(12), "Good afternoon");
  assert.equal(greetingFor(17), "Good afternoon");
  assert.equal(greetingFor(18), "Good evening");
  assert.equal(greetingFor(23), "Good evening");
});

test("the progress line counts steps the way a reader does", () => {
  // stepIndex is 0-based in the database, 1-based on screen.
  const { label, percent } = progressLabel(1, "Pick your stack", 4);
  assert.equal(label, "Step 2 of 4 · Pick your stack");
  assert.equal(percent, 25);
});

test("progress cannot overrun its own total", () => {
  // A walkthrough that loses a step leaves saved progress pointing past the end.
  const { label, percent } = progressLabel(9, undefined, 4);
  assert.equal(label, "Step 4 of 4");
  assert.equal(percent, 100);
});

test("an unstarted walkthrough reads as step 1, nothing done", () => {
  const { label, percent } = progressLabel(0, "Set up your editor", 4);
  assert.equal(label, "Step 1 of 4 · Set up your editor");
  assert.equal(percent, 0);
});

test("the feed falls back to For you rather than erroring", () => {
  assert.equal(toFeedTab("latest"), "latest");
  assert.equal(toFeedTab("for-you"), "for-you");
  assert.equal(toFeedTab(undefined), "for-you");
  assert.equal(toFeedTab("nonsense"), "for-you");
});

test("Top became selectable once content had a view counter", () => {
  // Dimmed until VIB-86 added content.view_count; before that, ordering by
  // anything would have been a made-up ranking.
  assert.equal(toFeedTab("top"), "top");
});

const item = (
  id: string,
  created: string,
  views: number,
  role_level: "beginner" | "intermediate" | "expert" | null = null,
) => ({ id, slug: id, created_at: created, view_count: views, role_level });

const pool = [
  item("a", "2026-09-01", 50),
  item("b", "2026-09-02", 40, "expert"),
  item("c", "2026-09-03", 30),
  item("d", "2026-09-04", 20),
  item("e", "2026-09-05", 10, "beginner"),
  item("f", "2026-09-06", 5, "expert"),
  item("g", "2026-09-07", 0),
];
const none = { affinity: () => 0, read: new Set<string>() };
const ids = (items: { id: string }[]) => items.map((i) => i.id).join("");

test("no item appears in two tabs when there is enough to go round", () => {
  const tabs = pickFeedTabs(pool, { ...none, roleLevel: "beginner" }, 2);
  const all = [...tabs["for-you"], ...tabs.top, ...tabs.latest].map(
    (i) => i.id,
  );
  assert.equal(new Set(all).size, all.length);
});

test("For you keeps to the tier, unread first, then tag overlap", () => {
  const tabs = pickFeedTabs(
    pool,
    {
      roleLevel: "beginner",
      affinity: (id) => (id === "a" ? 5 : 0),
      read: new Set(["g"]),
    },
    2,
  );
  // a: best overlap. e: newest unread in tier. g is read; b and f are expert.
  assert.equal(ids(tabs["for-you"]), "ae");
  // Top and Latest skip a and e.
  assert.equal(ids(tabs.top), "bc");
  assert.equal(ids(tabs.latest), "gf");
});

test("a short pool tops tabs up rather than leaving them empty", () => {
  const tabs = pickFeedTabs(pool.slice(0, 2), none, 2);
  assert.equal(tabs.latest.length, 2);
});
