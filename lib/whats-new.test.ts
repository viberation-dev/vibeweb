import assert from "node:assert/strict";
import { test } from "node:test";

import {
  changelogInputs,
  groupByMonth,
  mergeWhatsNew,
  toWhatsNewEvent,
  toWhatsNewKind,
  whatsNewKey,
  type WhatsNewInput,
} from "./whats-new.ts";

const NOW = new Date("2026-10-02T12:00:00Z");

const input = (over: Partial<WhatsNewInput> = {}): WhatsNewInput => ({
  id: "a",
  kind: "tool",
  title: "A tool",
  addedAt: "2026-10-01T00:00:00Z",
  revisedAt: null,
  note: null,
  ...over,
});

const merge = (inputs: WhatsNewInput[], newDays = 14) =>
  mergeWhatsNew(inputs, { newDays, now: NOW });

/*
 * `at` is always canonical ISO with milliseconds, whatever the input spelling.
 * That is deliberate and load-bearing: the sort is a string comparison, and the
 * four sources disagree — Postgres timestamptz arrives as "+00:00", changelog
 * entries are bare "YYYY-MM-DD". Normalising makes the comparison format-proof.
 */

test("an addition is labelled added, at its added date", () => {
  const [entry] = merge([input()]);
  assert.equal(entry.event, "added");
  assert.equal(entry.at, "2026-10-01T00:00:00.000Z");
  assert.equal(entry.note, null);
});

test("a revision is labelled updated, at its revision date, carrying the note", () => {
  const [entry] = merge([
    input({
      addedAt: "2026-03-01T00:00:00Z",
      revisedAt: "2026-10-01T00:00:00Z",
      note: "Added Opus 5.5 pricing",
    }),
  ]);
  assert.equal(entry.event, "updated");
  assert.equal(entry.at, "2026-10-01T00:00:00.000Z");
  assert.equal(entry.note, "Added Opus 5.5 pricing");
});

test("a revised item appears once, not twice", () => {
  const entries = merge([
    input({
      addedAt: "2026-03-01T00:00:00Z",
      revisedAt: "2026-10-01T00:00:00Z",
      note: "n",
    }),
  ]);
  assert.equal(entries.length, 1);
});

test("the event follows the chosen date, not the presence of revisedAt", () => {
  // Data entry error: revised before it was ever published. greatest() picks
  // the added date, so the label must say Added, not Updated at an older date.
  const [entry] = merge([
    input({
      addedAt: "2026-10-01T00:00:00Z",
      revisedAt: "2026-02-01T00:00:00Z",
      note: "n",
    }),
  ]);
  assert.equal(entry.event, "added");
  assert.equal(entry.at, "2026-10-01T00:00:00.000Z");
  assert.equal(entry.note, null, "an addition carries no revision note");
});

test("newest first, across kinds, ties broken on title", () => {
  const entries = merge([
    input({ id: "old", title: "Older", addedAt: "2026-09-01T00:00:00Z" }),
    input({
      id: "new",
      kind: "content",
      title: "Newer",
      addedAt: "2026-10-01T00:00:00Z",
    }),
    input({
      id: "tie-b",
      kind: "collection",
      title: "Beta",
      addedAt: "2026-10-01T00:00:00Z",
    }),
  ]);
  assert.deepEqual(
    entries.map((e) => e.title),
    ["Beta", "Newer", "Older"],
  );
});

test("a future revision date is ignored, and the item stays as an addition", () => {
  // Clock skew or a typo'd year would otherwise pin an item to the top of the
  // stream permanently. Hiding the item outright would be worse than ignoring
  // the bad date: it is a real, published item with a real added date.
  const entries = merge([
    input({
      id: "future-revision",
      title: "Bad revision date",
      addedAt: "2026-10-01T00:00:00Z",
      revisedAt: "2027-01-01T00:00:00Z",
      note: "n",
    }),
  ]);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].event, "added");
  assert.equal(entries[0].at, "2026-10-01T00:00:00.000Z");
});

test("an item whose only date is in the future is excluded", () => {
  const entries = merge([
    input({ id: "future", addedAt: "2027-01-01T00:00:00Z" }),
    input({ id: "fine" }),
  ]);
  assert.deepEqual(
    entries.map((e) => e.id),
    ["fine"],
  );
});

test("a null or unparseable date is excluded, not sorted first", () => {
  const entries = merge([
    input({ id: "nodate", addedAt: null }),
    input({ id: "junk", addedAt: "not a date" }),
    input({ id: "fine" }),
  ]);
  assert.deepEqual(
    entries.map((e) => e.id),
    ["fine"],
  );
});

