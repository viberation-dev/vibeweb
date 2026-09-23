import type { SupabaseClient } from "@supabase/supabase-js";

import { renderCommentNotification } from "@/lib/emails/comment-notification";
import { sendEmail, type SendResult } from "@/lib/integrations/resend";
import {
  getCommentTargetTitle,
  type CommentTarget,
} from "@/lib/queries/comments";
import { siteUrl } from "@/lib/site-url";
import type { Database } from "@/types/supabase";

type Client = SupabaseClient<Database>;

/**
 * Who gets told about a new comment (VIB-205).
 *
 * Its own variable so it can be pointed at a shared inbox or a forwarding
 * address without a deploy, falling back to the address the rest of the
 * site's mail already replies to.
 */
function notifyAddress(): string | null {
  return (
    process.env.STAFF_NOTIFY_EMAIL ??
    process.env.EMAIL_REPLY_TO ??
    "hello@viberation.dev"
  );
}

export type NotifyOutcome =
  | { status: "skipped"; reason: "staff" | "no_recipient" }
  | { status: "sent"; id: string }
  | { status: "not_configured" }
  | { status: "failed"; detail: string };

/**
 * Emails staff that a comment arrived.
 *
 * Called from `after()` in the server action, so it runs once the commenter
 * already has their response: the person posting should not wait on Resend,
 * and Resend being down should not fail their comment. That is the same
 * arrangement the view counters use.
 *
 * Never throws for the same reason. Every failure is a returned status the
 * caller logs.
 *
 * ponytail: one email per comment. Fine at current volume, and wrong above
 * some volume — there is no rate limit in front of `comments` beyond RLS
 * requiring a session, so a burst is a burst in your inbox. The upgrade is a
 * digest on the existing daily cron (/api/cron/welcome-emails, behind
 * CRON_SECRET), worth doing the first time a burst is annoying.
 */
export async function notifyStaffOfComment(
  client: Client,
  {
    target,
    body,
    isReply,
    commenterName,
    commenterIsStaff,
    returnTo,
  }: {
    target: CommentTarget;
    body: string;
    isReply: boolean;
    commenterName: string;
    commenterIsStaff: boolean;
    /** Site-relative path of the piece, from the form. */
    returnTo: string;
  },
): Promise<NotifyOutcome> {
  /*
   * You replying in a thread should not email you. Checked on the role
   * rather than on the address, so it still holds when the notification
   * address is a shared inbox that is nobody's login.
   */
  if (commenterIsStaff) {
    return { status: "skipped", reason: "staff" };
  }

  const to = notifyAddress();
  if (!to) {
    return { status: "skipped", reason: "no_recipient" };
  }

  const targetTitle = await getCommentTargetTitle(client, target);
  const mail = renderCommentNotification({
    commenterName,
    targetTitle,
    // The query string is stripped: the notification points at the piece,
    // not at whichever step of a walkthrough the commenter happened to be on.
    targetPath: returnTo.split("?")[0],
    body,
    isReply,
    origin: siteUrl,
  });

  const result: SendResult = await sendEmail({
    to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    // No List-Unsubscribe: this is operational mail to the people who run
    // the site, not a subscription. Unsubscribing from it is unsetting the
    // variable.
  });

  return result;
}
