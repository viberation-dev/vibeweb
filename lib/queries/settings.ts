import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

import { parseDesignTokens, type DesignTokens } from "@/lib/design-tokens";
import { createAnonClient } from "@/lib/integrations/supabase/anon";
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
    return {
      id: true,
      updated_at: new Date(0).toISOString(),
      design_tokens: {},
      ...DEFAULT_BADGE_SETTINGS,
    };
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

export const DESIGN_TOKENS_TAG = "design-tokens";

/*
 * Throws on a failed read instead of returning the fallback, because
 * unstable_cache does not store a throw: caching "no overrides" would paint
 * the stock colours for an hour after one bad request.
 */
const cachedDesignTokens = unstable_cache(
  async (): Promise<DesignTokens> => {
    const { data, error } = await createAnonClient()
      .from("site_settings")
      .select("design_tokens")
      .maybeSingle();

    if (error) throw new Error(`getDesignTokens: ${error.message}`);
    return parseDesignTokens(data?.design_tokens);
  },
  [DESIGN_TOKENS_TAG],
  { tags: [DESIGN_TOKENS_TAG], revalidate: 60 * 60 },
);

/**
 * The design token overrides (VIB-246), for the root layout.
 *
 * Read on every page, identical for every visitor, so it is cached through
 * the session-less client and dropped by tag when staff save. A failed read
 * is the stock design, never a broken page.
 */
export async function getDesignTokens(): Promise<DesignTokens> {
  try {
    return await cachedDesignTokens();
  } catch {
    return {};
  }
}
