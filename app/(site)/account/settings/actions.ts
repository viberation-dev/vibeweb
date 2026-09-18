"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/integrations/supabase/server";
import {
  removeAvatarFile,
  uploadAvatar,
  type AvatarType,
} from "@/lib/queries/avatars";
import { saveOnboardingAnswers } from "@/lib/queries/onboarding-answers";
import {
  getCurrentProfile,
  isUsernameAvailable,
  updateProfilePreferences,
} from "@/lib/queries/profiles";
import {
  avatarSchema,
  profilePreferencesSchema,
} from "@/lib/validation/profile";

export type ProfileFormState = { error?: string; notice?: string };

export async function updateProfileAction(
  _previous: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const parsed = profilePreferencesSchema.safeParse({
    display_name: formData.get("display_name") ?? "",
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
    return {
      error: "Your session has expired. Sign in again to save changes.",
    };
  }

  if (parsed.data.username) {
    const available = await isUsernameAvailable(
      supabase,
      parsed.data.username,
      profile.id,
    );
    if (!available) {
      return { error: "That username is already taken." };
    }
  }

  // The name is private, so it lives with the onboarding answers (VIB-178).
  const { display_name, ...preferences } = parsed.data;

  try {
    await updateProfilePreferences(supabase, profile.id, preferences);
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

  await saveOnboardingAnswers(supabase, profile.id, { display_name });

  revalidatePath("/", "layout");
  return { notice: "Saved." };
}

/**
 * Upload a new profile photo, or remove the current one (VIB-178).
 *
 * Storage policies confine writes to the caller's own folder and the
 * `avatar_path` check constraint confines the column to it too, so the
 * session re-read below is about finding *which* folder, not about trust.
 */
export async function updateAvatarAction(
  _previous: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) {
    return {
      error: "Your session has expired. Sign in again to save changes.",
    };
  }

  let path: string | null = null;
  if (formData.get("intent") !== "remove") {
    const parsed = avatarSchema.safeParse(formData.get("avatar"));
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }
    path = await uploadAvatar(
      supabase,
      profile.id,
      parsed.data,
      parsed.data.type as AvatarType,
    );
  }

  await updateProfilePreferences(supabase, profile.id, { avatar_path: path });
  if (profile.avatar_path) {
    await removeAvatarFile(supabase, profile.avatar_path);
  }

  revalidatePath("/", "layout");
  return { notice: path ? "Photo updated." : "Photo removed." };
}
