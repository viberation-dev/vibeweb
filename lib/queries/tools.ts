import type { SupabaseClient } from "@supabase/supabase-js";

import type { ToolCategory } from "@/lib/tool-categories";
import type { Database, Tables } from "@/types/supabase";

export type Tool = Tables<"tools">;
export type Tag = Tables<"tags">;

type Client = SupabaseClient<Database>;

export type ToolFilters = {
  category?: ToolCategory;
  /** Tag *slug*, not id — it is what appears in the URL. */
  tag?: string;
  limit?: number;
};

/** Default page size for the directory listing. */
const DEFAULT_LIMIT = 60;

/**
 * Tools in the directory, newest first, optionally narrowed by category
 * and/or tag.
 *
 * RLS on `tools` is public-read (migration 03), so this works signed out.
 */
export async function listTools(client: Client, filters: ToolFilters = {}): Promise<Tool[]> {
  let query = client
    .from("tools")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? DEFAULT_LIMIT);

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.tag) {
    // ponytail: tag filter costs a second round trip rather than a PostgREST
    // embedded !inner join, which the generated types infer badly. Fold it
    // into one query if the directory ever gets big enough to care.
    query = query.in("id", await toolIdsWithTag(client, filters.tag));
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`listTools: ${error.message}`);
  }
  return data;
}

/** Ids of every tool carrying `tagSlug`. Empty array when the tag is unknown. */
async function toolIdsWithTag(client: Client, tagSlug: string): Promise<string[]> {
  const { data, error } = await client
    .from("tool_tags")
    .select("tool_id, tags!inner(slug)")
    .eq("tags.slug", tagSlug);

  if (error) {
    throw new Error(`toolIdsWithTag(${tagSlug}): ${error.message}`);
  }
  return data.map((row) => row.tool_id);
}

/** One tool by its URL slug. Null when it does not exist. */
export async function getToolBySlug(client: Client, slug: string): Promise<Tool | null> {
  const { data, error } = await client.from("tools").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    throw new Error(`getToolBySlug(${slug}): ${error.message}`);
  }
  return data;
}

/** Tags attached to one tool, alphabetical. */
export async function getToolTags(client: Client, toolId: string): Promise<Tag[]> {
  const { data, error } = await client
    .from("tool_tags")
    .select("tags!inner(id, name, slug)")
    .eq("tool_id", toolId);

  if (error) {
    throw new Error(`getToolTags(${toolId}): ${error.message}`);
  }
  return data.map((row) => row.tags).sort((a, b) => a.name.localeCompare(b.name));
}