test("isNew is inclusive at the badge_new_days boundary", () => {
  const [onBoundary] = merge([input({ addedAt: "2026-09-18T12:00:00Z" })], 14);
  assert.equal(onBoundary.isNew, true, "exactly 14 days old is still new");

  const [pastIt] = merge([input({ addedAt: "2026-09-18T11:59:59Z" })], 14);
  assert.equal(pastIt.isNew, false);
});

test("limit caps the result after sorting, keeping the newest", () => {
  const entries = mergeWhatsNew(
    [
      input({ id: "a", addedAt: "2026-09-01T00:00:00Z" }),
      input({ id: "b", addedAt: "2026-10-01T00:00:00Z" }),
    ],
    { newDays: 14, limit: 1, now: NOW },
  );
  assert.deepEqual(
    entries.map((e) => e.id),
    ["b"],
  );
});

test("an empty input returns an empty array", () => {
  assert.deepEqual(merge([]), []);
});

test("the filter helpers narrow untrusted query values", () => {
  assert.equal(toWhatsNewKind("tool"), "tool");
  assert.equal(toWhatsNewKind("TOOL"), undefined);
  assert.equal(toWhatsNewKind("../etc/passwd"), undefined);
  assert.equal(toWhatsNewKind(undefined), undefined);
  assert.equal(toWhatsNewEvent("updated"), "updated");
  assert.equal(toWhatsNewEvent("nonsense"), undefined);
});

test("at is canonicalised, whatever spelling the source used", () => {
  // The real inputs: a Postgres timestamptz, a bare changelog date, and a Z form.
  // Input order is deliberately not chronological to verify the sort works.
  const entries = merge([
    input({
      id: "changelog",
      title: "B",
      kind: "feature",
      addedAt: "2026-09-29",
    }),
    input({ id: "z", title: "C", addedAt: "2026-09-28T00:00:00Z" }),
    input({ id: "pg", title: "A", addedAt: "2026-09-30T00:00:00+00:00" }),
  ]);
  assert.deepEqual(
    entries.map((e) => e.at),
    [
      "2026-09-30T00:00:00.000Z",
      "2026-09-29T00:00:00.000Z",
      "2026-09-28T00:00:00.000Z",
    ],
    "every at is canonical ISO, so localeCompare ordering is format-proof",
  );
});

test("changelog additions and updates map to the right event", () => {
  const [added, improved, fixed] = changelogInputs([
    { date: "2026-10-01", title: "A", body: "a body", kind: "added" },
    { date: "2026-09-30", title: "B", body: "b body", kind: "improved" },
    { date: "2026-09-29", title: "C", body: "c body", kind: "fixed" },
  ]);
  assert.equal(added.addedAt, "2026-10-01");
  assert.equal(added.revisedAt, null);
  assert.equal(improved.revisedAt, "2026-09-30");
  assert.equal(improved.addedAt, null);
  assert.equal(fixed.revisedAt, "2026-09-29");
  assert.equal(fixed.addedAt, null);
});

test("a changelog entry carries its body and no id, so it joins to no view", () => {
  const [entry] = changelogInputs([
    { date: "2026-10-01", title: "A", body: "what shipped", kind: "improved" },
  ]);
  assert.equal(entry.note, "what shipped");
  assert.equal(entry.id, undefined);
  assert.equal(entry.href, "/changelog");
  // Through the merge, that body becomes the entry's visible line.
  const [merged] = mergeWhatsNew([entry], { newDays: 14, now: NOW });
  assert.equal(merged.event, "updated");
  assert.equal(merged.note, "what shipped");
});

test("groupByMonth groups consecutive entries and keeps the caller's order", () => {
  const groups = groupByMonth([
    { at: "2026-10-02T00:00:00.000Z" },
    { at: "2026-10-01T00:00:00.000Z" },
    { at: "2026-09-30T00:00:00.000Z" },
  ]);
  assert.deepEqual(
    groups.map(([label, items]) => [label, items.length]),
    [
      ["October 2026", 2],
      ["September 2026", 1],
    ],
  );
});

test("groupByMonth labels months in UTC, so a date never slips to the previous month", () => {
  // Midnight UTC on the 1st. Formatted in a zone behind UTC this would read as
  // the 30th of the previous month and group under it.
  const [[label]] = groupByMonth([{ at: "2026-10-01T00:00:00.000Z" }]);
  assert.equal(label, "October 2026");
});

test("groupByMonth returns nothing for an empty list", () => {
  assert.deepEqual(groupByMonth([]), []);
});

test("two features sharing a title and date but not an event get different keys", () => {
  const base = {
    kind: "feature",
    title: "Same",
    at: "2026-10-01T00:00:00.000Z",
  };
  assert.notEqual(
    whatsNewKey({ ...base, event: "added" }),
    whatsNewKey({ ...base, event: "updated" }),
  );
});
