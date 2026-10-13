import { z } from "zod";

/*
 * Relative, not the `@/` alias: walkthrough.test.ts runs under
 * `node --experimental-strip-types`, which does not resolve the alias for a
 * *value* import. `NestedBlock` is `import type` (erased by strip-types),
 * but the six block schemas below are values.
 */
import {
  calloutBlock,
  codeBlock,
  linksBlock,
  promptBlock,
  tabsBlock,
  textBlock,
  type NestedBlock,
} from "./blocks.ts";

/**
 * The shape of `walkthroughs.steps` (migration 04's jsonb).
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
 * refs would duplicate the walkthrough-level recommendations panel (VIB-46), so
 * neither is here yet.
 */

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
  /**
   * How to tell whether the task is done, shown under the label. For a task
   * that states a judgement ("every page has one job") rather than an action
   * ("saved the file"); see docs/walkthrough-rules.md.
   */
  help: z.string().min(1).optional(),
});

const checklistBlock = z.object({
  kind: z.literal("checklist"),
  tasks: z.array(checklistTask).min(1),
});

/**
 * Who a step or block is for (lib/walkthrough-setup.ts). Absent means
 * everyone, which is what every block written before settings existed is.
 *
 * Only steps and top-level blocks carry it. A block inside a tab is already
 * behind a choice the reader made on the page.
 */
const when = z
  .object({
    depth: z.array(z.enum(["basic", "standard", "full"])).min(1).optional(),
    team: z.array(z.enum(["solo", "team"])).min(1).optional(),
  })
  .optional();

export const walkthroughBlockSchema = z.discriminatedUnion("kind", [
  textBlock.extend({ when }),
  calloutBlock.extend({ when }),
  promptBlock.extend({ when }),
  codeBlock.extend({ when }),
  checklistBlock.extend({ when }),
  linksBlock.extend({ when }),
  tabsBlock.extend({ when }),
]);

export const walkthroughStepSchema = z.object({
  /** Stable slug for the step, used in the runner's URL. */
  key: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  intro: z.string().optional(),
  when,
  blocks: z.array(walkthroughBlockSchema).min(1),
});

/**
 * The whole `steps` array.
 *
 * Duplicate task ids are rejected across the entire walkthrough, not just within
 * one step: `checklist_state` is a single flat object keyed by task id, so
 * two tasks sharing an id would tick and untick each other from different
 * steps. That is exactly the kind of bug the jsonb column cannot catch.
 */
export const walkthroughStepsSchema = z
  .array(walkthroughStepSchema)
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

export type WalkthroughBlock = z.infer<typeof walkthroughBlockSchema>;
/** Kept as an alias: the nested set moved to blocks.ts and is shared (VIB-192). */
export type NestedWalkthroughBlock = NestedBlock;
export type WalkthroughStep = z.infer<typeof walkthroughStepSchema>;
export type WalkthroughSteps = z.infer<typeof walkthroughStepsSchema>;

/** `wizard_progress.checklist_state` — task id → ticked. */
export const checklistStateSchema = z.record(z.string(), z.boolean());

export type ChecklistState = z.infer<typeof checklistStateSchema>;
