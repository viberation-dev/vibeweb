import { test } from "node:test";
import assert from "node:assert/strict";

import { STATIC_PATHS } from "./static-routes.ts";

/*
 * The omission this catches: /feedback shipped with one footer link and no
 * sitemap entry, because nothing couples the two. Every visitor-facing page
 * that is not reachable from a listing page relies on this list to be found.
 */
test("every visitor-facing utility route is in the sitemap", () => {
  for (const path of ["/blog", "/docs", "/changelog", "/feedback", "/privacy", "/terms"]) {
    assert.ok(STATIC_PATHS.includes(path), `${path} is missing from the sitemap`);
  }
});

test("the home page is listed, as the empty path", () => {
  assert.ok(STATIC_PATHS.includes(""));
});

test("no path carries a trailing slash or a full URL", () => {
  for (const path of STATIC_PATHS) {
    assert.ok(!path.endsWith("/"), `${path} has a trailing slash`);
    assert.ok(!path.includes("://"), `${path} is a full URL, not a path`);
  }
});
