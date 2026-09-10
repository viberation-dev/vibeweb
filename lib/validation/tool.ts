import { z } from "zod";

// Relative, with the extension: this module is imported by a plain
// `node --test` file, which resolves no "@/" alias.
import { OPENROUTER_FAMILY, OPENROUTER_ID } from "../model-facts.ts";
import { safeOutboundUrl } from "../outbound.ts";
import { PRICING_TIERS } from "../tool-facts.ts";
import { TOOL_PLATFORM_VALUES } from "../tool-platforms.ts";

/**
 * Server-side validation for the tools editor (VIB-59).
 *
 * The security control, not the browser's `required` attributes (§34).
 * `category` mirrors the `tool_category` enum from migration 03; a value
 * added there surfaces as a type error at the query layer, which is the
 * boundary holding the generated Database type.
 */

export const toolEditorSchema = z.object({
  name: z.string().trim().min(1, "Give the tool a name."),
  /** Same rule as content slugs — this is `/tools/[slug]` and `/go/[slug]`. */
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slugs are lowercase letters, numbers and single hyphens.",
    ),
  category: z.enum([
    "models",
    "agents",
    "chats",
    "skills",
    "mcp_servers",
    "plugins",
    "frameworks",
    "clis",
    "ides",
    "tools",
    "utilities",
    "templates",
    "workflows",
  ]),
  tagline: z.string().trim().transform((value) => (value === "" ? null : value)),
  description: z.string().transform((value) => (value.trim() === "" ? null : value)),
  /*
   * A closed list, not free text: `hasFreeTier` and the directory's pricing
   * filter compare against these exact strings, so "free" typed by hand would
   * quietly mean "Paid" everywhere it is read.
   */
  pricing_tier: z
    .union([z.enum(PRICING_TIERS), z.literal("")])
    .transform((value) => (value === "" ? null : value)),
  /*
   * Validated through the same function `/go/[slug]` redirects with, so the
   * editor cannot save a destination the app would then refuse to use. Empty
   * is allowed — the column is `not null default ''` and a tool can exist
   * before its link does.
   */
  outbound_url: z
    .string()
    .trim()
    .refine((value) => value === "" || safeOutboundUrl(value) !== null, {
      message: "Outbound links must be a full http:// or https:// URL.",
    }),
  /*
   * Checkboxes, so FormData carries one entry per ticked platform and none at
   * all when there are none. Unknown values are dropped rather than rejected:
   * the CHECK constraint would refuse the write anyway, and a form error
   * naming a value the reader never typed helps nobody.
   */
  platform: z
    .array(z.string())
    .transform((values) => values.filter((v) => TOOL_PLATFORM_VALUES.includes(v))),
  /** Same three tiers as a reader's own level — see the migration. */
  best_for: z
    .union([z.enum(["beginner", "intermediate", "expert"]), z.literal("")])
    .transform((value) => (value === "" ? null : value)),
  /** Unchecked checkboxes are absent from FormData, hence the null case. */
  is_affiliate: z
    .union([z.literal("on"), z.literal("")])
    .nullable()
    .transform((value) => value === "on"),
  /*
   * Model family and its featured model (VIB-107). Checked against the same
   * shapes as the columns' CHECKs so a typo is a form error rather than a 500
   * — and because the adapter puts these values in URLs.
   */
  openrouter_family: optionalOpenRouter(
    OPENROUTER_FAMILY,
    "OpenRouter families look like vendor/name, e.g. anthropic/claude.",
  ),
  openrouter_id: optionalOpenRouter(
    OPENROUTER_ID,
    "OpenRouter IDs look like vendor/model, e.g. anthropic/claude-sonnet-5.",
  ),
})
  // Mirrors tools_openrouter_id_in_family: featuring a GPT on the Claude page
  // would be a wrong fact, not a style choice.
  .refine(
    (tool) =>
      tool.openrouter_id === null ||
      (tool.openrouter_family !== null && tool.openrouter_id.startsWith(tool.openrouter_family)),
    {
      message:
        "The featured model has to belong to the family, e.g. anthropic/claude-sonnet-5 in anthropic/claude.",
      path: ["openrouter_id"],
    },
  );

export type ToolEditorInput = z.infer<typeof toolEditorSchema>;

/**
 * An optional, lowercased OpenRouter identifier. Absent from a stale form or a
 * hand-posted request means unstated, not an error — the same treatment as
 * the affiliate checkbox.
 */
function optionalOpenRouter(shape: RegExp, message: string) {
  return z
    .string()
    .nullish()
    .transform((value) => (value ?? "").trim().toLowerCase())
    .refine((value) => value === "" || shape.test(value), { message })
    .transform((value) => (value === "" ? null : value));
}
