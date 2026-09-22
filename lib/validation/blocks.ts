import { z } from "zod";

/**
 * Authored content blocks, shared by walkthrough steps and guide bodies
 * (VIB-192).
 *
 * These started as `walkthroughs.steps` (§26 §1 taxonomy, MVP subset) and
 * moved here when guides took the same format. A second authoring shape for
 * the same six kinds is the pair that drifts: one of them gains a fix and
 * the other does not, and the bug surfaces in whichever surface nobody was
 * looking at.
 *
 * `checklist` is deliberately *not* here. Its ticks live in
 * `wizard_progress.checklist_state`, keyed by walkthrough and step, so it
 * only makes sense inside a runner. It stays in walkthrough.ts.
 *
 * Tested through its consumers: lib/validation/walkthrough.test.ts and
 * lib/validation/guide.test.ts.
 */

export const textBlock = z.object({
  kind: z.literal("text"),
  body: z.string().min(1),
});

export const calloutBlock = z.object({
  kind: z.literal("callout"),
  tone: z.enum(["info", "tip", "warning"]).default("info"),
  body: z.string().min(1),
});

export const promptOption = z.object({
  /** Short name on the picker, e.g. "Quick check". */
  title: z.string().min(1),
  prompt: z.string().min(1),
});

export const promptBlock = z.object({
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

export const codeBlock = z.object({
  kind: z.literal("code"),
  language: z.string().default("bash"),
  code: z.string().min(1),
  /** What a correct run looks like, shown beside the command (§31). */
  expected: z.string().optional(),
});

/**
 * An authored link. Site-relative paths or https only: the value becomes an
 * href, and a `javascript:` or protocol-relative one would run or leave the
 * site on a visitor's click.
 */
export const linkHref = z
  .string()
  .refine(
    (href) => (href.startsWith("/") && !href.startsWith("//")) || href.startsWith("https://"),
    "Links are site paths starting with / or https:// URLs.",
  );

export const linksBlock = z.object({
  kind: z.literal("links"),
  links: z.array(z.object({ label: z.string().min(1), href: linkHref })).min(1),
});

/** Blocks allowed inside a tab. No checklists or nested tabs: task ids stay top-level. */
export const nestedBlockSchema = z.discriminatedUnion("kind", [
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
export const tabsBlock = z.object({
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

/** Every kind both surfaces render. */
export const sharedBlockSchema = z.discriminatedUnion("kind", [
  textBlock,
  calloutBlock,
  promptBlock,
  codeBlock,
  linksBlock,
  tabsBlock,
]);

export type SharedBlock = z.infer<typeof sharedBlockSchema>;
export type NestedBlock = z.infer<typeof nestedBlockSchema>;
