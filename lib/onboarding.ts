import type { RoleLevel } from "./role-level.ts";

/**
 * Onboarding runs as URL-addressed steps (§31, VIB-152): a few questions,
 * then the reveal. Each answer is saved as its step is submitted, so the URL
 * only carries which step you are on. The back button works, a refresh keeps
 * your place, and every step is server-rendered like every other page here.
 *
 * Completion is still written only by the final submit (VIB-67). Someone who
 * abandons halfway keeps what they answered and still gets the home nudge.
 */

export const ONBOARDING_STEPS = [
  { step: 1, key: "name", label: "You", title: "Welcome. What should we call you?" },
  { step: 2, key: "level", label: "Level", title: "How much have you built?" },
  { step: 3, key: "usage", label: "Use", title: "How will you use Viberation?" },
  { step: 4, key: "occupation", label: "Role", title: "What best describes you?" },
  { step: 5, key: "creating", label: "Goals", title: "What will you create?" },
  { step: 6, key: "discovery", label: "Found us", title: "How did you find us?" },
  { step: 7, key: "reveal", label: "The reveal", title: "Here is your Viberation" },
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]["step"];
export type OnboardingStepKey = (typeof ONBOARDING_STEPS)[number]["key"];

export const LAST_STEP: OnboardingStep = 7;

/** "STEP 2 OF 7 · LEVEL" — the eyebrow above each card in the mockup. */
export function stepEyebrow(step: OnboardingStep): string {
  const { label } = ONBOARDING_STEPS.find((s) => s.step === step)!;
  return `Step ${step} of ${ONBOARDING_STEPS.length} · ${label}`;
}

/** Narrows `?step=`; anything unrecognised lands on step 1. */
export function resolveStep(value: string | undefined): OnboardingStep {
  const parsed = Number(value);
  return ONBOARDING_STEPS.some((s) => s.step === parsed) ? (parsed as OnboardingStep) : 1;
}

/** Step 1 is the bare path so the entry link stays `/onboarding`. */
export function onboardingHref(step: OnboardingStep): string {
  return step > 1 ? `/onboarding?step=${step}` : "/onboarding";
}

/** The step after this one, capped at the reveal. */
export function nextStep(step: OnboardingStep): OnboardingStep {
  return Math.min(step + 1, LAST_STEP) as OnboardingStep;
}

/**
 * Answer lists. Values are what gets stored, so rename a label freely but
 * treat a value as permanent: old rows still hold it.
 */
export const USAGE_OPTIONS = [
  { value: "work", label: "Work", blurb: "I build things as part of my job." },
  { value: "personal", label: "Personal", blurb: "Side projects, hobbies and ideas." },
  { value: "both", label: "Work and personal", blurb: "A bit of both." },
  { value: "student", label: "Student", blurb: "Courses, school projects and learning." },
] as const;

export const OCCUPATION_OPTIONS = [
  { value: "founder", label: "Founder / Business owner" },
  { value: "developer", label: "Developer / IT" },
  { value: "designer", label: "Designer" },
  { value: "product", label: "Product manager" },
  { value: "marketer", label: "Marketer" },
  { value: "creator", label: "Content creator" },
  { value: "student", label: "Student" },
  { value: "other", label: "Other" },
] as const;

export const CREATING_OPTIONS = [
  { value: "landing_page", label: "Landing page" },
  { value: "website", label: "Website" },
  { value: "web_app", label: "Online application" },
  { value: "ecommerce", label: "Ecommerce store" },
  { value: "workflow", label: "Improve my workflow" },
  { value: "inspiration", label: "Take inspiration" },
  { value: "undecided", label: "Not decided yet" },
  { value: "other", label: "Other" },
] as const;

export const DISCOVERY_OPTIONS = [
  { value: "youtube", label: "YouTube" },
  { value: "friends", label: "Friends / Teammates" },
  { value: "ai_chat", label: "ChatGPT / Claude" },
  { value: "google", label: "Google" },
  { value: "reddit", label: "Reddit" },
  { value: "x", label: "X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "other", label: "Other" },
] as const;

type Values<T extends readonly { value: string }[]> = T[number]["value"];
export type Usage = Values<typeof USAGE_OPTIONS>;
export type Occupation = Values<typeof OCCUPATION_OPTIONS>;
export type Creating = Values<typeof CREATING_OPTIONS>;
export type Discovery = Values<typeof DISCOVERY_OPTIONS>;

/**
 * The tier written when someone skips the level question.
 *
 * §31: skipping defaults to beginner, which preserves the beginner/advanced
 * feed gating the rest of the product depends on. Defaulting to expert would
 * quietly hide the introductory material from the people who need it.
 */
export const DEFAULT_ROLE_LEVEL: RoleLevel = "beginner";

/** Short second-person summary shown back on the reveal. */
export function revealSummary(level: RoleLevel): string {
  return {
    beginner: "You are starting out, so we lead with the gentle stuff.",
    intermediate: "You have shipped a few things, so we skip the basics.",
    expert: "You know your way around, so we keep it sharp.",
  }[level];
}

/**
 * The reveal's headline, personalised when there is a name to use.
 *
 * Mockup: "Here's your Viberation, Ali." Falls back to the plain version
 * rather than "Here's your Viberation, ." — the name step can be skipped.
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
  return level === "beginner" ? STARTER_SET_FALLBACK_SLUG : `starter-set-${level}`;
}

/**
 * The beginner set, and the fallback for any tier with nothing seeded.
 *
 * It keeps the unsuffixed slug it was born with (VIB-41) rather than becoming
 * `starter-set-beginner` for symmetry. A collection slug is a live URL and the
 * featured collection is linked from elsewhere, so renaming it breaks those
 * links — verified the hard way: renaming it during this change took the
 * collection card off the onboarding reveal in production until it was put
 * back. Symmetry is not worth a broken URL.
 *
 * As a fallback it is also the gentlest wrong answer: showing the beginner set
 * to an expert is a mild mismatch, where an empty panel on the screen that
 * promises "here is your Viberation" is a broken promise.
 */
export const STARTER_SET_FALLBACK_SLUG = "starter-set";

/**
 * How the flagship walkthrough is pitched, per tier (VIB-83's second open item).
 *
 * The same walkthrough, framed for who is reading. A beginner needs to know it
 * ends with something real; someone who has shipped before needs to know it
 * is not going to waste their afternoon.
 */
export function walkthroughFraming(level: RoleLevel): string {
  return {
    beginner: "Start here. It ends with a real URL you can send to someone.",
    intermediate: "A quick pass end to end — useful for the deployment half if you already know the build half.",
    expert: "Skim it for the stack choices; the checklist at the end is the part worth keeping.",
  }[level];
}
