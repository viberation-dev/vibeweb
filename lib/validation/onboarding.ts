import { z } from "zod";

import {
  CREATING_OPTIONS,
  DISCOVERY_OPTIONS,
  OCCUPATION_OPTIONS,
  USAGE_OPTIONS,
} from "../onboarding.ts";

/**
 * Server-side validation for onboarding (VIB-152).
 *
 * Each step posts one answer, discriminated by `step`. The enums read the
 * option lists in lib/onboarding.ts, so the page and the validator cannot
 * drift apart. `app_role` and `onboarding_completed` are never accepted from
 * a form.
 */
const values = <T extends readonly { value: string }[]>(options: T) =>
  z.enum(options.map((o) => o.value) as [T[number]["value"], ...T[number]["value"][]]);

export const onboardingAnswerSchema = z.discriminatedUnion("step", [
  z.object({
    step: z.literal("name"),
    display_name: z.string().trim().min(1, "Enter a name.").max(60),
  }),
  z.object({
    step: z.literal("level"),
    role_level: z.enum(["beginner", "intermediate", "expert"]),
  }),
  z.object({ step: z.literal("usage"), usage: values(USAGE_OPTIONS) }),
  z.object({ step: z.literal("occupation"), occupation: values(OCCUPATION_OPTIONS) }),
  z.object({ step: z.literal("creating"), creating: z.array(values(CREATING_OPTIONS)).min(1) }),
  z.object({ step: z.literal("discovery"), discovery: values(DISCOVERY_OPTIONS) }),
]);

export type OnboardingAnswerInput = z.infer<typeof onboardingAnswerSchema>;

export const onboardingFinishSchema = z.object({
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
    .regex(/^\/(walkthroughs\/[a-z0-9-]+)?$/, "Unrecognised destination.")
    .optional(),
});
