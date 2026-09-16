import { z } from "zod";

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

const textBlock = z.object({
  kind: z.literal("text"),
  body: z.string().min(1),
});

const calloutBlock = z.object({
  kind: z.literal("callout"),
  tone: z.enum(["info", "tip", "warning"]).default("info"),
  body: z.string().min(1),
});

const promptOption = z.object({
  /** Short name on the picker, e.g. "Quick check". */
  title: z.string().min(1),
  prompt: z.string().min(1),
});

const promptBlock = z.object({
  kind: z.literal("prompt"),
  /** What to do with it — "Paste this into Claude Code", etc. */
  label: z.string().min(1),
  /**
   * The single prompt. Still required when `prompts` is set: builds from
   * before VIB-160 only read this field, and the one Supabase project serves
   * production and previews, so new content has to stay readable by them.
   */
  prompt: z.string().min(1),
  /** Two or more versions to choose between (VIB-160). Wins over `prompt`. */
  prompts: z.array(promptOption).min(2).optional(),
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

/**
 * An authored link. Site-relative paths or https only: the value becomes an
 * href, and a `javascript:` or protocol-relative one would run or leave the
 * site on a visitor's click.
 */
const linkHref = z
  .string()
  .refine(
    (href) => (href.startsWith("/") && !href.startsWith("//")) || href.startsWith("https://"),
    "Links are site paths starting with / or https:// URLs.",
  );

const linksBlock = z.object({
  kind: z.literal("links"),
  links: z.array(z.object({ label: z.string().min(1), href: linkHref })).min(1),
});

/** Blocks allowed inside a tab. No checklists or nested tabs: task ids stay top-level. */
const nestedBlockSchema = z.discriminatedUnion("kind", [
  textBlock,
  calloutBlock,
  promptBlock,
  codeBlock,
  linksBlock,
]);

/**
 * Alternatives the reader picks one of, such as their operating system or a
 * host (VIB-162). With `detect: "os"`, tab keys are `windows`, `macos` and
 * `linux`, and the runner opens the visitor's own system first.
 */
const tabsBlock = z.object({
  kind: z.literal("tabs"),
  label: z.string().min(1),
  detect: z.literal("os").optional(),
  tabs: z
    .array(
      z.object({
        key: z.string().min(1).regex(/^[a-z0-9-]+$/),
        title: z.string().min(1),
        blocks: z.array(nestedBlockSchema).min(1),
      }),
    )
    .min(2),
});

export const walkthroughBlockSchema = z.discriminatedUnion("kind", [
  textBlock,
  calloutBlock,
  promptBlock,
  codeBlock,
  checklistBlock,
  linksBlock,
  tabsBlock,
]);

export const walkthroughStepSchema = z.object({
  /** Stable slug for the step, used in the runner's URL. */
  key: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  intro: z.string().optional(),
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
export type NestedWalkthroughBlock = z.infer<typeof nestedBlockSchema>;
export type WalkthroughStep = z.infer<typeof walkthroughStepSchema>;
export type WalkthroughSteps = z.infer<typeof walkthroughStepsSchema>;

/** `wizard_progress.checklist_state` — task id → ticked. */
export const checklistStateSchema = z.record(z.string(), z.boolean());

export type ChecklistState = z.infer<typeof checklistStateSchema>;
