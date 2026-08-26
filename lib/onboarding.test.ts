import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_ROLE_LEVEL,
  onboardingHref,
  resolveStep,
  revealSummary,
} from "./onboarding.ts";

test("skipping the level question defaults to beginner, not expert", () => {
  // §31: this preserves the beginner/advanced gating the feed depends on.
  // Defaulting the other way would hide the introductory material from the
  // people who need it.
  assert.equal(DEFAULT_ROLE_LEVEL, "beginner");
});

test("a later step without a level falls back to step 1", () => {
  // A hand-typed ?step=3 must not render a reveal with nothing to reveal.
  assert.equal(resolveStep("3", undefined), 1);
  assert.equal(resolveStep("2", undefined), 1);
  assert.equal(resolveStep("3", "expert"), 3);
});

test("unparseable steps land on step 1", () => {
  assert.equal(resolveStep(undefined, "beginner"), 1);
  assert.equal(resolveStep("0", "beginner"), 1);
  assert.equal(resolveStep("9", "beginner"), 1);
  assert.equal(resolveStep("two", "beginner"), 1);
});

test("hrefs carry answers forward and drop what is unanswered", () => {
  assert.equal(onboardingHref({}), "/onboarding");
  assert.equal(onboardingHref({ step: 1 }), "/onboarding");
  assert.equal(onboardingHref({ step: 3, level: "expert" }), "/onboarding?step=3&level=expert");
  assert.equal(
    onboardingHref({ step: 3, level: "beginner", focus: "frontend" }),
    "/onboarding?step=3&level=beginner&focus=frontend",
  );
});

test("the reveal reads back both answers, or just the level", () => {
  assert.equal(
    revealSummary("beginner", "Frontend"),
    "You are starting out, and you are focused on frontend.",
  );
  assert.equal(revealSummary("expert"), "You know your way around.");
});
