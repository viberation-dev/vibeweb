import assert from "node:assert/strict";
import { test } from "node:test";

import { SHARE_NETWORKS, preferredSourceUrl } from "./share.ts";

const URL_UNDER_TEST = "https://viberation.dev/learn/playwright-mcp?ref=x";
const TITLE = "Run Playwright MCP & Claude Code";

test("every network builds an https link", () => {
  for (const network of SHARE_NETWORKS) {
    const href = network.href(URL_UNDER_TEST, TITLE);
    assert.ok(href.startsWith("https://"), `${network.key} must be https`);
  }
});

test("the shared url and title are encoded, not pasted in raw", () => {
  for (const network of SHARE_NETWORKS) {
    const href = network.href(URL_UNDER_TEST, TITLE);
    // A raw "?ref=x" or "&" from our values would break the intent's own
    // query string — the bug that silently truncates a shared link.
    assert.ok(!href.includes(URL_UNDER_TEST), `${network.key} pasted the url raw`);
    assert.ok(href.includes(encodeURIComponent(URL_UNDER_TEST)), `${network.key} lost the url`);
  }
});

test("network keys are unique", () => {
  const keys = SHARE_NETWORKS.map((network) => network.key);
  assert.equal(new Set(keys).size, keys.length);
});

test("preferred source points at the bare domain", () => {
  assert.equal(
    preferredSourceUrl("viberation.dev"),
    "https://www.google.com/preferences/source?q=viberation.dev",
  );
});
