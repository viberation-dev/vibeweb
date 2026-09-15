"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/integrations/supabase/server";
import {
  nextStep,
  onboardingHref,
  ONBOARDING_STEPS,
  type OnboardingStep,
} from "@/lib/onboarding";
import { saveOnboardingAnswers } from "@/lib/queries/onboarding-answers";
import { getCurrentProfile, updateProfilePreferences } from "@/lib/queries/profiles";
import { onboardingAnswerSchema, onboardingFinishSchema } from "@/lib/validation/onboarding";

/**
 * Saves one step's answer and moves to the next step (VIB-152).
 *
 * Every question step posts here. Answers are written the moment they are
 * given rather than held until the end (VIB-67): the reveal hands out links
 * people are meant to follow, and following one should not lose anything.
 *
 * A `skip` submit advances without writing. A tampered or empty answer does
 * the same rather than erroring, since every question here is optional.
 *
 * `onboarding_completed` stays false until the reveal's own submit, so an
 * abandoned run still gets the home nudge back in (§31 home §3).
 */
export async function saveAnswerAction(formData: FormData): Promise<void> {
  const key = formData.get("step");
  const current = ONBOARDING_STEPS.find((s) => s.key === key)?.step ?? (1 as OnboardingStep);
  const next = onboardingHref(nextStep(current));

  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) {
    redirect("/login?redirectTo=/onboarding");
  }

  if (formData.get("skip")) {
    redirect(next);
  }

  const parsed = onboardingAnswerSchema.safeParse({
    step: key,
    display_name: formData.get("display_name") ?? undefined,
    role_level: formData.get("role_level") ?? undefined,
    usage: formData.get("usage") ?? undefined,
    occupation: formData.get("occupation") ?? undefined,
    creating: formData.getAll("creating"),
    discovery: formData.get("discovery") ?? undefined,
  });

  if (!parsed.success) {
    redirect(next);
  }

  if (parsed.data.step === "level") {
    // `role_level` lives on profiles; everything else is private (VIB-152).
    await updateProfilePreferences(supabase, profile.id, {
      role_level: parsed.data.role_level,
    });
    // The tier changes what Learn and the feed show.
    revalidatePath("/", "layout");
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { step, ...answer } = parsed.data;
    await saveOnboardingAnswers(supabase, profile.id, answer);
  }

  redirect(next);
}

export async function finishOnboardingAction(formData: FormData): Promise<void> {
  const parsed = onboardingFinishSchema.safeParse({
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) {
    redirect("/onboarding");
  }

  const supabase = await createClient();

  /*
   * Re-read the session server-side rather than trusting anything in the
   * form. RLS would reject a write to someone else's row anyway, but not
   * sending an id at all removes the question entirely.
   */
  const profile = await getCurrentProfile(supabase);
  if (!profile) {
    redirect("/login?redirectTo=/onboarding");
  }

  await updateProfilePreferences(supabase, profile.id, { onboarding_completed: true });

  revalidatePath("/", "layout");
  redirect(parsed.data.next ?? "/");
}
