import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

type Client = SupabaseClient<Database>;

/**
 * New members for the daily digest (VIB-236).
 *
 * `profiles` is not readable in bulk by anyone without a session, which is
 * what the cron is, so this wraps the security-definer function from
 * 20261004112903_new_members_digest.sql. The secret is the gate, the same way
 * the welcome sequence's claim is.
 */

export type NewMember =
  Database["public"]["Functions"]["new_members_for_digest"]["Returns"][number];

/** Everyone who joined in the last 25 hours, oldest first. Cron only. */
export async function listNewMembersForDigest(
  client: Client,
  secret: string,
): Promise<NewMember[]> {
  const { data, error } = await client.rpc("new_members_for_digest", {
    p_secret: secret,
  });

  if (error) {
    throw new Error(`listNewMembersForDigest: ${error.message}`);
  }
  return data ?? [];
}
