import { z } from "zod";

/**
 * Server-side validation for the onboarding finish step.
 *
 * `role_level` is the only thing written from user input — `app_role` and
 * `onboarding_completed` are set by the action itself, never accepted from
 * the form. The enum mirrors the Postgres enum from migration 01.
 */
const roleLevelSchema = z.enum(["beginner", "intermediate", "expert"]);

/**
 * Step 1's answer, saved as soon as it is given rather than held in the URL
 * until the end (VIB-67).
 *
 * The tier is a stated preference and worth keeping the moment someone states
 * it. Completion is a separate fact and stays with the final submit, so an
 * abandoned run still leaves `onboarding_completed` false and the home nudge
 * still offers the way back in.
 */
export const onboardingLevelSchema = z.object({
  role_level: roleLevelSchema,
});

export const onboardingFinishSchema = z.object({
  role_level: roleLevelSchema,
  /**
   * Where to land after finishing.
   *
   * Deliberately not "any string starting with /": that still allows
   * "//evil.example", which browsers treat as a protocol-relative URL and
   * follow off-site. An allow-list pattern of the only two destinations the
   * reveal actually offers closes the open redirect entirely.
   */
  next: z
    .string()
    .regex(/^\/(wizards\/[a-z0-9-]+)?$/, "Unrecognised destination.")
    .optional(),
});

export type OnboardingFinishInput = z.infer<typeof onboardingFinishSchema>;
export type OnboardingLevelInput = z.infer<typeof onboardingLevelSchema>;
