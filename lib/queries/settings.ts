import type { SupabaseClient } from "@supabase/supabase-js";

import { DEFAULT_BADGE_SETTINGS } from "@/lib/tool-badges";
import type { Database, Tables } from "@/types/supabase";

export type SiteSettings = Tables<"site_settings">;

type Client = SupabaseClient<Database>;

/**
 * The single settings row (VIB-187).
 *
 * Read on every surface that renders a tool card, so it must never be the
 * thing that takes the page down: a missing row or a failed read falls back
 * to the defaults, which are the same values the column defaults are. The
 * failure mode is a page with no badges, not a page with no tools.
 *
 * `maybeSingle` rather than `single` for the same reason — zero rows is a
 * fallback, not an error.
 */
export async function getSiteSettings(client: Client): Promise<SiteSettings> {
  const { data, error } = await client.from("site_settings").select("*").maybeSingle();

  if (error || !data) {
    return { id: true, updated_at: new Date(0).toISOString(), ...DEFAULT_BADGE_SETTINGS };
  }
  return data;
}

/**
 * Staff-only, enforced by the `site_settings_write` policy rather than here.
 * The row is created by its migration and there is exactly one, so this is an
 * update on the fixed key and never an upsert.
 */
export async function updateSiteSettings(
  client: Client,
  values: Partial<Omit<SiteSettings, "id" | "updated_at">>,
): Promise<void> {
  const { error } = await client
    .from("site_settings")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", true);

  if (error) {
    throw new Error(`updateSiteSettings: ${error.message}`);
  }
}
