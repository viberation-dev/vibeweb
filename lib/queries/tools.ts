import type { SupabaseClient } from "@supabase/supabase-js";

import type { RoleLevel } from "@/lib/role-level";
import { tiersFor, type PricingFilter } from "@/lib/tool-facts";
import type { ToolCategory } from "@/lib/tool-categories";
import {
  DEFAULT_TOOL_SORT,
  toolSortOrder,
  type ToolSort,
} from "@/lib/tool-sorts";
import type { Database, Tables, TablesInsert } from "@/types/supabase";

export type Tool = Tables<"tools">;
export type Tag = Tables<"tags">;

type Client = SupabaseClient<Database>;

export type ToolFilters = {
  category?: ToolCategory;
  /**
   * Audience tier (VIB-87). Tools with a null `best_for` are for everyone and
   * are always included — the filter narrows, it never hides the unstated
   * ones, which is the same rule content's roleLevel filter follows.
   */
  bestFor?: RoleLevel;
  /** Tag *slug*, not id — it is what appears in the URL. */
  tag?: string;
  sort?: ToolSort;
  /** Free text, matched against the tools' own search_vector. */
  q?: string;
  /** `free` or `paid` — see lib/tool-facts.ts for what each matches. */
  pricing?: PricingFilter;
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
 * One page of the directory, optionally narrowed by category and/or tag and
 * ordered by any of the TOOL_SORTS options.
 *
 * RLS on `tools` is public-read (migration 03), so this works signed out.
 */
export async function listTools(
  client: Client,
  filters: ToolFilters = {},
): Promise<ToolPage> {
  const pageSize = filters.pageSize ?? TOOLS_PAGE_SIZE;
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * pageSize;

  const order = toolSortOrder(filters.sort ?? DEFAULT_TOOL_SORT);

  let query = client
    .from("tools")
    // count: "exact" rides along on the same request, so the pager costs no
    // extra round trip.
    .select("*", { count: "exact" })
    .order(order.column, { ascending: order.ascending })
    // Every sort column can tie — two tools added in the same seed, two with
    // 0 views. Postgres gives no stable order for ties, so rows could repeat
    // or vanish across pages. Breaking ties on the unique slug pins them.
    .order("slug", { ascending: true })
    .range(from, from + pageSize - 1);

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.bestFor) {
    query = query.or(`best_for.is.null,best_for.eq.${filters.bestFor}`);
  }

  if (filters.pricing) {
    /*
     * Reads pricing_tier, which is set on every row — not the `free-tier`
     * tag, which covered 7 of 10 Freemium tools and none of the 10 priced
     * "Open source" (VIB-88). The tier list is shared with the tool detail
     * rail so the filter and the fact cannot drift apart.
     */
    query = query.in("pricing_tier", [...tiersFor(filters.pricing)]);
  }

  if (filters.q) {
    /*
     * "Filter within tools" is scoped to this table, so it queries the
     * tools' own search_vector (VIB-47) rather than going through the
     * site-wide search adapter, which also spans content.
     *
     * websearch_to_tsquery parses visitor-shaped input — quoted phrases,
     * OR, a leading minus — without throwing on punctuation the way
     * plainto_tsquery's stricter cousins do.
     */
    query = query.textSearch("search_vector", filters.q, { type: "websearch" });
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
  return {
    tools: data,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Ids of every tool carrying `tagSlug`. Empty array when the tag is unknown. */
async function toolIdsWithTag(
  client: Client,
  tagSlug: string,
): Promise<string[]> {
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
export async function getToolBySlug(
  client: Client,
  slug: string,
): Promise<Tool | null> {
  const { data, error } = await client
    .from("tools")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`getToolBySlug(${slug}): ${error.message}`);
  }
  return data;
}

/** Tags attached to one tool, alphabetical. */
export async function getToolTags(
  client: Client,
  toolId: string,
): Promise<Tag[]> {
  const { data, error } = await client
    .from("tool_tags")
    .select("tags!inner(id, kind, name, slug)")
    .eq("tool_id", toolId);

  if (error) {
    throw new Error(`getToolTags(${toolId}): ${error.message}`);
  }
  return data
    .map((row) => row.tags)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Tags for many tools at once, keyed by tool id.
 *
 * The directory grid needs a tag pill per card; calling getToolTags per tool
 * would be 24 round trips for one page. Tools with no tags are absent from
 * the map rather than present with an empty array — callers already have to
 * handle "not found" for a tool whose row vanished mid-render.
 */
export async function getToolTagsByIds(
  client: Client,
  toolIds: string[],
): Promise<Map<string, Tag[]>> {
  if (toolIds.length === 0) {
    return new Map();
  }

  const { data, error } = await client
    .from("tool_tags")
    .select("tool_id, tags!inner(id, kind, name, slug)")
    .in("tool_id", toolIds);

  if (error) {
    throw new Error(`getToolTagsByIds: ${error.message}`);
  }

  const byTool = new Map<string, Tag[]>();
  for (const row of data) {
    const list = byTool.get(row.tool_id) ?? [];
    list.push(row.tags);
    byTool.set(row.tool_id, list);
  }
  for (const list of byTool.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return byTool;
}

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
export async function incrementToolViews(
  client: Client,
  slug: string,
): Promise<void> {
  const { error } = await client.rpc("increment_tool_views", {
    tool_slug: slug,
  });

  if (error) {
    console.error(`incrementToolViews(${slug}): ${error.message}`);
  }
}

/**
 * Tools by id, for hydrating polymorphic references (bookmarks, history,
 * collection items) that carry only a target_id.
 *
 * Returned in no particular order — the caller already knows the order it
 * cares about, and re-sorting here would throw that away. Ids that no longer
 * exist are simply absent, which is how a deleted tool stops showing up in
 * someone's bookmarks.
 */
export async function getToolsByIds(
  client: Client,
  ids: string[],
): Promise<Tool[]> {
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await client.from("tools").select("*").in("id", ids);

  if (error) {
    throw new Error(`getToolsByIds: ${error.message}`);
  }
  return data;
}

/**
 * Every tool, most recently edited first — the staff editor's list.
 *
 * Separate from listTools() rather than another filter on it: that function
 * is the public directory, paginated and sorted for browsing, and the editor
 * wants the whole table in the order it was last touched.
 */
export async function listAllTools(client: Client): Promise<Tool[]> {
  const { data, error } = await client
    .from("tools")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`listAllTools: ${error.message}`);
  }
  return data;
}

/** One tool by id, for the editor. Null when it does not exist. */
export async function getToolById(
  client: Client,
  id: string,
): Promise<Tool | null> {
  const { data, error } = await client
    .from("tools")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`getToolById(${id}): ${error.message}`);
  }
  return data;
}

