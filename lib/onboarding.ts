import type { RoleLevel } from "@/lib/role-level";

/**
 * Onboarding runs as three URL-addressed steps (§31): level → optional focus
 * → reveal. State lives in the query string rather than a client store, so
 * the back button works, a half-finished flow survives a refresh, and each
 * step is server-rendered like every other page here.
 *
 * The tier is written as step 1 is submitted; completion is written only by
 * the final submit (VIB-67). Those are different facts: a stated preference
 * is worth keeping the moment it is stated, while "has finished onboarding"
 * governs whether the home nudge keeps offering the way back in. Someone who
 * abandons at step 2 keeps their tier and still gets the nudge.
 */

export const ONBOARDING_STEPS = [
  { step: 1, label: "Level", title: "First — how much have you built?" },
  { step: 2, label: "Focus", title: "What are you building?" },
  { step: 3, label: "The reveal", title: "Here is your Viberation" },
] as const;

/** "STEP 2 OF 3 · FOCUS" — the eyebrow above each card in the mockup. */
export function stepEyebrow(step: OnboardingStep): string {
  const { label } = ONBOARDING_STEPS.find((s) => s.step === step)!;
  return `Step ${step} of ${ONBOARDING_STEPS.length} · ${label}`;
}

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

/**
 * The reveal's headline, personalised when there is a name to use.
 *
 * Mockup: "Here's your Viberation, Ali." Falls back to the plain version
 * rather than "Here's your Viberation, ." — a username is optional on
 * `profiles`, and most people arrive here seconds after signup without one.
 */
export function revealHeadline(name: string | null | undefined): string {
  const trimmed = name?.trim();
  return trimmed ? `Here is your Viberation, ${trimmed}.` : "Here is your Viberation.";
}

/**
 * The starter collection for one tier (VIB-94).
 *
 * Three seeded collections rather than a `role_level` column on
 * `collections`: no migration, and the curation lives in the collection's own
 * items where an editor can see it. What makes a starting point good is the
 * *pairing* of things, which is what a collection already is.
 *
 * Seeded by VIB-41 (beginner) and VIB-94 (the other two).
 */
export function starterSetSlug(level: RoleLevel): string {
  return `starter-set-${level}`;
}

/**
 * Where the reveal falls back when a tier has no collection seeded.
 *
 * Showing the beginner set to an expert is a mild mismatch; showing an empty
 * panel on the screen that is supposed to say "here is your Viberation" is a
 * broken promise. So the fallback exists and is deliberately the gentlest
 * wrong answer.
 */
export const STARTER_SET_FALLBACK_SLUG = "starter-set-beginner";

/**
 * How the flagship wizard is pitched, per tier (VIB-83's second open item).
 *
 * The same wizard, framed for who is reading. A beginner needs to know it
 * ends with something real; someone who has shipped before needs to know it
 * is not going to waste their afternoon.
 */
export function wizardFraming(level: RoleLevel): string {
  return {
    beginner: "Start here. It ends with a real URL you can send to someone.",
    intermediate: "A quick pass end to end — useful for the deployment half if you already know the build half.",
    expert: "Skim it for the stack choices; the checklist at the end is the part worth keeping.",
  }[level];
}
