import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables, TablesUpdate } from "@/types/supabase";

export type Profile = Tables<"profiles">;

type Client = SupabaseClient<Database>;

/**
 * The fields a user is allowed to change about themselves.
 *
 * `app_role` is deliberately absent. Migration 02's guard_app_role() trigger
 * is what actually prevents privilege escalation; keeping the field out of
 * this type is defence in depth, so a careless caller cannot even express it.
 */
export type ProfilePreferences = Pick<
  TablesUpdate<"profiles">,
  "username" | "role_level" | "layout_mode"
>;

/**
 * Supabase returns { data, error } rather than throwing. Surfacing the error
 * keeps a failed query from being silently read as "no rows".
 */
function unwrap<T>(result: { data: T | null; error: { message: string } | null }, context: string): T {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
  if (result.data === null) {
    throw new Error(`${context}: no data returned`);
  }
  return result.data;
}

/** Look up one profile by id. Returns null when it does not exist. */
export async function getProfile(client: Client, id: string): Promise<Profile | null> {
  const { data, error } = await client.from("profiles").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`getProfile(${id}): ${error.message}`);
  }
  return data;
}

/**
 * The signed-in user's profile, or null when nobody is signed in.
 *
 * Uses getUser() rather than getSession() — getUser() revalidates the token
 * against Supabase, so it can be trusted on the server. getSession() only
 * reads the cookie, which the client could have tampered with.
 */
export async function getCurrentProfile(client: Client): Promise<Profile | null> {
  const { data, error } = await client.auth.getUser();

  if (error || !data.user) {
    return null;
  }
  return getProfile(client, data.user.id);
}

/**
 * Update the current user's own preferences.
 *
 * RLS restricts the write to the caller's own row, so no ownership check is
 * duplicated here — that is the boundary doing its job.
 */
export async function updateProfilePreferences(
  client: Client,
  id: string,
  preferences: ProfilePreferences,
): Promise<Profile> {
  const result = await client
    .from("profiles")
    .update({ ...preferences, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  return unwrap(result, `updateProfilePreferences(${id})`);
}

/** True when the username is free (or already belongs to `excludeId`). */
export async function isUsernameAvailable(
  client: Client,
  username: string,
  excludeId?: string,
): Promise<boolean> {
  let query = client.from("profiles").select("id").eq("username", username);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    throw new Error(`isUsernameAvailable(${username}): ${error.message}`);
  }
  return data.length === 0;
}
