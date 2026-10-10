import { z } from "zod";

// Relative, with the extension: imported by a plain `node --test` file,
// which resolves no "@/" alias.
import {
  DESIGN_TOKEN_NAMES,
  HEX_COLOUR,
  designContrastProblem,
  parseDesignTokens,
} from "../design-tokens.ts";
import { BADGE_MODES } from "../tool-badges.ts";

const designModeSchema = z
  .partialRecord(
    z.enum(DESIGN_TOKEN_NAMES),
    z
      .string()
      .regex(HEX_COLOUR, "Colours have to be hex, like #fffff2, or #fffff280 with opacity."),
  )
  .default({});

/**
 * The design tokens half of the form (VIB-246).
 *
 * Refuses a colour that would leave text unreadable rather than saving it:
 * the page this is posted from is painted in these colours too, so a bad
 * save could hide the form needed to undo it.
 */
const designShape = z
  .object({ light: designModeSchema, dark: designModeSchema })
  .transform(parseDesignTokens);

export const designTokensSchema = designShape.superRefine((tokens, ctx) => {
    const problem = designContrastProblem(tokens);
    if (problem) ctx.addIssue({ code: "custom", message: problem });
  });

/**
 * Server-side validation for the site settings form (VIB-187).
 *
 * The bounds match the CHECK constraints in the migration rather than being
 * looser: a value the database would refuse should come back as a form error
 * naming the field, not a 500 naming a constraint.
 */
export const siteSettingsSchema = z.object({
  tool_badge_mode: z.enum(BADGE_MODES),
  badge_new_days: z.coerce
    .number()
    .int("Days have to be a whole number.")
    .min(1, "A window shorter than a day badges nothing.")
    .max(365, "A window longer than a year is not news."),
  badge_popular_views: z.coerce
    .number()
    .int("Views have to be a whole number.")
    .min(1, "The threshold has to be at least one view."),
  design_tokens: designTokensSchema,
  // Not contrast-checked: a default paints nothing until it is reset to and
  // saved, and that save goes through the check above.
  design_token_defaults: designShape,
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
