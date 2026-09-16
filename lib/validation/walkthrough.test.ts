import assert from "node:assert/strict";
import { test } from "node:test";

import { walkthroughBlockSchema } from "./walkthrough.ts";

const links = (href: string) => ({ kind: "links", links: [{ label: "Go", href }] });

test("links accept site paths and https URLs", () => {
  assert.ok(walkthroughBlockSchema.safeParse(links("/tools?category=terminals")).success);
  assert.ok(walkthroughBlockSchema.safeParse(links("https://nodejs.org/en/download")).success);
});

test("links reject anything that could run or leave the site unexpectedly", () => {
  for (const href of ["javascript:alert(1)", "//evil.example", "http://nodejs.org", "data:text/html,x"]) {
    assert.equal(walkthroughBlockSchema.safeParse(links(href)).success, false, href);
  }
});

test("tabs cannot hold a checklist", () => {
  const block = {
    kind: "tabs",
    label: "Pick",
    tabs: [
      { key: "a", title: "A", blocks: [{ kind: "checklist", tasks: [{ id: "x", label: "X" }] }] },
      { key: "b", title: "B", blocks: [{ kind: "text", body: "B" }] },
    ],
  };
  assert.equal(walkthroughBlockSchema.safeParse(block).success, false);
});
