/**
 * Whether the homepage shows the newsletter form (VIB-91).
 *
 * Ali's call: build and test it, but keep it off the live homepage until the
 * list is actually ready to send to. Collecting addresses you cannot yet
 * email is a promise you are not keeping.
 *
 * So: **off in production unless switched on, on in Vercel previews.** The
 * preview is where the form gets reviewed, and a subscribe from there fails
 * loudly rather than quietly (preview has no Resend key, so the action says
 * so) — no stray addresses land in the real audience.
 *
 * To go live: set NEWSLETTER_SIGNUP=on in Vercel's production environment.
 * NEWSLETTER_SIGNUP=off hides it everywhere, previews included.
 *
 * Pure and alias-free so it runs under plain `node --test`; the env is a
 * parameter for the same reason.
 */
export function newsletterFormEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (env.NEWSLETTER_SIGNUP === "on") return true;
  if (env.NEWSLETTER_SIGNUP === "off") return false;
  return env.VERCEL_ENV === "preview";
}
