"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/integrations/supabase/server";
import {
  getCurrentProfile,
  isUsernameAvailable,
  updateProfilePreferences,
} from "@/lib/queries/profiles";
import { profilePreferencesSchema } from "@/lib/validation/profile";

export type ProfileFormState = { error?: string; notice?: string };

export async function updateProfileAction(
  _previous: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const parsed = profilePreferencesSchema.safeParse({
    username: formData.get("username"),
    role_level: formData.get("role_level"),
    layout_mode: formData.get("layout_mode"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  /*
   * Re-read the session server-side rather than trusting any id from the
   * form. RLS would reject a write to someone else's row anyway, but not
   * sending an id at all removes the question entirely.
   */
  const profile = await getCurrentProfile(supabase);
  if (!profile) {
    return { error: "Your session has expired. Sign in again to save changes." };
  }

  if (parsed.data.username) {
    const available = await isUsernameAvailable(supabase, parsed.data.username, profile.id);
    if (!available) {
      return { error: "That username is already taken." };
    }
  }

  try {
    await updateProfilePreferences(supabase, profile.id, parsed.data);
  } catch (error) {
    /*
     * The unique index on username is the real guard — the check above can
     * still lose a race between two simultaneous saves.
     */
    const message = error instanceof Error ? error.message : "";
    if (/duplicate key|unique/i.test(message)) {
      return { error: "That username is already taken." };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return { notice: "Saved." };
}