/**
 * The editable half of a tool row.
 *
 * `view_count` and `bookmark_count` are absent on purpose — they are owned by
 * increment_tool_views() and the sync_tool_bookmark_count() trigger, and a
 * hand-edited value would be overwritten by the next visitor anyway.
 * `search_vector` is generated, and `comparison_ready` is a v2.0 flag nothing
 * reads yet.
 */
export type ToolWrite = Pick<
  TablesInsert<"tools">,
  | "name"
  | "slug"
  | "category"
  | "tagline"
  | "description"
  | "pricing_tier"
  | "platform"
  | "best_for"
  | "outbound_url"
  | "is_affiliate"
>;

export async function createTool(
  client: Client,
  values: ToolWrite,
): Promise<Tool> {
  const { data, error } = await client
    .from("tools")
    .insert(values)
    .select("*")
    .single();

  if (error) {
    throw new Error(`createTool(${values.slug}): ${error.message}`);
  }
  return data;
}

export async function updateTool(
  client: Client,
  id: string,
  values: ToolWrite,
): Promise<Tool> {
  const { data, error } = await client
    .from("tools")
    // Same as updateContent: no `updated_at` trigger on this table, so an
    // edit would otherwise keep its original timestamp.
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`updateTool(${id}): ${error.message}`);
  }
  return data;
}
