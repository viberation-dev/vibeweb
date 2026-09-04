import type { SupabaseClient } from "@supabase/supabase-js";

import {
  DEFAULT_LEARN_SORT,
  learnSortOrder,
  type ContentPillar,
  type ContentType,
  type LearnSort,
} from "@/lib/learn";
import { roleLevelFilter, type RoleLevel } from "@/lib/role-level";
import type { Database, Enums, Tables, TablesInsert } from "@/types/supabase";

export type Content = Tables<"content">;
export type Tag = Tables<"tags">;

type Client = SupabaseClient<Database>;

export type ContentFilters = {
  /** Which types to list. Omitted means every type, `role_guide` included. */
  types?: ContentType[];
  /**
   * Audience tier. Rows with a null `role_level` are for everyone and are
   * always included — the filter narrows, it never hides the universal ones.
   */
  roleLevel?: RoleLevel;
  /** Only meaningful for `role_guide` rows; null on everything else. */
  audience?: Enums<"docs_audience">;
  /** Editorial pillar (VIB-90). Unfiled rows match no pillar. */
  pillar?: ContentPillar;
  /** Tag *slug*, not id — it is what appears in the URL. */
  tag?: string;
  /** Ordering. Omitted means the default, newest first. */
  sort?: LearnSort;
  /** 1-based. Values past the end return an empty page, not an error. */
  page?: number;
  pageSize?: number;
};

/** Cards per page. Same as the tools directory, for the same grid. */
export const CONTENT_PAGE_SIZE = 24;

export type ContentPage = {
  items: Content[];
  /** Total matching rows across all pages — what the pager counts with. */
  total: number;
  page: number;
  pageCount: number;
};

/**
 * One page of published editorial content, newest first.
 *
 * RLS on `content` (migration 14) hides drafts from everyone but staff, so
 * this works signed out. The status filter here is for the index's intent,
 * not security — mirroring listWizards(): a staff member browsing Learn wants
 * the published list, and reaches a draft by its own URL to preview it.
 */
export async function listContent(
  client: Client,
  filters: ContentFilters = {},
): Promise<ContentPage> {
  const pageSize = filters.pageSize ?? CONTENT_PAGE_SIZE;
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * pageSize;

  const order = learnSortOrder(filters.sort ?? DEFAULT_LEARN_SORT);

  let query = client
    .from("content")
    // count: "exact" rides along on the same request, so the pager costs no
    // extra round trip.
    .select("*", { count: "exact" })
    .order(order.column, { ascending: order.ascending })
    // created_at ties on anything seeded in one statement, and Postgres gives
    // no stable order for ties — rows would repeat or vanish across pages.
    // Breaking the tie on the unique slug pins them.
    .order("slug", { ascending: true })
    .eq("status", "published")
    .range(from, from + pageSize - 1);

  if (filters.types) {
    // An empty list would match nothing, which is what an empty list means.
    query = query.in("type", filters.types);
  }

  if (filters.roleLevel) {
    query = query.or(roleLevelFilter(filters.roleLevel));
  }

  if (filters.audience) {
    query = query.eq("audience", filters.audience);
  }

  if (filters.pillar) {
    query = query.eq("pillar", filters.pillar);
  }

  if (filters.tag) {
    // ponytail: a second round trip rather than a PostgREST embedded !inner
    // join, which the generated types infer badly — same trade listTools
    // makes for the same reason.
    query = query.in("id", await contentIdsWithTag(client, filters.tag));
  }

  const { data, count, error } = await query;

  if (error) {
    /*
     * PostgREST answers 416 / PGRST103 when the range *starts* past the last
     * row — asking for page 9 of a 2-page result is an error, not an empty
     * body. A stale or hand-typed ?page= is a normal thing to arrive with,
     * so it renders as an empty page rather than a 500.
     */
    if (error.code === "PGRST103") {
      return { items: [], total: 0, page, pageCount: 1 };
    }
    throw new Error(`listContent: ${error.message}`);
  }

  const total = count ?? 0;
  return {
    items: data,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Ids of every content row carrying `tagSlug`. Empty array when the tag is unknown. */
async function contentIdsWithTag(
  client: Client,
  tagSlug: string,
): Promise<string[]> {
  const { data, error } = await client
    .from("content_tags")
    .select("content_id, tags!inner(slug)")
    .eq("tags.slug", tagSlug);

  if (error) {
    throw new Error(`contentIdsWithTag(${tagSlug}): ${error.message}`);
  }
  return data.map((row) => row.content_id);
}

/**
 * One content row by its URL slug. Null when it does not exist.
 *
 * A draft returns null for everyone except staff — that is RLS filtering the
 * row out, not a check in this function. Do not add one: the policy is the
 * boundary (§34). Staff previewing a draft at its own URL is the intended
 * behaviour, exactly as with getWizardBySlug().
 */
export async function getContentBySlug(
  client: Client,
  slug: string,
): Promise<Content | null> {
  const { data, error } = await client
    .from("content")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`getContentBySlug(${slug}): ${error.message}`);
  }
  return data;
}

