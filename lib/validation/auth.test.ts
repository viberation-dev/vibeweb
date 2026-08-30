import assert from "node:assert/strict";
import { test } from "node:test";

import { resetPasswordSchema, safeRedirect } from "./auth.ts";

const reset = (password: string, confirmPassword: string) =>
  resetPasswordSchema.safeParse({ password, confirmPassword });

test("a matching pair of long-enough passwords is accepted", () => {
  assert.ok(reset("correct-horse", "correct-horse").success);
});

test("a mismatched confirmation is rejected", () => {
  const result = reset("correct-horse", "correct-hors");
  assert.equal(result.success, false);
  assert.match(result.error!.issues[0].message, /do not match/i);
});

test("the 8-character minimum still applies to the new password", () => {
  // Matching each other is not enough — the reset path must not become a way
  // around the length rule that signup enforces.
  assert.equal(reset("short", "short").success, false);
});

test("an empty confirmation is rejected rather than treated as a match", () => {
  assert.equal(reset("correct-horse", "").success, false);
});

test("safeRedirect keeps recovery landings on this origin", () => {
  // The recovery link carries ?next= through /auth/confirm, so the same
  // allow-list that protects confirmation protects this flow.
  assert.equal(safeRedirect("/reset-password"), "/reset-password");
  assert.equal(safeRedirect("//evil.example"), "/");
  assert.equal(safeRedirect("https://evil.example"), "/");
  assert.equal(safeRedirect(null), "/");
});
