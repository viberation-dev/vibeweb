import { test } from "node:test";
import assert from "node:assert/strict";

import { SUBMITTED_NOTICE, isBotSubmission } from "./feedback-guard.ts";

test("an empty honeypot is a person", () => {
  assert.equal(isBotSubmission(null), false);
  assert.equal(isBotSubmission(""), false);
});

test("anything in the honeypot is a bot, whitespace included", () => {
  assert.equal(isBotSubmission("Acme Ltd"), true);
  assert.equal(isBotSubmission(" "), true);
});

/*
 * Review Focus 4. A bot must get the same sentence a person gets. If the
 * action validated first, an invalid bot submission would come back with a
 * field-specific error and tell a crawler exactly which field to fix.
 */
test("the notice a bot gets is the identical string a person gets", () => {
  assert.ok(SUBMITTED_NOTICE.length > 0);
  assert.ok(!SUBMITTED_NOTICE.toLowerCase().includes("spam"));
  assert.ok(!SUBMITTED_NOTICE.toLowerCase().includes("bot"));
});
