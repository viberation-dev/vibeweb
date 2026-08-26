import type { RoleLevel } from "@/lib/role-level";

/**
 * Onboarding runs as three URL-addressed steps (§31): level → optional focus
 * → reveal. State lives in the query string rather than a client store, so
 * the back button works, a half-finished flow survives a refresh, and each
 * step is server-rendered like every other page here.
 *
 * Nothing is written to the profile until the final step is submitted. A
 * visitor who abandons at step 2 has changed nothing.
 */

export const ONBOARDING_STEPS = [
  { step: 1, title: "Where are you starting from?" },
  { step: 2, title: "What are you building?" },
  { step: 3, title: "Here is your Viberation" },
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]["step"];

export const LAST_STEP: OnboardingStep = 3;

/**
 * Narrows `?step=`, and refuses to skip ahead of what has been answered.
 *
 * Step 3 needs a level to reveal anything, so a hand-typed `?step=3` with no
 * level falls back to step 1 rather than rendering an empty reveal.
 */
export function resolveStep(value: string | undefined, level: RoleLevel | undefined): OnboardingStep {
  const parsed = Number(value);
  const requested = ONBOARDING_STEPS.some((s) => s.step === parsed) ? (parsed as OnboardingStep) : 1;
  return requested > 1 && !level ? 1 : requested;
}

/**
 * The tier written when someone skips step 1 entirely.
 *
 * §31: skipping defaults to beginner, which preserves the beginner/advanced
 * feed gating the rest of the product depends on. Defaulting to expert would
 * quietly hide the introductory material from the people who need it.
 */
export const DEFAULT_ROLE_LEVEL: RoleLevel = "beginner";

/** Builds `/onboarding?...` URLs, dropping anything not yet answered. */
export function onboardingHref(params: {
  step?: OnboardingStep;
  level?: RoleLevel;
  focus?: string;
}): string {
  const search = new URLSearchParams();

  if (params.step && params.step > 1) search.set("step", String(params.step));
  if (params.level) search.set("level", params.level);
  if (params.focus) search.set("focus", params.focus);

  const query = search.toString();
  return query ? `/onboarding?${query}` : "/onboarding";
}

/** Short second-person summary of the choices, shown back on the reveal. */
export function revealSummary(level: RoleLevel, focusLabel?: string): string {
  const levelPhrase = {
    beginner: "You are starting out",
    intermediate: "You have shipped a few things",
    expert: "You know your way around",
  }[level];

  return focusLabel
    ? `${levelPhrase}, and you are focused on ${focusLabel.toLowerCase()}.`
    : `${levelPhrase}.`;
}
