import assert from "node:assert/strict";
import { test } from "node:test";

import { safeOutboundUrl } from "./outbound.ts";

test("passes ordinary http(s) destinations through", () => {
  assert.equal(safeOutboundUrl("https://cursor.com"), "https://cursor.com/");
  assert.equal(safeOutboundUrl("http://example.com/path?ref=viberation"), "http://example.com/path?ref=viberation");
});

test("rejects the empty default migration 06 gives every tool", () => {
  // outbound_url is `not null default ''`, so most rows are '' until someone
  // fills them in. That must 404, not redirect to the site root.
  assert.equal(safeOutboundUrl(""), null);
  assert.equal(safeOutboundUrl(null), null);
  assert.equal(safeOutboundUrl(undefined), null);
});

test("rejects schemes that execute in the visitor's context", () => {
  assert.equal(safeOutboundUrl("javascript:alert(1)"), null);
  assert.equal(safeOutboundUrl("data:text/html,<script>alert(1)</script>"), null);
});

test("rejects relative values rather than resolving them against the site", () => {
  assert.equal(safeOutboundUrl("/tools"), null);
  assert.equal(safeOutboundUrl("cursor.com"), null);
});
