import { test } from "node:test";
import assert from "node:assert/strict";

import {
  SUBMITTED_NOTICE,
  isBotSubmission,
  usernameOrNull,
} from "./feedback-guard.ts";

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

/*
 * The username is decorative — it changes who the email says it is from and
 * nothing else. The profile lookup behind it throws on any Supabase error,
 * and an uncaught throw out of the server action loses the submission and
 * renders the visitor neither a notice nor an error. Degrading to "a visitor"
 * is the only acceptable worst case.
 */
test("a profile lookup that throws costs the username, not the submission", async () => {
  const result = await usernameOrNull(async () => {
    throw new Error("getProfile(abc): network error");
  });
  assert.equal(result, null);
});

test("a signed-out visitor has no username and that is not an error", async () => {
  assert.equal(await usernameOrNull(async () => null), null);
  assert.equal(await usernameOrNull(async () => ({ username: null })), null);
});

test("a signed-in member's username is passed through", async () => {
  assert.equal(await usernameOrNull(async () => ({ username: "rafa" })), "rafa");
});
