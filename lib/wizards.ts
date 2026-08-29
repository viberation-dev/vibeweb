import type { ChecklistState, WizardSteps } from "@/lib/validation/wizard";

/**
 * Runner navigation and progress maths (VIB-44, VIB-45).
 *
 * Pure functions, kept out of the page so the rules that decide which step
 * someone lands on — and whether they have finished — are testable without a
 * database or a browser.
 */

/**
 * Builds `/wizards/[slug]?step=` URLs for navigation *within* the runner —
 * the step chips and the Previous/Next buttons.
 *
 * Always emits `?step=`, including for step 1. It used to return the bare
 * path for index 0, which made step 1 unreachable: with no `?step=`,
 * resolveStepIndex() falls back to saved progress, so anyone who had reached
 * step 4 was sent straight back to step 4 by the "1. Idea" chip and by
 * Previous on step 2. Steps 2+ worked, which is why it survived review.
 *
 * The bare path still means "resume where I left off" — that is what the home
 * page, the wizard index and onboarding link to. Those build the URL inline
 * and are deliberately not routed through here.
 */
export function wizardHref(slug: string, stepIndex = 0): string {
  return `/wizards/${slug}?step=${stepIndex + 1}`;
}

/**
 * Which step to render, as a 0-based index.
 *
 * `?step=` is 1-based because it is user-facing ("Step 1 of 4"), while
 * `wizard_progress.step_index` is 0-based because it indexes the array. The
 * conversion lives here so nothing else has to remember which is which.
 *
 * With no `?step=`, a signed-in returner resumes where they stopped — that
 * is the whole save-and-resume feature (§31). Out-of-range values clamp
 * rather than 404: a stale bookmark from a wizard that has since lost a step
 * should still open.
 */
export function resolveStepIndex(
  param: string | undefined,
  savedIndex: number | null,
  stepCount: number,
): number {
  const last = Math.max(0, stepCount - 1);

  if (param !== undefined) {
    const parsed = Number(param);
    if (!Number.isInteger(parsed)) return 0;
    return Math.min(Math.max(parsed - 1, 0), last);
  }

  if (savedIndex !== null) {
    return Math.min(Math.max(savedIndex, 0), last);
  }
  return 0;
}

/** Every checklist task id in the wizard, in step order. */
export function allTaskIds(steps: WizardSteps): string[] {
  return steps.flatMap((step) =>
    step.blocks.flatMap((block) => (block.kind === "checklist" ? block.tasks.map((t) => t.id) : [])),
  );
}

export type WizardProgressSummary = {
  done: number;
  total: number;
  /** 0–100, for the progress bar. 100 when a wizard has no tasks at all. */
  percent: number;
  complete: boolean;
};

/**
 * How far through the checklists someone is.
 *
 * Counts only tasks that still exist in the authored steps, so a task
 * removed by an edit stops counting even though its old key may linger in
 * someone's saved `checklist_state`. Without that filter a wizard could read
 * as more than 100% complete.
 */
export function summariseProgress(
  steps: WizardSteps,
  state: ChecklistState,
): WizardProgressSummary {
  const ids = allTaskIds(steps);
  const done = ids.filter((id) => state[id]).length;
  const total = ids.length;

  return {
    done,
    total,
    percent: total === 0 ? 100 : Math.round((done / total) * 100),
    complete: done === total,
  };
}

/** Task ids belonging to one step, for a per-step "3 of 4 done" count. */
export function stepTaskIds(steps: WizardSteps, index: number): string[] {
  const step = steps[index];
  if (!step) return [];

  return step.blocks.flatMap((block) =>
    block.kind === "checklist" ? block.tasks.map((t) => t.id) : [],
  );
}
