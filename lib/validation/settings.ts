import { z } from "zod";

// Relative, with the extension: imported by a plain `node --test` file,
// which resolves no "@/" alias.
import { BADGE_MODES } from "../tool-badges.ts";

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
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
