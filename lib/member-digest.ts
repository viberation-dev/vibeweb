import type { SupabaseClient } from "@supabase/supabase-js";

import { renderMemberDigest } from "@/lib/emails/member-digest";
import { sendEmail } from "@/lib/integrations/resend";
import { listNewMembersForDigest } from "@/lib/queries/member-digest";
import type { Database } from "@/types/supabase";

type Client = SupabaseClient<Database>;

/**
 * Daily digest of who joined (VIB-236).
 *
 * New comments are told to staff one at a time and immediately (VIB-205),
 * because a comment may need hiding. A signup needs nothing done about it,
 * so it goes in one mail a day.
 */

/**
 * Who gets it. The same chain comment notifications use, so pointing staff
 * mail at a different inbox is one variable rather than two.
 */
function notifyAddress(): string | null {
  return (
    process.env.STAFF_NOTIFY_EMAIL ??
    process.env.EMAIL_REPLY_TO ??
    "hello@viberation.dev"
  );
}

export type DigestOutcome =
  | { status: "sent"; id: string; members: number }
  /** Nobody joined. No mail: a daily "nothing happened" trains you to ignore it. */
  | { status: "skipped"; reason: "no_members" | "no_recipient" }
  | { status: "not_configured" }
  | { status: "failed"; detail: string };

/**
 * Builds and sends the digest.
 *
 * A send that fails comes back as a status rather than an exception, because
 * Resend being down is not worth a failed cron run — the query advances no
 * state, so tomorrow's run is not corrupted by today's bounce.
 *
 * A database refusal is left to throw, which the route turns into a 500 and
 * Vercel shows as a failed run. That is the wanted behaviour: the only way
 * the RPC refuses is a secret that no longer matches `private.app_secrets`,
 * and swallowing that would turn a misconfiguration into a digest that
 * silently never arrives again.
 */
export async function sendMemberDigest(
  client: Client,
  secret: string,
  origin: string,
): Promise<DigestOutcome> {
  const to = notifyAddress();
  if (!to) {
    return { status: "skipped", reason: "no_recipient" };
  }

  const members = await listNewMembersForDigest(client, secret);
  if (members.length === 0) {
    return { status: "skipped", reason: "no_members" };
  }

  const mail = renderMemberDigest({
    origin,
    members: members.map((member) => ({
      username: member.username,
      email: member.email,
      roleLevel: member.role_level,
      joinedAt: member.created_at,
    })),
  });

  const result = await sendEmail({
    to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    // No List-Unsubscribe: operational mail to the people who run the site,
    // not a subscription. Unsubscribing is unsetting the variable.
  });

  if (result.status === "sent") {
    return { status: "sent", id: result.id, members: members.length };
  }
  return result;
}
