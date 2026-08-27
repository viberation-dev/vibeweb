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
