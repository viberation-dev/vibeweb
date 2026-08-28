import type { SupabaseClient } from "@supabase/supabase-js";

import { getContentByIds, type Content } from "@/lib/queries/content";
import { getToolsByIds, type Tool } from "@/lib/queries/tools";
import type { Database, Tables } from "@/types/supabase";

export type Collection = Tables<"collections">;
export type CollectionItem = Tables<"collection_items">;

type Client = SupabaseClient<Database>;

/**
 * One entry in a collection, with its target already resolved.
 *
 * A collection mixes kinds — a curated set is typically a few tools plus the
 * guide that explains them — so the discriminant travels with the row and
 * the page renders from `kind` rather than guessing.
 */
export type CollectionEntry =
  | { kind: "tool"; item: CollectionItem; tool: Tool }
  | { kind: "content"; item: CollectionItem; content: Content };

/** Every collection, featured first, then newest. */
export async function listCollections(client: Client): Promise<Collection[]> {
  const { data, error } = await client
    .from("collections")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`listCollections: ${error.message}`);
  }
  return data;
}

/** The curated collections for the home feed, newest first. */
export async function listFeaturedCollections(client: Client, limit = 3): Promise<Collection[]> {
  const { data, error } = await client
    .from("collections")
    .select("*")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`listFeaturedCollections: ${error.message}`);
  }
  return data;
}

/** One collection by its URL slug. Null when it does not exist. */
export async function getCollectionBySlug(
  client: Client,
  slug: string,
): Promise<Collection | null> {
  const { data, error } = await client
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`getCollectionBySlug(${slug}): ${error.message}`);
  }
  return data;
}

/**
 * A collection's members, resolved and in curator order.
 *
 * `collection_items` is polymorphic (target_type + target_id) with no
 * database-level foreign key — one FK cannot span five tables — so migration
 * 04 leaves target integrity to app code. Two consequences handled here:
 *
 *  - Each kind is fetched from its own table, one round trip per kind that
 *    actually appears, not one per item.
 *  - An item whose target no longer exists is dropped rather than rendered
 *    as a hole. Nothing deletes a collection item when its tool goes away,
 *    so this is the place that notices.
 *
 * Kinds with no UI yet (prompts, wizards) are skipped for the same reason.
 */
export async function getCollectionEntries(
  client: Client,
  collectionId: string,
): Promise<CollectionEntry[]> {
  const { data: items, error } = await client
    .from("collection_items")
    .select("*")
    .eq("collection_id", collectionId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`getCollectionEntries(${collectionId}): ${error.message}`);
  }

  const idsOf = (kind: CollectionItem["target_type"]) =>
    items.filter((item) => item.target_type === kind).map((item) => item.target_id);

  const [tools, content] = await Promise.all([
    getToolsByIds(client, idsOf("tool")),
    getContentByIds(client, idsOf("content")),
  ]);

  const toolsById = new Map(tools.map((tool) => [tool.id, tool]));
  const contentById = new Map(content.map((row) => [row.id, row]));

  const entries: CollectionEntry[] = [];
  for (const item of items) {
    if (item.target_type === "tool") {
      const tool = toolsById.get(item.target_id);
      if (tool) entries.push({ kind: "tool", item, tool });
    } else if (item.target_type === "content") {
      const row = contentById.get(item.target_id);
      if (row) entries.push({ kind: "content", item, content: row });
    }
  }
  return entries;
}

/** How many members each of `collectionIds` has, for index-page counts. */
export async function countCollectionItems(
  client: Client,
  collectionIds: string[],
): Promise<Map<string, number>> {
  if (collectionIds.length === 0) {
    return new Map();
  }

  const { data, error } = await client
    .from("collection_items")
    .select("collection_id")
    .in("collection_id", collectionIds);

  if (error) {
    throw new Error(`countCollectionItems: ${error.message}`);
  }

  const counts = new Map<string, number>();
  for (const row of data) {
    counts.set(row.collection_id, (counts.get(row.collection_id) ?? 0) + 1);
  }
  return counts;
}

/**
 * Collections by id, for hydrating search hits.
 *
 * Returned in no particular order — the caller already knows the order it
 * cares about (search returns them ranked). Ids that no longer exist are
 * simply absent.
 */
export async function getCollectionsByIds(
  client: Client,
  ids: string[],
): Promise<Collection[]> {
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await client.from("collections").select("*").in("id", ids);

  if (error) {
    throw new Error(`getCollectionsByIds: ${error.message}`);
  }
  return data;
}
