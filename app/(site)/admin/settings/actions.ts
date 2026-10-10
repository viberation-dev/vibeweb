"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import {
  describeDesignChange,
  designContrastProblem,
  designTokensFromForm,
  parseDesignTokens,
  type DesignState,
} from "@/lib/design-tokens";
import { createClient } from "@/lib/integrations/supabase/server";
import type { Profile } from "@/lib/queries/profiles";
import {
  DESIGN_TOKENS_TAG,
  getDesignHistoryEntry,
  getSiteSettings,
  insertDesignHistory,
  updateSiteSettings,
  type SiteSettings,
} from "@/lib/queries/settings";
import { requireStaff } from "@/lib/staff";
import { siteSettingsSchema } from "@/lib/validation/settings";

export type SettingsFormState = { error?: string; saved?: boolean };

const designStateOf = (settings: SiteSettings): DesignState => ({
  tokens: parseDesignTokens(settings.design_tokens),
  defaults: parseDesignTokens(settings.design_token_defaults),
});

/**
 * Records a design change (VIB-247) and drops the cached tokens, when the
 * save actually moved something. A save that only touched the badge settings
 * leaves no history row.
 */
async function recordDesignChange(
  client: Awaited<ReturnType<typeof createClient>>,
  staff: Profile,
  before: DesignState,
  after: DesignState,
  prefix = "",
) {
  const summary = describeDesignChange(before, after);
  if (!summary) return;

  // The root layout paints the design tokens, so every page is affected.
  revalidateTag(DESIGN_TOKENS_TAG);
  revalidatePath("/", "layout");

  await insertDesignHistory(client, {
    ...after,
    summary: prefix + summary,
    actor_name: staff.username ?? staff.email ?? "Staff",
  });
}

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
  const staff = await requireStaff("/admin/settings");

  const parsed = siteSettingsSchema.safeParse({
    tool_badge_mode: formData.get("tool_badge_mode"),
    badge_new_days: formData.get("badge_new_days"),
    badge_popular_views: formData.get("badge_popular_views"),
    design_tokens: designTokensFromForm(formData, "design_tokens"),
    design_token_defaults: designTokensFromForm(formData, "design_token_defaults"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const client = await createClient();
  const before = designStateOf(await getSiteSettings(client));

  await updateSiteSettings(client, parsed.data);

  // Every surface that renders a tool card reads these.
  revalidatePath("/tools", "layout");
  revalidatePath("/skills");
  revalidatePath("/search");
  revalidatePath("/collections", "layout");
  revalidatePath("/");

  await recordDesignChange(client, staff, before, {
    tokens: parsed.data.design_tokens,
    defaults: parsed.data.design_token_defaults,
  });

  return { saved: true };
}

/**
 * Put the design back to how one history entry left it (VIB-247).
 *
 * The stored snapshot goes back through parseDesignTokens and the contrast
 * check like any other input: the token list and the stock palette may have
 * changed since it was written.
 */
export async function restoreDesignAction(formData: FormData): Promise<void> {
  const staff = await requireStaff("/admin/settings");
  const id = z.coerce.number().int().positive().parse(formData.get("id"));

  const client = await createClient();
  const entry = await getDesignHistoryEntry(client, id);
  if (!entry) {
    throw new Error("That history entry no longer exists.");
  }

  const after: DesignState = {
    tokens: parseDesignTokens(entry.tokens),
    defaults: parseDesignTokens(entry.defaults),
  };
  const problem = designContrastProblem(after.tokens);
  if (problem) {
    throw new Error(`Cannot restore: ${problem}`);
  }

  const before = designStateOf(await getSiteSettings(client));
  await updateSiteSettings(client, {
    design_tokens: after.tokens,
    design_token_defaults: after.defaults,
  });
  await recordDesignChange(client, staff, before, after, "Restored. ");
}
