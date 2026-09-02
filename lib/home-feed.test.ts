import assert from "node:assert/strict";
import { test } from "node:test";

import { greetingFor, progressLabel, readingMinutes, toFeedTab } from "./home-feed.ts";

test("the greeting turns over at noon and six", () => {
  assert.equal(greetingFor(0), "Good morning");
  assert.equal(greetingFor(11), "Good morning");
  assert.equal(greetingFor(12), "Good afternoon");
  assert.equal(greetingFor(17), "Good afternoon");
  assert.equal(greetingFor(18), "Good evening");
  assert.equal(greetingFor(23), "Good evening");
});

test("read time never rounds down to zero", () => {
  // "0 min read" reads as broken. Anything with words takes at least a moment.
  assert.equal(readingMinutes("one two three"), 1);
  assert.equal(readingMinutes(new Array(200).fill("word").join(" ")), 1);
  assert.equal(readingMinutes(new Array(1600).fill("word").join(" ")), 8);
});

test("read time is absent, not zero, when there is no body", () => {
  assert.equal(readingMinutes(null), null);
  assert.equal(readingMinutes(""), null);
  assert.equal(readingMinutes("   \n  "), null);
});

test("the progress line counts steps the way a reader does", () => {
  // stepIndex is 0-based in the database, 1-based on screen.
  const { label, percent } = progressLabel(1, "Pick your stack", 4);
  assert.equal(label, "Step 2 of 4 · Pick your stack");
  assert.equal(percent, 25);
});

test("progress cannot overrun its own total", () => {
  // A wizard that loses a step leaves saved progress pointing past the end.
  const { label, percent } = progressLabel(9, undefined, 4);
  assert.equal(label, "Step 4 of 4");
  assert.equal(percent, 100);
});

test("an unstarted wizard reads as step 1, nothing done", () => {
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

test("Top is not selectable while nothing ranks content", () => {
  // Rendered as a dimmed tab; asking for it must not silently reorder the
  // feed under a label the data cannot back.
  assert.equal(toFeedTab("top"), "for-you");
});
