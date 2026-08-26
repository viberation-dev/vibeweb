"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/integrations/supabase/server";
import { DEFAULT_ROLE_LEVEL } from "@/lib/onboarding";
import { getCurrentProfile, updateProfilePreferences } from "@/lib/queries/profiles";
import { onboardingFinishSchema } from "@/lib/validation/onboarding";

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
