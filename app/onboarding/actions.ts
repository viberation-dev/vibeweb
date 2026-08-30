"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/integrations/supabase/server";
import { DEFAULT_ROLE_LEVEL, onboardingHref } from "@/lib/onboarding";
import { getCurrentProfile, updateProfilePreferences } from "@/lib/queries/profiles";
import { onboardingFinishSchema, onboardingLevelSchema } from "@/lib/validation/onboarding";

/**
 * Writes the chosen tier and marks onboarding done.
 *
 * The only two things onboarding persists (VIB-39). Step 2's focus is not
 * written: nothing consumes a stored focus yet — the home feed personalizes
 * on `role_level` — so storing it now would be a column with no reader. When
 * the feed starts weighting facet tags, that is the change that earns it.
 *
 * A plain Server Action taking FormData, like the bookmark toggle: no client
 * component, and the flow completes without JavaScript.
 */
/**
 * Saves the chosen tier on the way from step 1 to step 2 (VIB-67).
 *
 * Onboarding used to write nothing until the final submit, which meant the
 * reveal — a page whose whole job is to hand you tool cards worth clicking —
 * discarded the answer the moment you clicked one. Reading your reveal and
 * following it into the product is success, not abandonment, and it should
 * not be the one path that loses your level.
 *
 * `onboarding_completed` deliberately stays false here. Choosing a tier is
 * not finishing, so an abandoned run still gets the home nudge offering the
 * way back in (§31 home §3) — that separation is the point.
 */
export async function chooseLevelAction(formData: FormData): Promise<void> {
  const parsed = onboardingLevelSchema.safeParse({
    role_level: formData.get("role_level") ?? DEFAULT_ROLE_LEVEL,
  });

  if (!parsed.success) {
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) {
    redirect("/login?redirectTo=/onboarding");
  }

  await updateProfilePreferences(supabase, profile.id, {
    role_level: parsed.data.role_level,
  });

  /*
   * The tier already changes what Learn and the feed show, so caches are
   * stale from here rather than only at the finish.
   */
  revalidatePath("/", "layout");

  // Back to a plain URL, so step 2 stays bookmarkable and the back button
  // keeps working exactly as it did when this was a GET form.
  redirect(onboardingHref({ step: 2, level: parsed.data.role_level }));
}

export async function finishOnboardingAction(formData: FormData): Promise<void> {
  /*
   * A missing level means step 1 was skipped. §31 says that is beginner, not
   * an error to bounce someone back for. Anything else present but wrong is
   * a tampered form, and zod rejects it below.
   */
  const parsed = onboardingFinishSchema.safeParse({
    role_level: formData.get("role_level") ?? DEFAULT_ROLE_LEVEL,
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

  await updateProfilePreferences(supabase, profile.id, {
    role_level: parsed.data.role_level,
    onboarding_completed: true,
  });

  // The tier changes what Learn and the home feed show, so every cached
  // render is now stale.
  revalidatePath("/", "layout");
  redirect(parsed.data.next ?? "/");
}
