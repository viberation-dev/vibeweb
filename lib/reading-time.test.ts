import assert from "node:assert/strict";
import { test } from "node:test";

import { readingMinutes, readingTimeLabel } from "./reading-time.ts";

const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");

test("rounds to the nearest minute at 200 wpm", () => {
  assert.equal(readingMinutes(words(200)), 1);
  assert.equal(readingMinutes(words(500)), 3);
  assert.equal(readingMinutes(words(1000)), 5);
});

test("never reports zero minutes", () => {
  assert.equal(readingMinutes("Short."), 1);
  assert.equal(readingMinutes(null), 1);
  assert.equal(readingMinutes(""), 1);
});

test("counts the prose inside blocks, not their machine fields", () => {
  const blocks = [
    { kind: "text", body: words(200) },
    { kind: "code", language: "bash", code: words(200) },
  ];
  // 400 words of content; `kind` and `language` must not inflate it.
  assert.equal(readingMinutes(null, blocks), 2);
});

test("walks nested blocks inside tabs", () => {
  const blocks = [
    {
      kind: "tabs",
      label: "Pick your system",
      detect: "os",
      tabs: [
        { key: "macos", title: "macOS", blocks: [{ kind: "text", body: words(400) }] },
      ],
    },
  ];
  assert.equal(readingMinutes(null, blocks), 2);
});

test("adds the body and the blocks together", () => {
  assert.equal(readingMinutes(words(200), [{ kind: "text", body: words(200) }]), 2);
});

test("survives blocks that are not an array", () => {
  assert.equal(readingMinutes(words(400), null), 2);
  assert.equal(readingMinutes(words(400), "not blocks"), 2);
});

test("labels the estimate", () => {
  assert.equal(readingTimeLabel(words(1200)), "6 min read");
});
