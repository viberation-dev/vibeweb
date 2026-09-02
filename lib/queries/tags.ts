import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/types/supabase";

export type Tag = Tables<"tags">;

type Client = SupabaseClient<Database>;

/** Every tag, alphabetical. Public-read per migration 03. */
export async function listTags(client: Client): Promise<Tag[]> {
  const { data, error } = await client.from("tags").select("*").order("name");

  if (error) {
    throw new Error(`listTags: ${error.message}`);
  }
  return data;
}

/** One tag by its URL slug. Null when it does not exist. */
export async function getTagBySlug(client: Client, slug: string): Promise<Tag | null> {
  const { data, error } = await client.from("tags").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    throw new Error(`getTagBySlug(${slug}): ${error.message}`);
  }
  return data;
}

/**
 * Tags ordered by how much they are actually used, most-used first.
 *
 * `tags` carries no usage count, but `tool_tags` and `content_tags` do —
 * popularity is one join away rather than absent, which is what makes the
 * home rail's "Popular tags" a real ordering instead of an alphabetical
 * list wearing the word "popular".
 *
 * Tallied here rather than in SQL because it needs a UNION across two join
 * tables, which PostgREST cannot express: the whole of both tables is under
 * a hundred rows, and they are public-read, so the round trip is cheaper
 * than a migration for a view. Revisit if either table reaches thousands.
 */
export async function listPopularTags(client: Client, limit = 5): Promise<Tag[]> {
  const [tags, toolTags, contentTags] = await Promise.all([
    listTags(client),
    client.from("tool_tags").select("tag_id"),
    client.from("content_tags").select("tag_id"),
  ]);

  for (const result of [toolTags, contentTags]) {
    if (result.error) {
      throw new Error(`listPopularTags: ${result.error.message}`);
    }
  }

  const uses = new Map<string, number>();
  for (const row of [...(toolTags.data ?? []), ...(contentTags.data ?? [])]) {
    uses.set(row.tag_id, (uses.get(row.tag_id) ?? 0) + 1);
  }

  return (
    tags
      // Unused tags are dropped rather than shown with a silent zero — a tag
      // nothing is filed under is a dead end for whoever clicks it.
      .filter((tag) => uses.has(tag.id))
      .sort((a, b) => (uses.get(b.id) ?? 0) - (uses.get(a.id) ?? 0) || a.name.localeCompare(b.name))
      .slice(0, limit)
  );
}
