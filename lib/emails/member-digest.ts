/*
 * Daily digest of new members (VIB-236).
 *
 * Pure and alias-free so it runs under plain `node --test`, the same as
 * welcome.ts and comment-notification.ts. Everything about *what* the email
 * says lives here; sending lives in lib/member-digest.ts.
 *
 * Email HTML follows the other two: tables, inline styles, no web fonts, no
 * SVG. Usernames are written by members, so every interpolation is escaped
 * and the tests assert that rather than trusting the reading.
 */

import { escapeHtml, type RenderedEmail } from "./welcome.ts";

export type DigestMember = {
  /** Null until they pick one. */
  username: string | null;
  /** Null on a profile row written before the address was captured. */
  email: string | null;
  roleLevel: "beginner" | "intermediate" | "expert" | null;
  /** ISO timestamp. */
  joinedAt: string;
};

export type MemberDigest = {
  members: DigestMember[];
  /** Absolute site origin, no trailing slash. */
  origin: string;
};

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/**
 * How many get listed by name before the mail just gives the number.
 *
 * The digest exists to be read at a glance. Two hundred rows in an inbox is
 * a worse version of the admin screen it should be sending you to.
 */
const LIST_LIMIT = 25;

const time = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

/**
 * What to call someone who has not set a username.
 *
 * Their email, because a line reading "(no username)" three times over tells
 * you nothing about who joined. This mail goes to staff only — the same
 * place the admin screens already show addresses.
 */
export function memberLabel(member: DigestMember): string {
  return member.username?.trim() || member.email?.trim() || "Unnamed member";
}

export function digestSubject(count: number): string {
  return count === 1 ? "1 new member joined" : `${count} new members joined`;
}

/**
 * Renders the digest. Callers skip sending when `members` is empty — see
 * lib/member-digest.ts — so this assumes at least one.
 */
export function renderMemberDigest(input: MemberDigest): RenderedEmail {
  const { members, origin } = input;
  const subject = digestSubject(members.length);
  const listed = members.slice(0, LIST_LIMIT);
  const remainder = members.length - listed.length;
  const membersUrl = `${origin}/admin`;

  const rows = listed
    .map((member) => {
      const label = escapeHtml(memberLabel(member));
      const meta = [
        member.roleLevel ? escapeHtml(member.roleLevel) : null,
        `joined ${escapeHtml(time.format(new Date(member.joinedAt)))} UTC`,
      ]
        .filter(Boolean)
        .join(" · ");
      return `<tr><td style="padding:12px 0;border-bottom:1px solid #e3e3d2;font-family:${FONT};"><span style="font-size:16px;line-height:24px;font-weight:700;color:#1a1a18;">${label}</span><br /><span style="font-size:13px;line-height:20px;color:#5a5a54;">${meta}</span></td></tr>`;
    })
    .join("");

  const more = remainder
    ? `<p style="margin:16px 0 0 0;font-size:15px;line-height:24px;color:#5a5a54;">and ${remainder} more.</p>`
    : "";

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="color-scheme" content="light only" /><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background-color:#fffff2;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(listed.map(memberLabel).join(", "))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fffff2;"><tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
<tr><td align="center" style="padding:0 0 28px 0;"><a href="${origin}" style="text-decoration:none;"><img src="${origin}/brand/logo-email.png" width="172" height="32" alt="VIBERATION" style="display:block;border:0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:800;color:#1a1a18;letter-spacing:1px;" /></a></td></tr>
<tr><td style="background-color:#ffffff;border:1px solid #e3e3d2;border-radius:24px;overflow:hidden;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:6px;background-color:#e4ff1a;font-size:0;line-height:0;">&nbsp;</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:40px;font-family:${FONT};">
<p style="margin:0 0 12px 0;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#011aff;">Yesterday</p>
<h1 style="margin:0 0 24px 0;font-size:24px;line-height:32px;font-weight:800;letter-spacing:-0.5px;color:#050505;">${escapeHtml(subject)}</h1>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
${more}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;"><tr><td align="center" bgcolor="#011aff" style="border-radius:999px;"><a href="${escapeHtml(membersUrl)}" target="_blank" style="display:inline-block;padding:16px 32px;font-family:${FONT};font-size:16px;font-weight:700;line-height:20px;color:#ffffff;text-decoration:none;border-radius:999px;">Open the admin&nbsp;&nbsp;&#8599;</a></td></tr></table>
</td></tr></table>
</td></tr>
<tr><td align="center" style="padding:28px 16px 0 16px;font-family:${FONT};font-size:12px;line-height:20px;color:#5a5a54;">
You are getting this because you run Viberation. Nothing is sent on a day nobody joins.
</td></tr>
</table></td></tr></table>
</body></html>`;

  const text = [
    subject,
    "",
    ...listed.map((member) => {
      const meta = [
        member.roleLevel,
        `joined ${time.format(new Date(member.joinedAt))} UTC`,
      ]
        .filter(Boolean)
        .join(" · ");
      return `- ${memberLabel(member)} (${meta})`;
    }),
    ...(remainder ? ["", `and ${remainder} more.`] : []),
    "",
    `Open the admin: ${membersUrl}`,
  ].join("\n");

  return { subject, html, text };
}
