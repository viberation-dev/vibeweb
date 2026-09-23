/*
 * Staff notification for a new comment (VIB-205).
 *
 * Pure and alias-free so it runs under plain `node --test`. Everything about
 * *what* the email says lives here; sending lives in the server action.
 * Email HTML follows welcome.ts: tables, inline styles, no web fonts, no SVG.
 *
 * This one carries text written by the public, which the welcome sequence
 * never does. Every interpolation is escaped, and the tests assert that
 * rather than trusting the reading.
 */

import { escapeHtml, type RenderedEmail } from "./welcome.ts";

export type CommentNotification = {
  /** Display name of whoever wrote it. Never their email. */
  commenterName: string;
  /** The piece it is on. Null when the row could not be read. */
  targetTitle: string | null;
  /** Site-relative path of that piece, e.g. "/learn/playwright-mcp-guide". */
  targetPath: string;
  body: string;
  /** Whether it is a reply to another comment rather than a new thread. */
  isReply: boolean;
  /** Absolute site origin, no trailing slash. */
  origin: string;
};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/**
 * How much of the comment goes in the mail.
 *
 * Enough to judge whether it needs attention, not the whole thing: the point
 * of the mail is to get you to the thread, and a 4000-character comment
 * pasted into an inbox is a worse version of the page it is quoting.
 */
const EXCERPT_LIMIT = 600;

export function excerpt(body: string, limit = EXCERPT_LIMIT): string {
  const collapsed = body.trim();
  if (collapsed.length <= limit) return collapsed;
  // Cut on a word boundary where there is one nearby, so the excerpt does not
  // end mid-word for the sake of four characters.
  const cut = collapsed.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > limit - 80 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** Subject line: who, and what they commented on. */
function subjectFor(input: CommentNotification): string {
  const what = input.targetTitle ?? input.targetPath;
  return `${input.isReply ? "New reply" : "New comment"} from ${input.commenterName} on ${what}`;
}

export function renderCommentNotification(input: CommentNotification): RenderedEmail {
  const { origin, targetPath, commenterName, isReply } = input;
  const title = input.targetTitle ?? targetPath;
  const subject = subjectFor(input);
  const text_ = excerpt(input.body);

  const threadUrl = `${origin}${targetPath}#comments`;
  const moderateUrl = `${origin}/admin/comments`;

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="color-scheme" content="light only" /><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background-color:#fffff2;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(excerpt(input.body, 120))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fffff2;"><tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
<tr><td align="center" style="padding:0 0 28px 0;"><a href="${origin}" style="text-decoration:none;"><img src="${origin}/brand/logo-email.png" width="172" height="32" alt="VIBERATION" style="display:block;border:0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:800;color:#1a1a18;letter-spacing:1px;" /></a></td></tr>
<tr><td style="background-color:#ffffff;border:1px solid #e3e3d2;border-radius:24px;overflow:hidden;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:6px;background-color:#e4ff1a;font-size:0;line-height:0;">&nbsp;</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:40px;font-family:${FONT};">
<p style="margin:0 0 12px 0;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#011aff;">${isReply ? "New reply" : "New comment"}</p>
<h1 style="margin:0 0 16px 0;font-size:24px;line-height:32px;font-weight:800;letter-spacing:-0.5px;color:#050505;">${escapeHtml(title)}</h1>
<p style="margin:0 0 16px 0;font-size:15px;line-height:24px;color:#5a5a54;"><strong style="color:#1a1a18;">${escapeHtml(commenterName)}</strong> wrote:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;"><tr><td style="padding:18px 20px;background-color:#f2f2e4;border-radius:14px;font-size:16px;line-height:26px;color:#1a1a18;white-space:pre-wrap;">${escapeHtml(text_)}</td></tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;"><tr><td align="center" bgcolor="#011aff" style="border-radius:999px;"><a href="${escapeHtml(threadUrl)}" target="_blank" style="display:inline-block;padding:16px 32px;font-family:${FONT};font-size:16px;font-weight:700;line-height:20px;color:#ffffff;text-decoration:none;border-radius:999px;">Read it in context&nbsp;&nbsp;&#8599;</a></td></tr></table>
<p style="margin:24px 0 0 0;font-size:15px;line-height:24px;color:#5a5a54;"><a href="${escapeHtml(moderateUrl)}" style="color:#011aff;text-decoration:underline;">Hide it</a> if it does not belong.</p>
</td></tr></table>
</td></tr>
<tr><td align="center" style="padding:28px 16px 0 16px;font-family:${FONT};font-size:12px;line-height:20px;color:#5a5a54;">
You are getting this because you moderate Viberation.
</td></tr>
</table></td></tr></table>
</body></html>`;

  const text = [
    isReply ? "New reply" : "New comment",
    title,
    "",
    `${commenterName} wrote:`,
    "",
    text_,
    "",
    `Read it in context: ${threadUrl}`,
    `Moderate: ${moderateUrl}`,
  ].join("\n");

  return { subject, html, text };
}
