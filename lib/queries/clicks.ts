import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/types/supabase";

export type ToolClick = Tables<"tool_clicks">;

type Client = SupabaseClient<Database>;

/**
 * Log one outbound click on a tool.
 *
 * `tool_clicks` is insert-for-anyone / read-for-staff under migration 12:
 * the visitor clicking out is usually signed out, and the numbers would mean
 * nothing if only members were counted.
 *
 * Deliberately does not throw. This runs in after(), where the redirect has
 * already been sent — a lost row must never be able to strand someone
 * between our site and the one they were trying to reach.
 *
 * ponytail: counts every request that reaches /go, prefetches and crawlers
 * included, exactly as view_count does. Fine for a relative popularity
 * signal; if a real affiliate deal ever needs defensible numbers, reconcile
 * against the partner's own dashboard rather than trying to filter bots here.
 */
export async function recordClick(client: Client, toolId: string): Promise<void> {
  const { error } = await client.from("tool_clicks").insert({ tool_id: toolId });

  if (error) {
    console.error(`recordClick(${toolId}): ${error.message}`);
  }
}
