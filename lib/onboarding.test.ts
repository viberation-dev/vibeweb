import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CREATING_OPTIONS,
  DEFAULT_ROLE_LEVEL,
  DISCOVERY_OPTIONS,
  LAST_STEP,
  nextStep,
  OCCUPATION_OPTIONS,
  ONBOARDING_STEPS,
  USAGE_OPTIONS,
  onboardingHref,
  resolveStep,
  revealHeadline,
  revealSummary,
  stepEyebrow,
  starterSetSlug,
  STARTER_SET_FALLBACK_SLUG,
  walkthroughFraming,
} from "./onboarding.ts";

test("skipping the level question defaults to beginner, not expert", () => {
  // §31: this preserves the beginner/advanced gating the feed depends on.
  // Defaulting the other way would hide the introductory material from the
  // people who need it.
  assert.equal(DEFAULT_ROLE_LEVEL, "beginner");
});

test("unparseable steps land on step 1", () => {
  assert.equal(resolveStep(undefined), 1);
  assert.equal(resolveStep("0"), 1);
  assert.equal(resolveStep("99"), 1);
  assert.equal(resolveStep("two"), 1);
  assert.equal(resolveStep("4"), 4);
});

test("step 1 is the bare path, later steps carry only the step", () => {
  // Answers are saved as they are given, so nothing else rides in the URL.
  assert.equal(onboardingHref(1), "/onboarding");
  assert.equal(onboardingHref(5), "/onboarding?step=5");
});

test("moving on stops at the reveal", () => {
  assert.equal(nextStep(1), 2);
  assert.equal(nextStep(LAST_STEP), LAST_STEP);
  assert.equal(ONBOARDING_STEPS.at(-1)!.key, "reveal");
});

test("the reveal reads the level back differently per tier", () => {
  assert.equal(new Set(["beginner", "intermediate", "expert"].map((l) => revealSummary(l as "beginner"))).size, 3);
});

test("the step eyebrow counts the real number of steps", () => {
  // Reads the list rather than hardcoding the total, so adding a step cannot
  // leave the label claiming the old count.
  assert.equal(stepEyebrow(2), `Step 2 of ${ONBOARDING_STEPS.length} · Level`);
});

test("option values are unique within each question", () => {
  // A duplicate value would make two chips indistinguishable once stored.
  for (const options of [USAGE_OPTIONS, OCCUPATION_OPTIONS, CREATING_OPTIONS, DISCOVERY_OPTIONS]) {
    const values = options.map((o) => o.value);
    assert.equal(new Set(values).size, values.length);
  }
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

test("each tier gets its own starter collection", () => {
  // Beginner keeps the unsuffixed slug: it is a live URL that predates the
  // split, and renaming it broke the reveal in production once already.
  assert.equal(starterSetSlug("beginner"), "starter-set");
  assert.equal(starterSetSlug("intermediate"), "starter-set-intermediate");
  assert.equal(starterSetSlug("expert"), "starter-set-expert");
});

test("the fallback is a real seeded slug, not a guess", () => {
  // The reveal falls back here when a tier has no collection. If this drifts
  // from a slug that exists, the panel silently disappears.
  assert.equal(STARTER_SET_FALLBACK_SLUG, starterSetSlug("beginner"));
});

test("the walkthrough is framed differently for each tier", () => {
  // One walkthrough, three pitches. Identical copy would make the tier question
  // pointless on the one screen that just asked it.
  const framings = ["beginner", "intermediate", "expert"].map((level) =>
    walkthroughFraming(level as Parameters<typeof walkthroughFraming>[0]),
  );
  assert.equal(new Set(framings).size, 3);
  for (const framing of framings) {
    assert.ok(framing.length > 0);
  }
});
