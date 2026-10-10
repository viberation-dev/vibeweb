"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import {
  DESIGN_MODES,
  DESIGN_TOKEN_NAMES,
  designFieldName,
} from "@/lib/design-tokens";
import { createClient } from "@/lib/integrations/supabase/server";
import { DESIGN_TOKENS_TAG, updateSiteSettings } from "@/lib/queries/settings";
import { requireStaff } from "@/lib/staff";
import { siteSettingsSchema } from "@/lib/validation/settings";

export type SettingsFormState = { error?: string; saved?: boolean };

/**
 * Save the site settings (VIB-187).
 *
 * Same shape as saveToolAction: requireStaff() so the action answers like the
 * page it was posted from, with the `site_settings_write` policy as the
 * actual boundary.
 *
 * It stays on the page rather than redirecting — this is one small form
 * somebody will nudge a couple of times in a row, so it reports "Saved"
 * instead of bouncing them back to the staff index.
 */
export async function saveSettingsAction(
  _previous: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requireStaff("/admin/settings");

  const parsed = siteSettingsSchema.safeParse({
    tool_badge_mode: formData.get("tool_badge_mode"),
    badge_new_days: formData.get("badge_new_days"),
    badge_popular_views: formData.get("badge_popular_views"),
    design_tokens: Object.fromEntries(
      DESIGN_MODES.map((mode) => [
        mode,
        Object.fromEntries(
          DESIGN_TOKEN_NAMES.map((name) => [
            name,
            formData.get(designFieldName(mode, name)) ?? undefined,
          ]),
        ),
      ]),
    ),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await updateSiteSettings(await createClient(), parsed.data);

  // Every surface that renders a tool card reads these.
  revalidatePath("/tools", "layout");
  revalidatePath("/skills");
  revalidatePath("/search");
  revalidatePath("/collections", "layout");
  revalidatePath("/");

  // The root layout paints the design tokens, so every page is affected.
  revalidateTag(DESIGN_TOKENS_TAG);
  revalidatePath("/", "layout");

  return { saved: true };
}
