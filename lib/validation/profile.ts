import { z } from "zod";

/**
 * Server-side validation for the profile preferences form.
 *
 * The enums mirror the Postgres enums from migration 01. Keeping them in sync
 * is enforced by the generated Database type at the query-layer boundary — if
 * a value is added to the database enum, that is where the mismatch surfaces.
 */

export const profilePreferencesSchema = z.object({
  /** Empty input clears the username rather than storing an empty string. */
  username: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .refine((value) => value === null || /^[a-z0-9_-]{3,30}$/i.test(value), {
      message:
        "Usernames are 3–30 characters: letters, numbers, hyphens and underscores only.",
    }),
  role_level: z.enum(["beginner", "intermediate", "expert"]),
  layout_mode: z.enum(["essentials", "advanced"]),
});

export type ProfilePreferencesInput = z.infer<typeof profilePreferencesSchema>;
