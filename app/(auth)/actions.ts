"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  signInWithPassword,
  signOut as adapterSignOut,
  signUpWithPassword,
} from "@/lib/integrations/supabase/auth";
import { createClient } from "@/lib/integrations/supabase/server";
import { safeRedirect, signInSchema, signUpSchema } from "@/lib/validation/auth";

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

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await adapterSignOut(supabase);
  revalidatePath("/", "layout");
  redirect("/");
}
