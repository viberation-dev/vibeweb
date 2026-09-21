import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_BADGE_SETTINGS,
  toBadgeMode,
  toolBadge,
  toolBadgeLabel,
  type BadgeSettings,
} from "./tool-badges.ts";

const NOW = new Date("2026-09-21T12:00:00Z");

const settings = (over: Partial<BadgeSettings> = {}): BadgeSettings => ({
  ...DEFAULT_BADGE_SETTINGS,
  ...over,
});

const tool = (over: Partial<Parameters<typeof toolBadge>[0]> = {}) => ({
  badge: null,
  created_at: "2026-01-01T00:00:00Z",
  view_count: 0,
  ...over,
});

test("staff mode reads the column and nothing else", () => {
  // Brand new and heavily viewed, but the mode says the column decides.
  const fresh = tool({ created_at: "2026-09-20T00:00:00Z", view_count: 9_999 });
  assert.equal(toolBadge(fresh, settings(), NOW), null);
  assert.equal(toolBadge({ ...fresh, badge: "popular" }, settings(), NOW), "popular");
});

test("derived mode ignores the column", () => {
  const picked = tool({ badge: "popular" });
  assert.equal(toolBadge(picked, settings({ tool_badge_mode: "derived" }), NOW), null);
});

test("derived marks a tool added inside the window, and not one outside it", () => {
  const derived = settings({ tool_badge_mode: "derived", badge_new_days: 14 });
  assert.equal(
    toolBadge(tool({ created_at: "2026-09-10T00:00:00Z" }), derived, NOW),
    "new",
  );
  assert.equal(
    toolBadge(tool({ created_at: "2026-09-01T00:00:00Z" }), derived, NOW),
    null,
  );
});

test("popular beats new when a tool qualifies for both", () => {
  const derived = settings({ tool_badge_mode: "derived", badge_popular_views: 500 });
  const hit = tool({ created_at: "2026-09-20T00:00:00Z", view_count: 500 });
  assert.equal(toolBadge(hit, derived, NOW), "popular");
});

test("both: a staff badge wins, and the rules fill in the rest", () => {
  const both = settings({ tool_badge_mode: "both" });
  const viewed = tool({ badge: "new", view_count: 9_999 });
  assert.equal(toolBadge(viewed, both, NOW), "new");
  assert.equal(toolBadge(tool({ view_count: 9_999 }), both, NOW), "popular");
});

test("a future created_at is not newness, and an unparseable one is not either", () => {
  const derived = settings({ tool_badge_mode: "derived" });
  assert.equal(toolBadge(tool({ created_at: "2027-01-01T00:00:00Z" }), derived, NOW), null);
  assert.equal(toolBadge(tool({ created_at: "not a date" }), derived, NOW), null);
});

test("an unknown mode or badge value falls back rather than throwing", () => {
  assert.equal(toBadgeMode("shouty"), "staff");
  assert.equal(toBadgeMode(null), "staff");
  assert.equal(toolBadge(tool({ badge: "urgent" }), settings(), NOW), null);
});

test("the label is the word a card prints", () => {
  assert.equal(toolBadgeLabel(tool({ badge: "new" }), settings(), NOW), "New");
  assert.equal(toolBadgeLabel(tool(), settings(), NOW), undefined);
});
