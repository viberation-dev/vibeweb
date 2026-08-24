import { z } from "zod";

/**
 * Server-side validation for the auth forms.
 *
 * This is the security control — browser validation is UX only and can be
 * bypassed trivially (Bible §34). Every server action parses through these
 * before touching Supabase.
 */

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .email("That does not look like a valid email address.");

/**
 * Supabase enforces a minimum of 6 by default; 8 is a small, free improvement.
 * No composition rules (upper/symbol/digit) on purpose — they push people
 * toward predictable substitutions without buying much real strength.
 */
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Passwords are limited to 72 characters.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/** Providers we actually support. Anything else is rejected before it reaches a redirect. */
export const oauthProviderSchema = z.enum(["github", "google"]);

export type OAuthProviderInput = z.infer<typeof oauthProviderSchema>;

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

/**
 * Only allow relative, single-slash paths as post-login redirects. Anything
 * absolute or protocol-relative ("//evil.com") would let a crafted link bounce
 * a freshly signed-in user off-site.
 */
export function safeRedirect(value: string | null | undefined, fallback = "/"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
