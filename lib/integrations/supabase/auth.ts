import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

type Client = SupabaseClient<Database>;

/**
 * Auth adapter. Everything auth-related goes through this module so swapping
 * provider later touches one file rather than every call site (Bible §34).
 */

export type AuthResult = { ok: true } | { ok: false; message: string };

/**
 * Supabase's own error strings are reasonable for sign-in but leak account
 * existence on some paths. Mapping the common ones keeps the wording ours.
 */
function toMessage(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return "That email and password combination did not match an account.";
  }
  if (/email not confirmed/i.test(message)) {
    return "Check your inbox and confirm your email address before signing in.";
  }
  return message;
}

export async function signInWithPassword(
  client: Client,
  email: string,
  password: string,
): Promise<AuthResult> {
  const { error } = await client.auth.signInWithPassword({ email, password });
  return error ? { ok: false, message: toMessage(error.message) } : { ok: true };
}

export async function signUpWithPassword(
  client: Client,
  email: string,
  password: string,
  emailRedirectTo: string,
): Promise<AuthResult> {
  const { error } = await client.auth.signUp({
    email,
    password,
    options: { emailRedirectTo },
  });
  return error ? { ok: false, message: toMessage(error.message) } : { ok: true };
}

export async function signOut(client: Client): Promise<AuthResult> {
  const { error } = await client.auth.signOut();
  return error ? { ok: false, message: error.message } : { ok: true };
}
