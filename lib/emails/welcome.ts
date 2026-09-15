/*
 * Welcome sequence content (VIB-155).
 *
 * Pure and alias-free so it runs under plain `node --test`. Everything about
 * *what* each email says lives here; sending and scheduling live in the routes
 * and the database. Email HTML follows supabase/templates/confirmation.html:
 * tables, inline styles, no web fonts, no SVG.
 */

import type { RoleLevel } from "../role-level.ts";
import type { ToolCategory } from "../tool-categories.ts";

export type WelcomeStep = 1 | 2 | 3 | 4;

export type WelcomeTool = { name: string; slug: string; tagline: string | null };

export type WelcomeInput = {
  step: WelcomeStep;
  name: string | null;
  level: RoleLevel;
  /** Onboarding "what will you create" values. */
  creating: string[];
  /** Absolute site origin, no trailing slash. */
  origin: string;
  unsubscribeUrl: string;
  /** Step 1: the flagship walkthrough, when one is published. */
  walkthrough?: { title: string; slug: string };
  /** Step 2: tools to suggest. */
  tools?: WelcomeTool[];
};

export type RenderedEmail = { subject: string; html: string; text: string };

/**
 * The directory category that fits someone's stated goals, or undefined when
 * nothing they picked maps to one ("take inspiration", "not decided yet").
 * First match wins, in the order they are listed here.
 */
export function creatingCategory(creating: string[]): ToolCategory | undefined {
  const map: Record<string, ToolCategory> = {
    landing_page: "app_builders",
    website: "app_builders",
    ecommerce: "app_builders",
    web_app: "app_builders",
    workflow: "agents",
  };
  for (const value of creating) {
    if (map[value]) return map[value];
  }
  return undefined;
}

