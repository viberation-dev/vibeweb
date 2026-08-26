import type { SupabaseClient } from "@supabase/supabase-js";

import type { ContentType, RoleLevel } from "@/lib/learn";
import type { Database, Enums, Tables } from "@/types/supabase";

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
 * One page of editorial content, newest first.
 *
 * RLS on `content` is public-read (migration 03), so this works signed out.
 */
export async function listContent(
  client: Client,
  filters: ContentFilters = {},
): Promise<ContentPage> {
  const pageSize = filters.pageSize ?? CONTENT_PAGE_SIZE;
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * pageSize;

  let query = client
    .from("content")
    // count: "exact" rides along on the same request, so the pager costs no
    // extra round trip.
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    // created_at ties on anything seeded in one statement, and Postgres gives
    // no stable order for ties — rows would repeat or vanish across pages.
    // Breaking the tie on the unique slug pins them.
    .order("slug", { ascending: true })
    .range(from, from + pageSize - 1);

  if (filters.types) {
    // An empty list would match nothing, which is what an empty list means.
    query = query.in("type", filters.types);
  }

  if (filters.roleLevel) {
    query = query.or(`role_level.is.null,role_level.eq.${filters.roleLevel}`);
  }

  if (filters.audience) {
    query = query.eq("audience", filters.audience);
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
  return { items: data, total, page, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

/** One content row by its URL slug. Null when it does not exist. */
export async function getContentBySlug(client: Client, slug: string): Promise<Content | null> {
  const { data, error } = await client.from("content").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    throw new Error(`getContentBySlug(${slug}): ${error.message}`);
  }
  return data;
}

/** Tags attached to one content row, alphabetical. */
export async function getContentTags(client: Client, contentId: string): Promise<Tag[]> {
  const { data, error } = await client
    .from("content_tags")
    .select("tags!inner(id, name, slug)")
    .eq("content_id", contentId);

  if (error) {
    throw new Error(`getContentTags(${contentId}): ${error.message}`);
  }
  return data.map((row) => row.tags).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Content rows by id, for hydrating polymorphic references (bookmarks,
 * history, collection items) that carry only a target_id.
 *
 * Returned in no particular order — the caller already knows the order it
 * cares about. Ids that no longer exist are simply absent, which is how a
 * deleted article stops showing up in someone's bookmarks.
 */
export async function getContentByIds(client: Client, ids: string[]): Promise<Content[]> {
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await client.from("content").select("*").in("id", ids);

  if (error) {
    throw new Error(`getContentByIds: ${error.message}`);
  }
  return data;
}
