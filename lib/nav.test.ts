import assert from "node:assert/strict";
import { test } from "node:test";

import { isActiveNavItem, SIDEBAR_GROUPS, TOP_NAV } from "./nav.ts";

const active = (pathname: string, query: string, href: string) =>
  isActiveNavItem(pathname, new URLSearchParams(query), href);

test("Home matches exactly — it is a prefix of every other path", () => {
  assert.ok(active("/", "", "/"));
  assert.equal(active("/tools", "", "/"), false);
  assert.equal(active("/account/bookmarks", "", "/"), false);
});

test("category links are told apart by their query, not their path", () => {
  // All thirteen share the /tools pathname. A pathname-only check lights
  // every one of them at once, which is the bug this rule exists for.
  assert.ok(active("/tools", "category=models", "/tools?category=models"));
  assert.equal(active("/tools", "category=agents", "/tools?category=models"), false);
  assert.equal(active("/tools", "", "/tools?category=models"), false);
});

test("extra params on the page do not break a match", () => {
  // Paging or sorting within a category keeps that category active.
  assert.ok(active("/tools", "category=models&page=2&sort=newest", "/tools?category=models"));
});

test("an item with no query matches its whole subtree", () => {
  assert.ok(active("/wizards", "", "/wizards"));
  assert.ok(active("/wizards/ship-your-first-web-project", "", "/wizards"));
  assert.equal(active("/wizardsly", "", "/wizards"), false);
});

test("disabled items never match", () => {
  assert.equal(active("/", "", "#"), false);
});

test("exactly one category is active on a category page", () => {
  const directory = SIDEBAR_GROUPS.find((group) => group.label === "Directory · 13")!;

  for (const item of directory.items.filter((i) => i.href !== "/tools")) {
    const query = item.href.split("?")[1];
    const matches = directory.items.filter((other) =>
      isActiveNavItem("/tools", new URLSearchParams(query), other.href, other.exclusive),
    );
    assert.deepEqual(matches, [item]);
  }
});

test('"All tools" and a category are never active at the same time', () => {
  // They share the /tools pathname and differ only by the absence of a
  // param, which a plain pathname check cannot tell apart.
  const all = "/tools";
  assert.ok(isActiveNavItem("/tools", new URLSearchParams(""), all, ["category"]));
  assert.equal(
    isActiveNavItem("/tools", new URLSearchParams("category=models"), all, ["category"]),
    false,
  );
  // Filters that are not the category axis leave All tools selected.
  assert.ok(isActiveNavItem("/tools", new URLSearchParams("tag=free&page=2"), all, ["category"]));
});

test("the Directory label states its own count, and means it", () => {
  // "Directory · 13" is the mockup's label. If a category is ever added to
  // the enum, the label and the list must not drift apart silently.
  // 13 categories plus the "All tools" entry that fronts them.
  const directory = SIDEBAR_GROUPS.find((group) => group.label === "Directory · 13")!;
  assert.equal(directory.items.filter((item) => item.href !== "/tools").length, 13);
});

test("the logged-out top nav stays flat and short", () => {
  // Handoff §2: four items including search, no sidebar. Wizards belongs to
  // the signed-in sidebar's Learn group, not here.
  assert.deepEqual(
    TOP_NAV.map((item) => item.label),
    ["Explore", "Learn", "Collections"],
  );
});