/** Display names are user input and end up inside HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function firstName(name: string | null): string | null {
  const trimmed = name?.trim();
  return trimmed ? trimmed.split(/\s+/)[0].slice(0, 40) : null;
}

type Content = {
  subject: string;
  preheader: string;
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  list?: { label: string; href: string; note?: string }[];
  cta: { label: string; href: string };
  footnote?: string;
};

function content(input: WelcomeInput): Content {
  const { origin, level } = input;
  const first = firstName(input.name);

  switch (input.step) {
    case 1: {
      const walkthrough = input.walkthrough;
      const intro = {
        beginner:
          "Viberation helps you find the right AI tools and build something real, even if you have never written code.",
        intermediate:
          "You have shipped a few things already, so we keep the basics out of your way and lead with tools worth your time.",
        expert:
          "You know your way around, so we keep it sharp: the directory, honest key facts, and nothing aimed at beginners.",
      }[level];
      return {
        subject: "Welcome to Viberation",
        preheader: "Here is the best place to start.",
        eyebrow: "Welcome",
        heading: first ? `Welcome, ${first}` : "Welcome to Viberation",
        paragraphs: walkthrough
          ? [intro, `A good first step: <strong>${escapeHtml(walkthrough.title)}</strong>. ${WALKTHROUGH_PITCH[level]}`]
          : [intro],
        cta: walkthrough
          ? { label: "Start the walkthrough", href: `${origin}/walkthroughs/${walkthrough.slug}` }
          : { label: "Browse the tools", href: `${origin}/tools` },
      };
    }
    case 2: {
      const category = creatingCategory(input.creating);
      const tools = input.tools ?? [];
      return {
        subject: "Tools picked for what you are building",
        preheader: "A short list to try this week.",
        eyebrow: "Picked for you",
        heading: "Tools for what you are building",
        paragraphs: [
          tools.length
            ? "Based on what you told us in setup, these are a good place to start. Each page has the key facts: pricing, what it is best for and how to get going."
            : "The directory is sorted by what people actually use. Each tool has the key facts: pricing, what it is best for and how to get going.",
        ],
        list: tools.map((tool) => ({
          label: tool.name,
          href: `${origin}/tools/${tool.slug}`,
          note: tool.tagline ?? undefined,
        })),
        cta: {
          label: "See more like these",
          href: category ? `${origin}/tools?category=${category}` : `${origin}/tools`,
        },
      };
    }
    case 3:
      return {
        subject: "Keep the tools you like in one place",
        preheader: "Save tools as you go and come back to them.",
        eyebrow: "Tip",
        heading: "Save as you go",
        paragraphs: [
          "Found something worth trying? Press the bookmark on any tool and it waits for you under your account, so you never have to hunt for it again.",
          "Collections are hand-picked sets of tools that work well together, a quick way to see a whole setup at once.",
        ],
        list: [
          { label: "Your bookmarks", href: `${origin}/account/bookmarks` },
        ],
        cta: { label: "Browse collections", href: `${origin}/collections` },
      };
    case 4:
      return {
        subject: "What are you building?",
        preheader: "Hit reply and tell us.",
        eyebrow: "Checking in",
        heading: first ? `How is it going, ${first}?` : "How is it going?",
        paragraphs: [
          "You joined Viberation a little while ago, and we would love to know what you are working on.",
          "Is there a tool you expected to find and did not? Something confusing? Just reply to this email. It comes straight to us and we read every one.",
        ],
        cta: { label: "Open Viberation", href: origin },
        footnote: "The Viberation team",
      };
  }
}

/** Own copy rather than lib/onboarding's framing: emails keep to the marketing style (no dashes). */
const WALKTHROUGH_PITCH: Record<RoleLevel, string> = {
  beginner: "It ends with a real link you can send to someone.",
  intermediate: "A quick pass end to end, handy for the deployment half.",
  expert: "Skim it for the stack choices. The checklist at the end is worth keeping.",
};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function html(c: Content, input: WelcomeInput): string {
  const { origin, unsubscribeUrl } = input;
  const paragraphs = c.paragraphs
    .map((p) => `<p style="margin:0 0 16px 0;font-size:16px;line-height:26px;color:#5a5a54;">${p}</p>`)
    .join("");
  const list = c.list?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px 0;">${c.list
        .map(
          (item) =>
            `<tr><td style="padding:14px 18px;background-color:#f2f2e4;border-radius:14px;"><a href="${escapeHtml(item.href)}" style="font-size:16px;font-weight:700;color:#011aff;text-decoration:none;">${escapeHtml(item.label)} &#8599;</a>${
              item.note ? `<div style="margin-top:4px;font-size:14px;line-height:20px;color:#5a5a54;">${escapeHtml(item.note)}</div>` : ""
            }</td></tr><tr><td style="height:8px;font-size:0;line-height:0;">&nbsp;</td></tr>`,
        )
        .join("")}</table>`
    : "";

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="color-scheme" content="light only" /><title>${escapeHtml(c.subject)}</title></head>
<body style="margin:0;padding:0;background-color:#fffff2;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(c.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fffff2;"><tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
<tr><td align="center" style="padding:0 0 28px 0;"><a href="${origin}" style="text-decoration:none;"><img src="${origin}/brand/logo-email.png" width="172" height="32" alt="VIBERATION" style="display:block;border:0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:800;color:#1a1a18;letter-spacing:1px;" /></a></td></tr>
<tr><td style="background-color:#ffffff;border:1px solid #e3e3d2;border-radius:24px;overflow:hidden;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:6px;background-color:#e4ff1a;font-size:0;line-height:0;">&nbsp;</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:40px;font-family:${FONT};">
<p style="margin:0 0 12px 0;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#011aff;">${escapeHtml(c.eyebrow)}</p>
<h1 style="margin:0 0 16px 0;font-size:30px;line-height:36px;font-weight:800;letter-spacing:-0.5px;color:#050505;">${escapeHtml(c.heading)}</h1>
${paragraphs}${list}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;"><tr><td align="center" bgcolor="#011aff" style="border-radius:999px;"><a href="${escapeHtml(c.cta.href)}" target="_blank" style="display:inline-block;padding:16px 32px;font-family:${FONT};font-size:16px;font-weight:700;line-height:20px;color:#ffffff;text-decoration:none;border-radius:999px;">${escapeHtml(c.cta.label)}&nbsp;&nbsp;&#8599;</a></td></tr></table>
${c.footnote ? `<p style="margin:28px 0 0 0;font-size:15px;line-height:24px;color:#1a1a18;">${escapeHtml(c.footnote)}</p>` : ""}
</td></tr></table>
</td></tr>
<tr><td align="center" style="padding:28px 16px 0 16px;font-family:${FONT};font-size:12px;line-height:20px;color:#5a5a54;">
You are getting this because you joined Viberation.<br />
<a href="${escapeHtml(unsubscribeUrl)}" style="color:#5a5a54;text-decoration:underline;">Unsubscribe from these emails</a>
&nbsp;&middot;&nbsp;<a href="${origin}/privacy" style="color:#5a5a54;text-decoration:underline;">Privacy</a>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

function text(c: Content, input: WelcomeInput): string {
  const strip = (s: string) =>
    s
      .replace(/<[^>]+>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&");
  return [
    c.heading,
    "",
    ...c.paragraphs.map(strip).flatMap((p) => [p, ""]),
    ...(c.list ?? []).flatMap((item) => [`${item.label}${item.note ? `: ${item.note}` : ""}`, item.href, ""]),
    `${c.cta.label}: ${c.cta.href}`,
    ...(c.footnote ? ["", c.footnote] : []),
    "",
    "--",
    `Unsubscribe: ${input.unsubscribeUrl}`,
  ].join("\n");
}

export function renderWelcomeEmail(input: WelcomeInput): RenderedEmail {
  const c = content(input);
  return { subject: c.subject, html: html(c, input), text: text(c, input) };
}

export function unsubscribeUrl(origin: string, userId: string, signature: string): string {
  const params = new URLSearchParams({ u: userId, s: signature });
  return `${origin}/email/unsubscribe?${params}`;
}
