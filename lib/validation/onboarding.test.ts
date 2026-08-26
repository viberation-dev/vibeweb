import assert from "node:assert/strict";
import { test } from "node:test";

import { onboardingFinishSchema } from "./onboarding.ts";

const ok = (next: string | undefined) =>
  onboardingFinishSchema.safeParse({ role_level: "beginner", next }).success;

test("the reveal's own destinations are accepted", () => {
  assert.ok(ok(undefined));
  assert.ok(ok("/"));
  assert.ok(ok("/wizards/ship-your-first-web-project"));
});

test("a protocol-relative path cannot smuggle an off-site redirect", () => {
  // "//evil.example" passes a naive startsWith("/") check and browsers follow
  // it off-site. This is the case the allow-list pattern exists for.
  assert.equal(ok("//evil.example"), false);
  assert.equal(ok("https://evil.example"), false);
  assert.equal(ok("/\\evil.example"), false);
});

test("other internal paths are rejected too", () => {
  // Not because they are dangerous, but because the reveal never offers them
  // — anything else arriving here is a tampered form.
  assert.equal(ok("/profile"), false);
  assert.equal(ok("/wizards"), false);
  assert.equal(ok("/wizards/Bad_Slug"), false);
});

test("an unknown role level is rejected", () => {
  assert.equal(onboardingFinishSchema.safeParse({ role_level: "wizard" }).success, false);
});
