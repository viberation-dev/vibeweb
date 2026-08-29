import assert from "node:assert/strict";
import { test } from "node:test";

import {
  allTaskIds,
  resolveStepIndex,
  stepTaskIds,
  summariseProgress,
  wizardHref,
} from "./wizards.ts";
import type { WizardSteps } from "./validation/wizard.ts";

const STEPS = [
  {
    key: "idea",
    title: "Idea",
    blocks: [
      { kind: "text", body: "Pick something small." },
      { kind: "checklist", tasks: [{ id: "idea-a", label: "A" }, { id: "idea-b", label: "B" }] },
    ],
  },
  {
    key: "stack",
    title: "Stack",
    blocks: [{ kind: "checklist", tasks: [{ id: "stack-a", label: "C" }] }],
  },
  {
    key: "deploy",
    title: "Deploy",
    blocks: [{ kind: "text", body: "Ship it." }],
  },
] as unknown as WizardSteps;

test("every runner href names its step, including step 1", () => {
  // Regression: step 1 used to be the bare path, which resolveStepIndex reads
  // as "resume", so a returner on step 4 could never navigate back to step 1.
  assert.equal(wizardHref("ship-it", 0), "/wizards/ship-it?step=1");
  assert.equal(wizardHref("ship-it"), "/wizards/ship-it?step=1");
  assert.equal(wizardHref("ship-it", 2), "/wizards/ship-it?step=3");
});

test("an explicit step beats saved progress, so step 1 stays reachable", () => {
  assert.equal(resolveStepIndex("1", 3, 4), 0);
  // ...while the bare path (no param) still resumes.
  assert.equal(resolveStepIndex(undefined, 3, 4), 3);
});

test("?step= is 1-based on the way in, 0-based on the way out", () => {
  assert.equal(resolveStepIndex("1", null, 3), 0);
  assert.equal(resolveStepIndex("3", null, 3), 2);
});

test("out-of-range steps clamp instead of erroring", () => {
  // A stale bookmark from a wizard that has since lost a step should open.
  assert.equal(resolveStepIndex("99", null, 3), 2);
  assert.equal(resolveStepIndex("0", null, 3), 0);
  assert.equal(resolveStepIndex("-4", null, 3), 0);
  assert.equal(resolveStepIndex("banana", null, 3), 0);
});

test("no ?step= resumes saved progress, and starts at 0 without any", () => {
  assert.equal(resolveStepIndex(undefined, 1, 3), 1);
  assert.equal(resolveStepIndex(undefined, null, 3), 0);
  // Saved index past the end clamps too — a step could have been removed.
  assert.equal(resolveStepIndex(undefined, 9, 3), 2);
});

test("an explicit ?step= wins over saved progress", () => {
  assert.equal(resolveStepIndex("1", 2, 3), 0);
});

test("task ids come out in step order", () => {
  assert.deepEqual(allTaskIds(STEPS), ["idea-a", "idea-b", "stack-a"]);
  assert.deepEqual(stepTaskIds(STEPS, 1), ["stack-a"]);
  assert.deepEqual(stepTaskIds(STEPS, 2), []);
  assert.deepEqual(stepTaskIds(STEPS, 99), []);
});

test("progress counts ticked tasks", () => {
  assert.deepEqual(summariseProgress(STEPS, {}), {
    done: 0,
    total: 3,
    percent: 0,
    complete: false,
  });
  assert.deepEqual(summariseProgress(STEPS, { "idea-a": true, "idea-b": true, "stack-a": true }), {
    done: 3,
    total: 3,
    percent: 100,
    complete: true,
  });
});

test("state left over from a deleted task cannot push progress past 100%", () => {
  // Nothing clears checklist_state when a wizard is edited, so a stale key
  // survives. Counting it would report 4 of 3 done.
  const summary = summariseProgress(STEPS, {
    "idea-a": true,
    "idea-b": true,
    "stack-a": true,
    "removed-task": true,
  });

  assert.equal(summary.done, 3);
  assert.equal(summary.total, 3);
  assert.equal(summary.percent, 100);
});
