import { test } from "node:test";
import assert from "node:assert/strict";

import {
  CHANGELOG,
  changelogByDate,
  formatChangelogDate,
  sortedChangelog,
  type ChangelogEntry,
} from "./changelog.ts";

const entry = (date: string, title: string): ChangelogEntry => ({
  date,
  title,
  body: "…",
  kind: "added",
});

test("newest date first", () => {
  const sorted = sortedChangelog([
    entry("2026-01-01", "old"),
    entry("2026-03-01", "new"),
    entry("2026-02-01", "middle"),
  ]);
  assert.deepEqual(
    sorted.map((e) => e.title),
    ["new", "middle", "old"],
  );
});

test("same-day entries have a stable order rather than input order", () => {
  const sorted = sortedChangelog([
    entry("2026-03-01", "zebra"),
    entry("2026-03-01", "apple"),
  ]);
  assert.deepEqual(
    sorted.map((e) => e.title),
    ["apple", "zebra"],
  );
});

test("groups consecutive entries under one date", () => {
  const groups = changelogByDate([
    entry("2026-03-01", "a"),
    entry("2026-03-01", "b"),
    entry("2026-02-01", "c"),
  ]);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].date, "2026-03-01");
  assert.equal(groups[0].entries.length, 2);
  assert.equal(groups[1].entries.length, 1);
});

test("dates render in UTC, so the day never slips by timezone", () => {
  // A machine behind UTC would render the 10th for a local-time parse.
  assert.equal(formatChangelogDate("2026-09-11"), "11 September 2026");
  assert.equal(formatChangelogDate("2026-01-01"), "1 January 2026");
});

test("every shipped entry is well-formed", () => {
  for (const item of CHANGELOG) {
    assert.match(item.date, /^\d{4}-\d{2}-\d{2}$/, `bad date: ${item.title}`);
    assert.ok(item.title.trim(), "an entry needs a title");
    assert.ok(item.body.trim(), "an entry needs a body");
    // Issue IDs are for the repo, not for visitors.
    assert.doesNotMatch(item.body, /VIB-\d+/, `${item.title} leaks an issue ID`);
  }
});
