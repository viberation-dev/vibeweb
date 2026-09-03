import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_ROLE_LEVEL,
  onboardingHref,
  resolveStep,
  revealHeadline,
  revealSummary,
  stepEyebrow,
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

test("the step eyebrow counts the real number of steps", () => {
  // Reads the list rather than hardcoding "of 3", so adding a step cannot
  // leave the label claiming there are still three.
  assert.equal(stepEyebrow(1), "Step 1 of 3 · Level");
  assert.equal(stepEyebrow(3), "Step 3 of 3 · The reveal");
});

test("the reveal headline uses a name when there is one", () => {
  assert.equal(revealHeadline("Ali"), "Here is your Viberation, Ali.");
});

test("a missing or blank username falls back rather than trailing a comma", () => {
  // Most people reach the reveal seconds after signup, before setting one —
  // "Here is your Viberation, ." would be the more visible bug.
  assert.equal(revealHeadline(null), "Here is your Viberation.");
  assert.equal(revealHeadline("   "), "Here is your Viberation.");
});
