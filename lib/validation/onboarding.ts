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
});

export type OnboardingFinishInput = z.infer<typeof onboardingFinishSchema>;
