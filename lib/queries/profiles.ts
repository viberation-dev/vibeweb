import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import type { Database, Tables, TablesUpdate } from "@/types/supabase";

/**
 * The columns anon and authenticated may read (migration 20260915090000).
 * `email` is not among them: it is private, and `select *` would fail with
 * 42501 under column grants, so every read lists these explicitly.
 */
const PUBLIC_COLUMNS =
  "id, username, avatar_path, plan, role_level, app_role, layout_mode, onboarding_completed, created_at, updated_at";

export type PublicProfile = Omit<Tables<"profiles">, "email">;

/** The signed-in user's own profile; `email` comes from auth, not the table. */
export type Profile = Tables<"profiles">;

type Client = SupabaseClient<Database>;

/**
 * The fields a user is allowed to change about themselves.
 *
 * `app_role` is deliberately absent. Migration 02's guard_app_role() trigger
 * is what actually prevents privilege escalation; keeping the field out of
 * this type is defence in depth, so a careless caller cannot even express it.
 *
 * `onboarding_completed` belongs here: it is the user's own flag, written
 * once by the onboarding flow, and RLS scopes the write to their own row.
 */
export type ProfilePreferences = Pick<
  TablesUpdate<"profiles">,
  | "username"
  | "role_level"
  | "layout_mode"
  | "onboarding_completed"
  | "avatar_path"
>;

/**
 * Supabase returns { data, error } rather than throwing. Surfacing the error
 * keeps a failed query from being silently read as "no rows".
 */
function unwrap<T>(
  result: { data: T | null; error: { message: string } | null },
  context: string,
): T {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
  if (result.data === null) {
    throw new Error(`${context}: no data returned`);
  }
  return result.data;
}

/** Look up one profile by id. Returns null when it does not exist. */
export async function getProfile(
  client: Client,
  id: string,
): Promise<PublicProfile | null> {
  const { data, error } = await client
    .from("profiles")
    .select(PUBLIC_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`getProfile(${id}): ${error.message}`);
  }
  return data;
}

/**
 * The signed-in auth user, or null when nobody is signed in.
 *
 * Uses getUser() rather than getSession() — getUser() revalidates the token
 * against Supabase, so it can be trusted on the server. getSession() only
 * reads the cookie, which the client could have tampered with.
 *
 * Wrapped in cache() so the root layout, the /account layout and the page
 * beneath them share one revalidation per request instead of three. The key
 * is the client, which createClient() also caches — both halves are needed
 * or this dedupes nothing.
 */
export const getCurrentUser = cache(async function getCurrentUser(
  client: Client,
) {
  const { data, error } = await client.auth.getUser();
  return error ? null : data.user;
});

/**
 * The signed-in user's profile, or null when nobody is signed in — or when
 * the auth user exists but its profiles row does not (VIB-173). Callers that
 * only need "is someone signed in" should ask getCurrentUser instead.
 */
export const getCurrentProfile = cache(async function getCurrentProfile(
  client: Client,
): Promise<Profile | null> {
  const user = await getCurrentUser(client);

  if (!user) {
    return null;
  }
  const profile = await getProfile(client, user.id);
  return profile && { ...profile, email: user.email ?? null };
});

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
): Promise<PublicProfile> {
  const result = await client
    .from("profiles")
    .update({ ...preferences, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(PUBLIC_COLUMNS)
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