/** Tags attached to one content row, alphabetical. */
export async function getContentTags(
  client: Client,
  contentId: string,
): Promise<Tag[]> {
  const { data, error } = await client
    .from("content_tags")
    .select("tags!inner(id, kind, name, slug)")
    .eq("content_id", contentId);

  if (error) {
    throw new Error(`getContentTags(${contentId}): ${error.message}`);
  }
  return data
    .map((row) => row.tags)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Content rows by id, for hydrating polymorphic references (bookmarks,
 * history, collection items) that carry only a target_id.
 *
 * Returned in no particular order — the caller already knows the order it
 * cares about. Ids that no longer exist are simply absent, which is how a
 * deleted article stops showing up in someone's bookmarks.
 */
export async function getContentByIds(
  client: Client,
  ids: string[],
): Promise<Content[]> {
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await client
    .from("content")
    .select("*")
    .in("id", ids);

  if (error) {
    throw new Error(`getContentByIds: ${error.message}`);
  }
  return data;
}

/**
 * Bump an article's view counter (VIB-86).
 *
 * Goes through a security-definer function for the same reason tools does:
 * `content` is staff-write under RLS, so a signed-out reader cannot update
 * the row. The function is the one narrow hole, and it only ever adds 1 to
 * view_count on a *published* row.
 */
export async function incrementContentViews(
  client: Client,
  slug: string,
): Promise<void> {
  const { error } = await client.rpc("increment_content_views", {
    content_slug: slug,
  });

  if (error) {
    throw new Error(`incrementContentViews(${slug}): ${error.message}`);
  }
}

/**
 * Every content row, drafts included, newest first — the staff editor's list.
 *
 * Deliberately not `listContent({ status })`: that function is the visitor's
 * index and its published filter is part of what it means. Staff see drafts
 * here because RLS lets them (migration 14), not because this asks.
 */
export async function listAllContent(client: Client): Promise<Content[]> {
  const { data, error } = await client
    .from("content")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`listAllContent: ${error.message}`);
  }
  return data;
}

/** One content row by id, for the editor. Null when it does not exist. */
export async function getContentById(
  client: Client,
  id: string,
): Promise<Content | null> {
  const { data, error } = await client
    .from("content")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`getContentById(${id}): ${error.message}`);
  }
  return data;
}

/** The editable half of a content row. Counters and search_vector are not in it. */
export type ContentWrite = Pick<
  TablesInsert<"content">,
  | "type"
  | "title"
  | "slug"
  | "body"
  | "role_level"
  | "audience"
  | "pillar"
  | "status"
>;

export async function createContent(
  client: Client,
  values: ContentWrite,
): Promise<Content> {
  const { data, error } = await client
    .from("content")
    .insert(values)
    .select("*")
    .single();

  if (error) {
    throw new Error(`createContent(${values.slug}): ${error.message}`);
  }
  return data;
}

export async function updateContent(
  client: Client,
  id: string,
  values: ContentWrite,
): Promise<Content> {
  const { data, error } = await client
    .from("content")
    // No `updated_at` trigger on this table (migration 03 only defaults it),
    // so an edit would otherwise keep its original timestamp and the editor's
    // most-recent-first list would be a lie.
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`updateContent(${id}): ${error.message}`);
  }
  return data;
}

/**
 * How many published pieces sit in each pillar (VIB-95).
 *
 * The Learn hub shows all six pillars whether or not they have anything in
 * them — a count of 0 reads as "nothing here yet", where a missing chip reads
 * as a broken taxonomy. That only works if the counts are real.
 *
 * ponytail: counts in JS over one narrow select, because PostgREST has no
 * GROUP BY. Fine at 13 rows and fine at a few hundred; if Learn ever holds
 * thousands, this becomes an RPC doing `group by pillar` in Postgres.
 */
export async function countContentByPillar(
  client: Client,
  types: ContentType[],
): Promise<Map<ContentPillar, number>> {
  const { data, error } = await client
    .from("content")
    .select("pillar")
    .eq("status", "published")
    .in("type", types)
    .not("pillar", "is", null);

  if (error) {
    throw new Error(`countContentByPillar: ${error.message}`);
  }

  const counts = new Map<ContentPillar, number>();
  for (const row of data) {
    if (row.pillar) {
      counts.set(row.pillar, (counts.get(row.pillar) ?? 0) + 1);
    }
  }
  return counts;
}
