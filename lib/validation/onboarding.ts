import { z } from "zod";

/**
 * Server-side validation for the onboarding finish step.
 *
 * `role_level` is the only thing written from user input — `app_role` and
 * `onboarding_completed` are set by the action itself, never accepted from
 * the form. The enum mirrors the Postgres enum from migration 01.
 */
export const onboardingFinishSchema = z.object({
  role_level: z.enum(["beginner", "intermediate", "expert"]),
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
