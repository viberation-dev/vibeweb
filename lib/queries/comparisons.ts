import type { SupabaseClient } from "@supabase/supabase-js";

import type { Tool } from "@/lib/queries/tools";
import type { Database, Tables, TablesInsert } from "@/types/supabase";

/** Curated "A vs B" pages (VIB-184). The facts come from the two tools. */
export type Comparison = Tables<"tool_comparisons">;
export type ComparisonWithTools = Comparison & { tool_a: Tool; tool_b: Tool };

type ToolName = Pick<Tool, "id" | "name" | "slug">;
export type ComparisonSummary = Comparison & { tool_a: ToolName; tool_b: ToolName };

type Client = SupabaseClient<Database>;

const WITH_TOOLS =
  "*, tool_a:tools!tool_comparisons_tool_a_id_fkey(*), tool_b:tools!tool_comparisons_tool_b_id_fkey(*)";
const WITH_NAMES =
  "*, tool_a:tools!tool_comparisons_tool_a_id_fkey(id, name, slug), tool_b:tools!tool_comparisons_tool_b_id_fkey(id, name, slug)";

/** One published page by slug, both tools in full. Null when missing or a draft. */
export async function getComparisonBySlug(
  client: Client,
  slug: string,
): Promise<ComparisonWithTools | null> {
  const { data, error } = await client
    .from("tool_comparisons")
    .select(WITH_TOOLS)
    // RLS already hides drafts from visitors; repeated so staff browsing the
    // site see what visitors see, same as testimonials.
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`getComparisonBySlug(${slug}): ${error.message}`);
  }
  return data as ComparisonWithTools | null;
}

/** Every published comparison, for /compare, the sitemap and llms.txt. */
export async function listPublishedComparisons(
  client: Client,
): Promise<ComparisonSummary[]> {
  const { data, error } = await client
    .from("tool_comparisons")
    .select(WITH_NAMES)
    .eq("published", true)
    .order("slug");

  if (error) {
    throw new Error(`listPublishedComparisons: ${error.message}`);
  }
  return data as ComparisonSummary[];
}

/** Published comparisons a tool appears in, from either side. */
export async function listComparisonsForTool(
  client: Client,
  toolId: string,
): Promise<ComparisonSummary[]> {
  const { data, error } = await client
    .from("tool_comparisons")
    .select(WITH_NAMES)
    .eq("published", true)
    .or(`tool_a_id.eq.${toolId},tool_b_id.eq.${toolId}`)
    .order("slug");

  if (error) {
    throw new Error(`listComparisonsForTool(${toolId}): ${error.message}`);
  }
  return data as ComparisonSummary[];
}

/** Every comparison, drafts included: the staff list. Newest edit first. */
export async function listAllComparisons(
  client: Client,
): Promise<ComparisonSummary[]> {
  const { data, error } = await client
    .from("tool_comparisons")
    .select(WITH_NAMES)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`listAllComparisons: ${error.message}`);
  }
  return data as ComparisonSummary[];
}

/** One comparison by id, for the editor. Null when it does not exist. */
export async function getComparisonById(
  client: Client,
  id: string,
): Promise<Comparison | null> {
  const { data, error } = await client
    .from("tool_comparisons")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`getComparisonById(${id}): ${error.message}`);
  }
  return data;
}

export type ComparisonWrite = Pick<
  TablesInsert<"tool_comparisons">,
  | "slug"
  | "tool_a_id"
  | "tool_b_id"
  | "intro"
  | "pick_a"
  | "pick_b"
  | "models_a"
  | "models_b"
  | "published"
>;

export async function createComparison(
  client: Client,
  values: ComparisonWrite,
): Promise<void> {
  const { error } = await client.from("tool_comparisons").insert(values);

  if (error) {
    throw new Error(`createComparison(${values.slug}): ${error.message}`);
  }
}

export async function updateComparison(
  client: Client,
  id: string,
  values: ComparisonWrite,
): Promise<void> {
  const { error } = await client
    .from("tool_comparisons")
    // No updated_at trigger, same as testimonials.
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(`updateComparison(${id}): ${error.message}`);
  }
}

export async function deleteComparison(client: Client, id: string): Promise<void> {
  const { error } = await client.from("tool_comparisons").delete().eq("id", id);

  if (error) {
    throw new Error(`deleteComparison(${id}): ${error.message}`);
  }
}
