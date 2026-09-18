import { z } from "zod";

/**
 * Server-side validation for the profile preferences form.
 *
 * The enums mirror the Postgres enums from migration 01. Keeping them in sync
 * is enforced by the generated Database type at the query-layer boundary — if
 * a value is added to the database enum, that is where the mismatch surfaces.
 */

export const profilePreferencesSchema = z.object({
  /**
   * The name we greet you by (VIB-178). Stored in onboarding_answers, which
   * only its owner can read, not on the public profile. Blank clears it.
   */
  display_name: z
    .string()
    .trim()
    .max(60, "Names are 60 characters at most.")
    .transform((value) => (value === "" ? null : value)),
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

/**
 * A profile photo upload. Storage enforces size and type again on its side;
 * this is what turns a bad file into a readable message instead of an error.
 */
export const avatarSchema = z
  .instanceof(File, { message: "Choose an image to upload." })
  .refine((file) => file.size > 0, "Choose an image to upload.")
  .refine(
    (file) => file.size <= 2 * 1024 * 1024,
    "Images must be 2MB or smaller.",
  )
  .refine(
    (file) => ["image/png", "image/jpeg", "image/webp"].includes(file.type),
    "Use a PNG, JPEG or WebP image.",
  );

export type ProfilePreferencesInput = z.infer<typeof profilePreferencesSchema>;
