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
  /** 1-based. Values past the end return an empty page, not an error. */
  page?: number;
  pageSize?: number;
};

/** Cards per page. Divides evenly into the 2- and 3-column grids. */
export const TOOLS_PAGE_SIZE = 24;

export type ToolPage = {
  tools: Tool[];
  /** Total matching rows across all pages — what the pager counts with. */
  total: number;
  page: number;
  pageCount: number;
};

/**
 * One page of the directory, newest first, optionally narrowed by category
 * and/or tag.
 *
 * RLS on `tools` is public-read (migration 03), so this works signed out.
 */
export async function listTools(client: Client, filters: ToolFilters = {}): Promise<ToolPage> {
  const pageSize = filters.pageSize ?? TOOLS_PAGE_SIZE;
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * pageSize;

  let query = client
    .from("tools")
    // count: "exact" rides along on the same request, so the pager costs no
    // extra round trip.
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.tag) {
    // ponytail: tag filter costs a second round trip rather than a PostgREST
    // embedded !inner join, which the generated types infer badly. Fold it
    // into one query if the directory ever gets big enough to care.
    query = query.in("id", await toolIdsWithTag(client, filters.tag));
  }

  const { data, count, error } = await query;

  if (error) {
    /*
     * PostgREST answers 416 / PGRST103 when the range *starts* past the last
     * row — asking for page 9 of a 2-page result is an error, not an empty
     * body. A stale or hand-typed ?page= is a normal thing for a visitor to
     * arrive with, so it renders as an empty page rather than a 500.
     */
    if (error.code === "PGRST103") {
      return { tools: [], total: 0, page, pageCount: 1 };
    }
    throw new Error(`listTools: ${error.message}`);
  }

  const total = count ?? 0;
  return { tools: data, total, page, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
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

/*
 * scripts/gen-types.mjs does not emit the Functions block yet, so
 * Database["public"]["Functions"] is empty and .rpc() cannot be typed from
 * the generated types. Narrowing the call here keeps the cast to one line
 * and off the call sites. Delete it once the generator learns functions —
 * that is the real fix, not a wider cast.
 *
 * The double assertion is forced, not lazy: with an empty Functions block
 * .rpc()'s FnName parameter resolves to `never`, so no direct cast overlaps.
 */
type IncrementToolViews = (
  fn: "increment_tool_views",
  args: { tool_slug: string },
) => Promise<{ error: { message: string } | null }>;

/**
 * Bump a tool's view counter.
 *
 * Goes through a security-definer function because `tools` is staff-write
 * under RLS — the function is the one narrow hole, and it can only ever
 * add 1 to view_count on an existing row.
 *
 * Deliberately does not throw: a failed counter must never take down the
 * page the visitor actually asked for.
 */
export async function incrementToolViews(client: Client, slug: string): Promise<void> {
  const { error } = await (client.rpc as unknown as IncrementToolViews)("increment_tool_views", {
    tool_slug: slug,
  });

  if (error) {
    console.error(`incrementToolViews(${slug}): ${error.message}`);
  }
}
