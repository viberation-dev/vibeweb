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
