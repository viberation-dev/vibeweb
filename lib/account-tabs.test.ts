import assert from "node:assert/strict";
import { test } from "node:test";

import { ACCOUNT_TABS, isActiveTab } from "./account-tabs.ts";

test("Overview only lights up on the shell's own path", () => {
  assert.ok(isActiveTab("/account", "/account"));
  assert.equal(isActiveTab("/account/bookmarks", "/account"), false);
  assert.equal(isActiveTab("/account/settings", "/account"), false);
});

test("a tab matches its own subtree and nothing else", () => {
  assert.ok(isActiveTab("/account/bookmarks", "/account/bookmarks"));
  assert.ok(isActiveTab("/account/bookmarks/unfiled", "/account/bookmarks"));
  assert.equal(isActiveTab("/account/history", "/account/bookmarks"), false);
});

test("a sibling with a shared prefix is not a match", () => {
  // /account/historyish must not light History, the same trap isProtected()
  // guards against in middleware.
  assert.equal(isActiveTab("/account/historyish", "/account/history"), false);
});

test("exactly one tab is active on each tab's own path", () => {
  for (const tab of ACCOUNT_TABS) {
    const active = ACCOUNT_TABS.filter((other) => isActiveTab(tab.href, other.href));
    assert.deepEqual(active, [tab]);
  }
});
