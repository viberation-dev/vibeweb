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

/**
 * Sends the recovery email. Supabase returns success whether or not the
 * address has an account, which is what lets the caller give one answer to
 * everyone — see forgotPasswordAction.
 */
export async function resetPasswordForEmail(
  client: Client,
  email: string,
  redirectTo: string,
): Promise<AuthResult> {
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
  return error ? { ok: false, message: toMessage(error.message) } : { ok: true };
}

/** Sets a new password for whoever the current session belongs to. */
export async function updatePassword(client: Client, password: string): Promise<AuthResult> {
  const { error } = await client.auth.updateUser({ password });
  return error ? { ok: false, message: toMessage(error.message) } : { ok: true };
}

/**
 * Ends every session except this one.
 *
 * Called after a password reset because the usual reason for resetting is that
 * someone else may have had the old password. Leaving their sessions alive
 * would make the reset cosmetic.
 */
export async function signOutOtherSessions(client: Client): Promise<AuthResult> {
  const { error } = await client.auth.signOut({ scope: "others" });
  return error ? { ok: false, message: error.message } : { ok: true };
}

/** OAuth providers wired up for MVP. Adding one is a change here plus Supabase config. */
export type OAuthProvider = "github" | "google";

export type OAuthRedirect = { ok: true; url: string } | { ok: false; message: string };

/**
 * Begins the OAuth handshake and hands back the provider URL to redirect to.
 *
 * skipBrowserRedirect is set because this runs in a Server Action — there is
 * no browser here to redirect itself. We take the URL and issue the redirect
 * from the server instead.
 */
export async function signInWithOAuth(
  client: Client,
  provider: OAuthProvider,
  redirectTo: string,
): Promise<OAuthRedirect> {
  const { data, error } = await client.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (error) {
    return { ok: false, message: toMessage(error.message) };
  }
  if (!data.url) {
    return { ok: false, message: "The provider did not return a sign-in URL." };
  }
  return { ok: true, url: data.url };
}

/** Exchanges the ?code= from the OAuth callback for a session cookie. */
export async function exchangeCodeForSession(
  client: Client,
  code: string,
): Promise<AuthResult> {
  const { error } = await client.auth.exchangeCodeForSession(code);
  return error ? { ok: false, message: toMessage(error.message) } : { ok: true };
}
