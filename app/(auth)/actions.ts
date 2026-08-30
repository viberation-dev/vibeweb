"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  resetPasswordForEmail,
  signInWithOAuth,
  signInWithPassword,
  signOut as adapterSignOut,
  signOutOtherSessions,
  signUpWithPassword,
  updatePassword,
} from "@/lib/integrations/supabase/auth";
import { createClient } from "@/lib/integrations/supabase/server";
import {
  forgotPasswordSchema,
  oauthProviderSchema,
  resetPasswordSchema,
  safeRedirect,
  signInSchema,
  signUpSchema,
} from "@/lib/validation/auth";

export type AuthFormState = { error?: string; notice?: string };

/** Absolute origin of this deployment, for email confirmation links. */
async function currentOrigin(): Promise<string> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;

  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function signInAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const result = await signInWithPassword(supabase, parsed.data.email, parsed.data.password);

  if (!result.ok) {
    return { error: result.message };
  }

  revalidatePath("/", "layout");
  redirect(safeRedirect(formData.get("redirectTo")?.toString()));
}

export async function signUpAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const origin = await currentOrigin();
  const result = await signUpWithPassword(
    supabase,
    parsed.data.email,
    parsed.data.password,
    `${origin}/auth/confirm`,
  );

  if (!result.ok) {
    return { error: result.message };
  }

  /*
   * Deliberately the same message whether or not the address was already
   * registered. Saying "that email is taken" would turn this form into an
   * account-existence oracle.
   */
  return {
    notice: "Check your inbox — we have sent you a link to confirm your email address.",
  };
}

export async function forgotPasswordAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const origin = await currentOrigin();

  /*
   * The recovery link lands on /auth/confirm, which exchanges the token for a
   * session and then forwards to /reset-password. That second hop is written
   * into the Supabase "Reset password" template as `next=/reset-password`,
   * not passed from here — changing it means changing the template.
   */
  const result = await resetPasswordForEmail(
    supabase,
    parsed.data.email,
    `${origin}/auth/confirm`,
  );

  if (!result.ok) {
    return { error: result.message };
  }

  /*
   * Same answer whether or not that address has an account, matching signup.
   * A form that says "no account with that email" is an account-existence
   * oracle, and this one would be readable by anyone.
   */
  return {
    notice: "If that address has an account, we have sent it a link to reset the password.",
  };
}

export async function resetPasswordAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const result = await updatePassword(supabase, parsed.data.password);

  if (!result.ok) {
    return { error: result.message };
  }

  // Best effort: the password is already changed, so a failure here should not
  // present as a failed reset. It only means older sessions outlive it.
  await signOutOtherSessions(supabase);

  revalidatePath("/", "layout");
  redirect("/login?notice=password-updated");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await adapterSignOut(supabase);
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Starts an OAuth sign-in. The provider arrives from the submit button's
 * value, so it is validated rather than trusted — this ends up in a redirect,
 * and an unvalidated value has no business steering that.
 */
export async function signInWithProviderAction(formData: FormData): Promise<void> {
  const parsed = oauthProviderSchema.safeParse(formData.get("provider"));

  if (!parsed.success) {
    redirect("/login?error=unknown-provider");
  }

  const next = safeRedirect(formData.get("redirectTo")?.toString());
  const origin = await currentOrigin();
  const supabase = await createClient();

  const result = await signInWithOAuth(
    supabase,
    parsed.data,
    `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
  );

  if (!result.ok) {
    redirect("/login?error=oauth-failed");
  }

  redirect(result.url);
}
