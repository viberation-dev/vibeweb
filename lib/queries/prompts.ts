import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/types/supabase";

export type Prompt = Tables<"prompts">;

type Client = SupabaseClient<Database>;

/**
 * Starter prompts attached to one tool (VIB-111), grouped by use case.
 *
 * Display only: this is the tool page's "copy one and go" list, not a Prompts
 * library — that product is separate, and its nav item stays disabled.
 *
 * RLS on `prompts` is public-read (migration 03), so this works signed out.
 */
export async function listPromptsForTool(client: Client, toolId: string): Promise<Prompt[]> {
  const { data, error } = await client
    .from("prompts")
    .select("*")
    .eq("tool_id", toolId)
    .order("use_case_category", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    throw new Error(`listPromptsForTool(${toolId}): ${error.message}`);
  }
  return data;
}
