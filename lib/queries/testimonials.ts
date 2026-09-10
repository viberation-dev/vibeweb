import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables, TablesInsert } from "@/types/supabase";

export type Testimonial = Tables<"testimonials">;

type Client = SupabaseClient<Database>;

/**
 * Published testimonials for the homepage proof section (VIB-102).
 *
 * RLS does the filtering — `testimonials_read` is
 * `using (published or is_staff())` — but the `published` filter is repeated
 * here on purpose. Signed-in staff browsing the marketing homepage would
 * otherwise see their own drafts sitting among the live quotes with nothing
 * marking them as unpublished, which is a confusing way to find out.
 *
 * `sort_order` first, because which three quotes lead is an editorial call
 * rather than whichever happen to be newest; `created_at` only breaks ties,
 * so equal sort_order values still come back in a stable order instead of
 * shuffling between requests.
 */
export async function listPublishedTestimonials(
  client: Client,
  limit = 3,
): Promise<Testimonial[]> {
  const { data, error } = await client
    .from("testimonials")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`listPublishedTestimonials: ${error.message}`);
  }
  return data;
}

/** Every testimonial, drafts included — the staff list. Newest edit first. */
export async function listAllTestimonials(
  client: Client,
): Promise<Testimonial[]> {
  const { data, error } = await client
    .from("testimonials")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`listAllTestimonials: ${error.message}`);
  }
  return data;
}

/** One testimonial by id, for the editor. Null when it does not exist. */
export async function getTestimonialById(
  client: Client,
  id: string,
): Promise<Testimonial | null> {
  const { data, error } = await client
    .from("testimonials")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`getTestimonialById(${id}): ${error.message}`);
  }
  return data;
}

export type TestimonialWrite = Pick<
  TablesInsert<"testimonials">,
  | "quote"
  | "author_name"
  | "location"
  | "initials"
  | "role_level"
  | "source_url"
  | "consent_at"
  | "published"
  | "sort_order"
>;

export async function createTestimonial(
  client: Client,
  values: TestimonialWrite,
): Promise<Testimonial> {
  const { data, error } = await client
    .from("testimonials")
    .insert(values)
    .select("*")
    .single();

  if (error) {
    throw new Error(`createTestimonial(${values.author_name}): ${error.message}`);
  }
  return data;
}

export async function updateTestimonial(
  client: Client,
  id: string,
  values: TestimonialWrite,
): Promise<Testimonial> {
  const { data, error } = await client
    .from("testimonials")
    // No updated_at trigger on this table, same as `content` — an edit would
    // otherwise keep its original timestamp and the editor's most-recently-
    // edited list would be a lie.
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`updateTestimonial(${id}): ${error.message}`);
  }
  return data;
}

export async function deleteTestimonial(
  client: Client,
  id: string,
): Promise<void> {
  const { error } = await client.from("testimonials").delete().eq("id", id);

  if (error) {
    throw new Error(`deleteTestimonial(${id}): ${error.message}`);
  }
}
