import { z } from "zod";

import { OPENROUTER_ID } from "../model-facts.ts";

/**
 * Server-side validation for the comparison editor (VIB-184). The security
 * control; the form's `required` attributes are UX only (§34). Limits match
 * the column checks in migration 20260918170000.
 */

/** One OpenRouter model id per line, blanks ignored, at most three. */
const modelList = z
  .string()
  .transform((value) =>
    value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
  )
  .pipe(
    z
      .array(z.string().regex(OPENROUTER_ID, "Model ids look like anthropic/claude-opus-5."))
      .max(3, "Three models per side at most."),
  );

export const comparisonEditorSchema = z
  .object({
    tool_a_id: z.string().uuid("Pick the first tool."),
    tool_b_id: z.string().uuid("Pick the second tool."),
    intro: z
      .string()
      .trim()
      .min(1, "Write the intro: the direct answer, in two or three sentences.")
      .max(800, "Keep the intro under 800 characters."),
    pick_a: z.string().trim().min(1, "Say when to pick the first tool.").max(400),
    pick_b: z.string().trim().min(1, "Say when to pick the second tool.").max(400),
    models_a: modelList,
    models_b: modelList,
    /* Checkboxes are absent from FormData when unticked. */
    published: z
      .union([z.literal("on"), z.literal("")])
      .optional()
      .transform((value) => value === "on"),
  })
  .refine((v) => v.tool_a_id !== v.tool_b_id, {
    message: "A comparison needs two different tools.",
    path: ["tool_b_id"],
  });

export type ComparisonEditorInput = z.infer<typeof comparisonEditorSchema>;

/** The page's URL segment, from the two tool slugs: "claude-vs-gpt". */
export function comparisonSlug(a: string, b: string): string {
  return `${a}-vs-${b}`;
}
