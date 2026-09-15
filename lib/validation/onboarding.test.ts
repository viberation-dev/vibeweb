import assert from "node:assert/strict";
import { test } from "node:test";

import { onboardingAnswerSchema, onboardingFinishSchema } from "./onboarding.ts";

const ok = (next: string | undefined) => onboardingFinishSchema.safeParse({ next }).success;

test("the reveal's own destinations are accepted", () => {
  assert.ok(ok(undefined));
  assert.ok(ok("/"));
  assert.ok(ok("/walkthroughs/ship-your-first-web-project"));
});

test("a protocol-relative path cannot smuggle an off-site redirect", () => {
  // "//evil.example" passes a naive startsWith("/") check and browsers follow
  // it off-site. This is the case the allow-list pattern exists for.
  assert.equal(ok("//evil.example"), false);
  assert.equal(ok("https://evil.example"), false);
  assert.equal(ok("/\\evil.example"), false);
});

test("other internal paths are rejected too", () => {
  // The reveal never offers them — anything else arriving here is a tampered form.
  assert.equal(ok("/profile"), false);
  assert.equal(ok("/walkthroughs"), false);
  assert.equal(ok("/walkthroughs/Bad_Slug"), false);
});

const answer = (value: Record<string, unknown>) => onboardingAnswerSchema.safeParse(value).success;

test("the level step accepts only the Postgres enum", () => {
  // This value reaches a profiles UPDATE, so a tampered radio must not get
  // as far as the database rejecting it.
  assert.ok(answer({ step: "level", role_level: "expert" }));
  assert.equal(answer({ step: "level", role_level: "admin" }), false);
  assert.equal(answer({ step: "level", role_level: "Beginner" }), false);
});

test("a name is trimmed, required and capped", () => {
  const parsed = onboardingAnswerSchema.safeParse({ step: "name", display_name: "  Ali  " });
  assert.ok(parsed.success && parsed.data.step === "name" && parsed.data.display_name === "Ali");
  assert.equal(answer({ step: "name", display_name: "   " }), false);
  assert.equal(answer({ step: "name", display_name: "x".repeat(61) }), false);
});

test("single-choice answers must be one of the listed values", () => {
  assert.ok(answer({ step: "usage", usage: "student" }));
  assert.ok(answer({ step: "occupation", occupation: "developer" }));
  assert.ok(answer({ step: "discovery", discovery: "ai_chat" }));
  assert.equal(answer({ step: "discovery", discovery: "billboard" }), false);
});

test("the create step takes several known values, not none and not unknowns", () => {
  assert.ok(answer({ step: "creating", creating: ["website", "ecommerce"] }));
  assert.equal(answer({ step: "creating", creating: [] }), false);
  assert.equal(answer({ step: "creating", creating: ["website", "nope"] }), false);
});

test("an answer cannot name a step that does not exist", () => {
  // `step` picks which row and column are written, so it is validated too.
  assert.equal(answer({ step: "app_role", app_role: "super_admin" }), false);
});
