/*
 * The honeypot decision, and the one sentence both a person and a bot see
 * (VIB-237).
 *
 * Its own module, alias-free, so the rule can be tested: the action around it
 * reads a session and cannot be unit tested here, but this is the part where
 * a mistake leaks something.
 */

/**
 * What a successful submission says. One constant, used for a real send and
 * for a dropped bot submission alike — a bot that gets a different answer
 * learns which field gave it away.
 */
export const SUBMITTED_NOTICE = "Thanks — that's gone through. We read every one.";

/** A person never sees the honeypot field, so anything in it came from a script. */
export function isBotSubmission(honeypot: FormDataEntryValue | null): boolean {
  return typeof honeypot === "string" ? honeypot.length > 0 : honeypot !== null;
}

/**
 * The submitter's username, or null, and never a thrown error.
 *
 * The profile lookup throws on any Supabase error (`getProfile` in
 * lib/queries/profiles.ts does not swallow one), and an uncaught throw out of
 * a server action renders the visitor neither a notice nor an error — their
 * feedback is gone and they have nothing to retry from.
 *
 * The username is decorative: it changes who the email says it is from and
 * nothing else. So a failed lookup degrades to "a visitor" rather than taking
 * the submission down with it. Takes the lookup as a function so the failure
 * is testable without a session.
 */
export async function usernameOrNull(
  lookup: () => Promise<{ username: string | null } | null>,
): Promise<string | null> {
  try {
    return (await lookup())?.username ?? null;
  } catch (error) {
    console.error("feedback: profile lookup failed", error);
    return null;
  }
}
