import { renderFeedbackEmail } from "@/lib/emails/feedback";
import { sendEmail } from "@/lib/integrations/resend";
import type { FeedbackInput } from "@/lib/validation/feedback";

/**
 * Sends one feedback submission to staff (VIB-237).
 *
 * Nothing is written to the database — not here and not anywhere in this
 * feature. That is the point: `app/(site)/actions.ts` notes that the only
 * public write path in the app writes nothing to our own tables, so the worst
 * a flood can do is waste Resend calls rather than fill one. This keeps that
 * true for a second public form.
 *
 * ponytail: no rate limit, because the app has none anywhere. A flood costs
 * Resend quota and an annoying inbox day, not data. The upgrade is a Vercel
 * Firewall rate-limit rule on /feedback — configuration rather than code —
 * or Turnstile if it ever gets worse than that.
 */

/** The same chain comment notifications use, so staff mail is one variable. */
function notifyAddress(): string {
  return (
    process.env.STAFF_NOTIFY_EMAIL ??
    process.env.EMAIL_REPLY_TO ??
    "hello@viberation.dev"
  );
}

export type FeedbackOutcome =
  | { status: "sent"; id: string }
  /** No API key. Previews and local dev land here. */
  | { status: "not_configured" }
  | { status: "failed"; detail: string };

/**
 * Never throws. A visitor pressing Send must not meet a stack trace, and the
 * action turns each of these into a sentence they can act on.
 */
export async function sendFeedback(
  input: FeedbackInput & { username: string | null },
  origin: string,
): Promise<FeedbackOutcome> {
  const mail = renderFeedbackEmail({
    kind: input.kind,
    message: input.message,
    replyTo: input.email,
    username: input.username,
    origin,
  });

  return sendEmail({
    to: notifyAddress(),
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    /*
     * Their address, so replying from the inbox reaches the person rather
     * than the site's own mailbox. Null when they did not give one, and the
     * adapter then falls back to the site default. Safe to put in a header
     * only because the schema rejected anything with a newline in it.
     */
    ...(input.email ? { replyTo: input.email } : {}),
    // No List-Unsubscribe: operational mail to the people who run the site.
  });
}
