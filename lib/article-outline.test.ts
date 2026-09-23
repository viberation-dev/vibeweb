import assert from "node:assert/strict";
import { test } from "node:test";

import { articleOutline, hasOutline, slugifyHeading } from "./article-outline.ts";

test("slugifies titles into readable anchors", () => {
  assert.equal(slugifyHeading("Install the server"), "install-the-server");
  assert.equal(slugifyHeading("What's an MCP, really?"), "what-s-an-mcp-really");
  assert.equal(slugifyHeading("Café notes"), "cafe-notes");
});

test("falls back rather than producing an empty anchor", () => {
  assert.equal(slugifyHeading("!!!"), "section");
});

test("reads headings in document order", () => {
  const outline = articleOutline([
    { kind: "heading", level: 2, title: "One", eyebrow: "Step 01" },
    { kind: "text", body: "..." },
    { kind: "heading", level: 3, title: "One a" },
    { kind: "heading", level: 2, title: "Two" },
  ]);

  assert.deepEqual(outline, [
    { id: "one", title: "One", level: 2, eyebrow: "Step 01" },
    { id: "one-a", title: "One a", level: 3, eyebrow: undefined },
    { id: "two", title: "Two", level: 2, eyebrow: undefined },
  ]);
});

test("disambiguates repeated titles", () => {
  const outline = articleOutline([
    { kind: "heading", title: "Troubleshooting" },
    { kind: "heading", title: "Troubleshooting" },
    { kind: "heading", title: "Troubleshooting" },
  ]);

  assert.deepEqual(
    outline.map((entry) => entry.id),
    ["troubleshooting", "troubleshooting-2", "troubleshooting-3"],
  );
});

test("defaults an unspecified or bad level to 2", () => {
  const outline = articleOutline([
    { kind: "heading", title: "No level" },
    { kind: "heading", level: 9, title: "Bad level" },
  ]);
  assert.deepEqual(
    outline.map((entry) => entry.level),
    [2, 2],
  );
});

test("ignores anything that is not a usable heading", () => {
  assert.deepEqual(articleOutline(null), []);
  assert.deepEqual(articleOutline("nope"), []);
  assert.deepEqual(
    articleOutline([null, { kind: "text", body: "x" }, { kind: "heading" }, { kind: "heading", title: "   " }]),
    [],
  );
});

test("a rail needs two entries to earn its place", () => {
  assert.equal(hasOutline([]), false);
  assert.equal(hasOutline(articleOutline([{ kind: "heading", title: "Only one" }])), false);
  assert.equal(
    hasOutline(articleOutline([{ kind: "heading", title: "A" }, { kind: "heading", title: "B" }])),
    true,
  );
});
