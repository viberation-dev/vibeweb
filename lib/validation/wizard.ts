import { z } from "zod";

/**
 * The shape of `wizards.steps` (migration 04's jsonb).
 *
 * Migration 04 stores steps as an opaque jsonb blob — the lean MVP shape,
 * normalized into real tables in Phase 1.5. That means Postgres enforces
 * nothing about the contents, so this schema is the only thing standing
 * between an authoring typo and a runner that crashes on a visitor. The
 * query layer parses through it on every read (VIB-42).
 *
 * Block kinds are the MVP subset of the §26 §1 taxonomy, matching what §31
 * lists for the runner: prose, copyable prompts, checklists, code with an
 * expected result, and callouts. Media blocks need Storage and per-step tool
 * refs would duplicate the wizard-level recommendations panel (VIB-46), so
 * neither is here yet.
 */

const textBlock = z.object({
  kind: z.literal("text"),
  body: z.string().min(1),
});

const calloutBlock = z.object({
  kind: z.literal("callout"),
  tone: z.enum(["info", "tip", "warning"]).default("info"),
  body: z.string().min(1),
});

const promptBlock = z.object({
  kind: z.literal("prompt"),
  /** What to do with it — "Paste this into Claude Code", etc. */
  label: z.string().min(1),
  prompt: z.string().min(1),
});

const codeBlock = z.object({
  kind: z.literal("code"),
  language: z.string().default("bash"),
  code: z.string().min(1),
  /** What a correct run looks like, shown beside the command (§31). */
  expected: z.string().optional(),
});

const checklistTask = z.object({
  /**
   * Stable key for this task in `wizard_progress.checklist_state`. Renaming
   * one silently unticks it for everyone mid-build, so ids are authored
   * explicitly rather than derived from the label or the array index.
   */
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Task ids are lowercase letters, numbers and hyphens."),
  label: z.string().min(1),
});

const checklistBlock = z.object({
  kind: z.literal("checklist"),
  tasks: z.array(checklistTask).min(1),
});

export const wizardBlockSchema = z.discriminatedUnion("kind", [
  textBlock,
  calloutBlock,
  promptBlock,
  codeBlock,
  checklistBlock,
]);

export const wizardStepSchema = z.object({
  /** Stable slug for the step, used in the runner's URL. */
  key: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  intro: z.string().optional(),
  blocks: z.array(wizardBlockSchema).min(1),
});

/**
 * The whole `steps` array.
 *
 * Duplicate task ids are rejected across the entire wizard, not just within
 * one step: `checklist_state` is a single flat object keyed by task id, so
 * two tasks sharing an id would tick and untick each other from different
 * steps. That is exactly the kind of bug the jsonb column cannot catch.
 */
export const wizardStepsSchema = z
  .array(wizardStepSchema)
  .min(1)
  .superRefine((steps, ctx) => {
    const seenStepKeys = new Set<string>();
    const seenTaskIds = new Set<string>();

    for (const step of steps) {
      if (seenStepKeys.has(step.key)) {
        ctx.addIssue({ code: "custom", message: `Duplicate step key: ${step.key}` });
      }
      seenStepKeys.add(step.key);

      for (const block of step.blocks) {
        if (block.kind !== "checklist") continue;
        for (const task of block.tasks) {
          if (seenTaskIds.has(task.id)) {
            ctx.addIssue({ code: "custom", message: `Duplicate task id: ${task.id}` });
          }
          seenTaskIds.add(task.id);
        }
      }
    }
  });

export type WizardBlock = z.infer<typeof wizardBlockSchema>;
export type WizardStep = z.infer<typeof wizardStepSchema>;
export type WizardSteps = z.infer<typeof wizardStepsSchema>;

/** `wizard_progress.checklist_state` — task id → ticked. */
export const checklistStateSchema = z.record(z.string(), z.boolean());

export type ChecklistState = z.infer<typeof checklistStateSchema>;
