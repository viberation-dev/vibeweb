/*
 * Visitor feedback, as it arrives in the inbox (VIB-237).
 *
 * Pure and alias-free so it runs under plain `node --test`, the same as
 * welcome.ts and comment-notification.ts. Everything about *what* the email
 * says lives here; sending lives in lib/feedback.ts.
 *
 * This one carries text written by the public, which the welcome sequence
 * never does. Every interpolation is escaped, and the tests assert that
 * rather than trusting the reading.
 */

import type { FeedbackKind } from "../validation/feedback.ts";
import { escapeHtml, type RenderedEmail } from "./welcome.ts";

export type FeedbackNotification = {
  kind: FeedbackKind;
  /** Already trimmed and length-checked by the schema. */
  message: string;
  /** The address they gave for a reply, or null. */
  replyTo: string | null;
  /** Their username when they were signed in, read from the session. */
  username: string | null;
  /** Absolute site origin, no trailing slash. */
  origin: string;
};

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/** What each kind is called in the subject line and the eyebrow. */
export const KIND_LABELS: Record<FeedbackKind, string> = {
  improvement: "Improvement",
  feature: "Feature idea",
  broken: "Something's broken",
  other: "Feedback",
};

const PREHEADER_LIMIT = 120;

/** Who it came from, in words rather than a null. */
function fromLabel(username: string | null): string {
  return username?.trim() ? username.trim() : "a visitor";
}

export function feedbackSubject(kind: FeedbackKind, username: string | null): string {
  return `${KIND_LABELS[kind]} from ${fromLabel(username)}`;
}

/** First line of the message, cut to something an inbox preview can show. */
function preheader(message: string): string {
  const flat = message.replace(/\s+/g, " ").trim();
  return flat.length <= PREHEADER_LIMIT
    ? flat
    : `${flat.slice(0, PREHEADER_LIMIT)}…`;
}

export function renderFeedbackEmail(input: FeedbackNotification): RenderedEmail {
  const { kind, message, replyTo, username, origin } = input;
  const subject = feedbackSubject(kind, username);
  const from = fromLabel(username);
  const replyLine = replyTo
    ? `Reply to: ${replyTo}`
    : "No reply address given — they did not ask for one.";

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="color-scheme" content="light only" /><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background-color:#fffff2;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader(message))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fffff2;"><tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
<tr><td align="center" style="padding:0 0 28px 0;"><a href="${origin}" style="text-decoration:none;"><img src="${origin}/brand/logo-email.png" width="172" height="32" alt="VIBERATION" style="display:block;border:0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:800;color:#1a1a18;letter-spacing:1px;" /></a></td></tr>
<tr><td style="background-color:#ffffff;border:1px solid #e3e3d2;border-radius:24px;overflow:hidden;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:6px;background-color:#e4ff1a;font-size:0;line-height:0;">&nbsp;</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:40px;font-family:${FONT};">
<p style="margin:0 0 12px 0;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#011aff;">${escapeHtml(KIND_LABELS[kind])}</p>
<h1 style="margin:0 0 16px 0;font-size:24px;line-height:32px;font-weight:800;letter-spacing:-0.5px;color:#050505;">From ${escapeHtml(from)}</h1>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;"><tr><td style="padding:18px 20px;background-color:#f2f2e4;border-radius:14px;font-size:16px;line-height:26px;color:#1a1a18;white-space:pre-wrap;word-break:break-word;">${escapeHtml(message)}</td></tr></table>
<p style="margin:0;font-size:15px;line-height:24px;color:#5a5a54;">${escapeHtml(replyLine)}</p>
</td></tr></table>
</td></tr>
<tr><td align="center" style="padding:28px 16px 0 16px;font-family:${FONT};font-size:12px;line-height:20px;color:#5a5a54;">
You are getting this because you run Viberation. Nothing about this submission is stored.
</td></tr>
</table></td></tr></table>
</body></html>`;

  const text = [
    KIND_LABELS[kind],
    `From ${from}`,
    "",
    message,
    "",
    replyLine,
  ].join("\n");

  return { subject, html, text };
}
