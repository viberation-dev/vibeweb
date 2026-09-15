import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

type Client = SupabaseClient<Database>;

/**
 * Welcome sequence (VIB-155). The table itself is granted to nobody; these
 * wrap the three security-definer functions from migration
 * 20260916090000_welcome_emails.sql, which are the only way in.
 */

export type DueWelcomeEmail = Database["public"]["Functions"]["claim_welcome_emails"]["Returns"][number];

/**
 * Starts the sequence for the signed-in user. Returns the unsubscribe
 * signature when this call started it, or null when it had already started
 * (a repeat sign-in, or a member from before the sequence existed).
 */
export async function startWelcomeEmails(client: Client): Promise<string | null> {
  const { data, error } = await client.rpc("start_welcome_emails");
  if (error) {
    throw new Error(`startWelcomeEmails: ${error.message}`);
  }
  return data?.[0]?.unsubscribe_sig ?? null;
}

/** Claims everyone due a later email and advances them. Cron only. */
export async function claimWelcomeEmails(client: Client, secret: string): Promise<DueWelcomeEmail[]> {
  const { data, error } = await client.rpc("claim_welcome_emails", { p_secret: secret });
  if (error) {
    throw new Error(`claimWelcomeEmails: ${error.message}`);
  }
  return data ?? [];
}

/** True when the signed link was valid and the member is now unsubscribed. */
export async function unsubscribeWelcomeEmails(client: Client, userId: string, signature: string): Promise<boolean> {
  const { data, error } = await client.rpc("unsubscribe_welcome_emails", {
    p_user: userId,
    p_sig: signature,
  });
  if (error) {
    throw new Error(`unsubscribeWelcomeEmails: ${error.message}`);
  }
  return data === true;
}
