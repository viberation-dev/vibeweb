# Visitor Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `/feedback` page where any visitor can send a suggestion or a bug report, which arrives as email to staff and is never written to the database.

**Architecture:** Public form → server action → pure renderer → Resend. The action honeypots, validates with zod server-side, attaches the signed-in username from the session when there is one, and awaits the send so the visitor is told the truth about whether it left. Nothing touches Postgres, which preserves the property the newsletter form was built around.

**Tech Stack:** Next.js App Router server actions, zod, the existing `lib/integrations/resend.ts` adapter, Tabler icons, `node --test` with `--experimental-strip-types`.

**Spec:** [docs/superpowers/specs/2026-10-04-visitor-feedback-design.md](../specs/2026-10-04-visitor-feedback-design.md)

**Linear:** VIB-237. Branch: `cre8ivevisionltd/vib-237-visitor-feedback-form-at-feedback`

## Global Constraints

- Every commit and PR title carries `[VIB-237]`.
- Server-side validation is the security control; browser `required` is UX only.
- `lib/emails/*.ts` and `lib/validation/*.ts` must be alias-free and import with explicit `.ts` extensions — they run under plain `node --test`, which does not resolve the `@/` alias. This is the single most common way a change here fails CI.
- Email HTML: tables, inline styles, no web fonts, no SVG. Light only.
- Icons come from `@tabler/icons-react`, never Lucide.
- `components/ui/` is not touched by this work.
- No new dependency. No migration. No `supabase.from(...)` anywhere in this feature.
- Recipient chain is exactly `STAFF_NOTIFY_EMAIL ?? EMAIL_REPLY_TO ?? "hello@viberation.dev"`.
- Message length bounds: 10 minimum, 4000 maximum, measured after trimming.

## Review Focus

Five things the spec implies and no obvious happy-path test would catch. Each has a test pinned to the task that owns the code.

1. **A whitespace-only message.** Ten spaces satisfies `min(10)` unless the trim happens first. A person expects "say something" and not a blank email. → Task 1.
2. **Email header injection through the optional address.** That value becomes `reply_to`. A submission of `a@b.com\nBcc: victim@example.com` must be rejected, not forwarded into a mail header. → Task 1.
3. **A `kind` outside the enum.** The select constrains a browser, not a crafted POST. An unknown kind must be a validation failure, not an email with a broken subject line. → Task 1.
4. **Honeypot filled together with invalid input.** The bot must get the same success notice a person gets, with no validation message leaking which field it got wrong. → Task 4.
5. **A long unbroken token in the message.** A 3000-character string with no spaces must not blow out the email's table layout or the preheader. → Task 2.

---

### Task 1: The validation schema

**Files:**
- Create: `lib/validation/feedback.ts`
- Test: `lib/validation/feedback.test.ts`

**Interfaces:**
- Consumes: `emailSchema` from `lib/validation/auth.ts`.
- Produces: `feedbackSchema` (a zod object), `type FeedbackInput`, and `FEEDBACK_KINDS` — a readonly tuple `["improvement", "feature", "broken", "other"]` reused by the form's select and the renderer's subject map.

- [ ] **Step 1: Write the failing test**

Create `lib/validation/feedback.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { FEEDBACK_KINDS, feedbackSchema } from "./feedback.ts";

const valid = {
  kind: "feature",
  message: "A dark mode toggle in the header would help a lot.",
  email: "",
};

test("a whole valid submission parses, with the message trimmed", () => {
  const result = feedbackSchema.safeParse({
    ...valid,
    message: `  ${valid.message}  `,
  });
  assert.ok(result.success);
  assert.equal(result.data.message, valid.message);
});

test("an omitted email is valid and becomes null", () => {
  for (const email of ["", "   ", undefined, null]) {
    const result = feedbackSchema.safeParse({ ...valid, email });
    assert.ok(result.success, `${JSON.stringify(email)} should parse`);
    assert.equal(result.data.email, null);
  }
});

test("an email that is given must be a real one", () => {
  const result = feedbackSchema.safeParse({ ...valid, email: "not-an-address" });
  assert.ok(!result.success);
});

test("an address is trimmed and lowercased, so it is usable as reply_to", () => {
  const result = feedbackSchema.safeParse({ ...valid, email: "  Rafa@Example.COM " });
  assert.ok(result.success);
  assert.equal(result.data.email, "rafa@example.com");
});

/*
 * Review Focus 2. This value ends up in a mail header, so a newline in it is
 * an injection attempt rather than a typo.
 */
test("an address carrying a header injection is rejected", () => {
  for (const email of [
    "a@b.com\nBcc: victim@example.com",
    "a@b.com\r\nBcc: victim@example.com",
    "a@b.com%0ABcc:victim@example.com",
  ]) {
    const result = feedbackSchema.safeParse({ ...valid, email });
    assert.ok(!result.success, `${JSON.stringify(email)} should be rejected`);
  }
});

/* Review Focus 1. Ten spaces is ten characters and says nothing. */
test("a whitespace-only message is rejected, not counted as ten characters", () => {
  const result = feedbackSchema.safeParse({ ...valid, message: "          " });
  assert.ok(!result.success);
});

test("the message has both a floor and a ceiling", () => {
  assert.ok(!feedbackSchema.safeParse({ ...valid, message: "too short" }).success);
  assert.ok(feedbackSchema.safeParse({ ...valid, message: "just enough" }).success);
  assert.ok(
    !feedbackSchema.safeParse({ ...valid, message: "x".repeat(4001) }).success,
  );
  assert.ok(
    feedbackSchema.safeParse({ ...valid, message: "x".repeat(4000) }).success,
  );
});

/* Review Focus 3. The select constrains a browser, not a crafted POST. */
test("a kind nobody offered is rejected", () => {
  for (const kind of ["urgent", "", null, undefined]) {
    const result = feedbackSchema.safeParse({ ...valid, kind });
    assert.ok(!result.success, `${JSON.stringify(kind)} should be rejected`);
  }
});

test("every offered kind parses", () => {
  for (const kind of FEEDBACK_KINDS) {
    assert.ok(feedbackSchema.safeParse({ ...valid, kind }).success, kind);
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --experimental-strip-types --test lib/validation/feedback.test.ts`
Expected: FAIL — `Cannot find module './feedback.ts'`.

- [ ] **Step 3: Write the schema**

Create `lib/validation/feedback.ts`:

```ts
import { z } from "zod";

import { emailSchema } from "./auth.ts";

/**
 * Server-side validation for the visitor feedback form (VIB-237).
 *
 * This is the security control; the browser's `required` and `maxLength` are
 * UX only (§34). Relative import with the extension, like `./announce.ts`,
 * because this module is loaded by a plain `node --test` test which does not
 * resolve the `@/` alias.
 */

/**
 * What kind of feedback it is. Not stored anywhere, so this is a repo
 * constant rather than a Postgres enum — it only has to agree with itself.
 * The form's select and the email's subject line both read it from here.
 */
export const FEEDBACK_KINDS = ["improvement", "feature", "broken", "other"] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 4000;

export const feedbackSchema = z.object({
  kind: z.enum(FEEDBACK_KINDS, {
    message: "Pick what kind of feedback this is.",
  }),

  /*
   * Trimmed before it is measured. Ten spaces is ten characters and says
   * nothing, so a length check on the raw string would accept an empty
   * message and email it.
   */
  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN, "Tell us a little more — a sentence is plenty.")
    .max(MESSAGE_MAX, `Keep it under ${MESSAGE_MAX} characters.`),

  /*
   * Optional, and null when left blank: a submission with no reply address is
   * a normal submission, not a validation failure.
   *
   * When it is given it goes through `emailSchema`, the same answer to "is
   * this an email address" the auth forms use. That matters more here than
   * usual, because this value becomes a `reply_to` header — a newline in it
   * would be a header injection, and the address check is what rejects it.
   */
  email: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => value?.trim() ?? "")
    .transform((value) => value.toLowerCase())
    .pipe(
      z.union([z.literal(""), emailSchema]).transform((value) =>
        value === "" ? null : value,
      ),
    ),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --experimental-strip-types --test lib/validation/feedback.test.ts`
Expected: PASS, 9 tests.

If the injection test fails, the cause is `emailSchema` accepting a trailing newline. Add `.regex(/^\S+$/, "That does not look like a valid email address.")` to the `emailSchema` branch **in this file only** — do not change `lib/validation/auth.ts`, which the auth forms depend on.

- [ ] **Step 5: Commit**

```bash
git add lib/validation/feedback.ts lib/validation/feedback.test.ts
git commit -m "feat(feedback): validate a feedback submission [VIB-237]"
```

---

### Task 2: The email renderer

**Files:**
- Create: `lib/emails/feedback.ts`
- Test: `lib/emails/feedback.test.ts`

**Interfaces:**
- Consumes: `escapeHtml` and `type RenderedEmail` from `lib/emails/welcome.ts`; `FeedbackKind` from `lib/validation/feedback.ts`.
- Produces: `renderFeedbackEmail(input: FeedbackNotification): RenderedEmail`, `feedbackSubject(kind, from)`, `KIND_LABELS: Record<FeedbackKind, string>`, and `type FeedbackNotification = { kind: FeedbackKind; message: string; replyTo: string | null; username: string | null; origin: string }`.

- [ ] **Step 1: Write the failing test**

Create `lib/emails/feedback.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { KIND_LABELS, renderFeedbackEmail, type FeedbackNotification } from "./feedback.ts";

const base: FeedbackNotification = {
  kind: "feature",
  message: "A dark mode toggle in the header would help a lot.",
  replyTo: null,
  username: null,
  origin: "https://viberation.dev",
};

test("the subject names the kind, so an inbox can tell them apart", () => {
  assert.ok(renderFeedbackEmail(base).subject.includes(KIND_LABELS.feature));
  assert.ok(
    renderFeedbackEmail({ ...base, kind: "broken" }).subject.includes(
      KIND_LABELS.broken,
    ),
  );
});

test("a signed-out submission is attributed to a visitor, not to nobody", () => {
  const mail = renderFeedbackEmail(base);
  assert.ok(mail.text.includes("a visitor"));
  assert.ok(!mail.text.includes("null"));
});

test("a signed-in submission carries the username", () => {
  const mail = renderFeedbackEmail({ ...base, username: "rafa" });
  assert.ok(mail.html.includes("rafa"));
  assert.ok(mail.text.includes("rafa"));
});

test("the message appears in both parts", () => {
  const mail = renderFeedbackEmail(base);
  assert.ok(mail.html.includes("dark mode toggle"));
  assert.ok(mail.text.includes("dark mode toggle"));
});

/*
 * The message and the username are written by the public. Asserted rather
 * than trusted to a reading of the template, the same as
 * comment-notification.test.ts.
 */
test("a message carrying markup is escaped, not interpolated", () => {
  const mail = renderFeedbackEmail({
    ...base,
    message: "<script>alert('x')</script> and more text to clear the floor",
  });
  assert.ok(!mail.html.includes("<script>"));
  assert.ok(mail.html.includes("&lt;script&gt;"));
});

test("a username carrying markup is escaped too", () => {
  const mail = renderFeedbackEmail({ ...base, username: "<img src=x onerror=1>" });
  assert.ok(!mail.html.includes("<img src=x"));
  assert.ok(mail.html.includes("&lt;img"));
});

test("a reply address is shown when given, and nothing is claimed when not", () => {
  const withAddress = renderFeedbackEmail({ ...base, replyTo: "rafa@example.com" });
  assert.ok(withAddress.text.includes("rafa@example.com"));
  assert.ok(renderFeedbackEmail(base).text.includes("No reply address"));
});

/* Review Focus 5. A wall with no spaces must not blow out the layout. */
test("a long unbroken token does not escape the layout or the preheader", () => {
  const mail = renderFeedbackEmail({ ...base, message: "x".repeat(3000) });
  assert.ok(
    mail.html.includes("word-break:break-word"),
    "the message cell needs a break rule for unbroken input",
  );
  const preheader = mail.html.split('opacity:0;">')[1].split("</div>")[0];
  assert.ok(preheader.length <= 121, `preheader was ${preheader.length} chars`);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --experimental-strip-types --test lib/emails/feedback.test.ts`
Expected: FAIL — `Cannot find module './feedback.ts'`.

- [ ] **Step 3: Write the renderer**

Create `lib/emails/feedback.ts`:

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --experimental-strip-types --test lib/emails/feedback.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/emails/feedback.ts lib/emails/feedback.test.ts
git commit -m "feat(feedback): render a feedback submission as email [VIB-237]"
```

---

### Task 3: `replyTo` on the Resend adapter, and the sender

**Files:**
- Modify: `lib/integrations/resend.ts` — `OutgoingEmail` and the `sendEmail` body
- Create: `lib/feedback.ts`

**Interfaces:**
- Consumes: `renderFeedbackEmail` (Task 2), `feedbackSchema`'s output type (Task 1), `sendEmail` from the adapter.
- Produces: `sendFeedback(input: { kind, message, email, username }, origin: string): Promise<FeedbackOutcome>` where `FeedbackOutcome = { status: "sent"; id: string } | { status: "not_configured" } | { status: "failed"; detail: string }`.

`sendEmail` currently hardcodes `reply_to` from the environment and has no way to override it. The spec needs the submitter's address there, so the adapter gains one optional field. This is the only change to an existing shared module in this plan.

- [ ] **Step 1: Add the optional field to the adapter**

In `lib/integrations/resend.ts`, add to the `OutgoingEmail` type, directly below `text`:

```ts
  /**
   * Overrides the site's default reply address. Set by mail that is *about* a
   * person who gave their address — feedback (VIB-237) — so replying from the
   * inbox reaches them rather than the site's own mailbox.
   */
  replyTo?: string;
```

Then in the `fetch` body, change:

```ts
        reply_to: process.env.EMAIL_REPLY_TO ?? "hello@viberation.dev",
```

to:

```ts
        reply_to:
          email.replyTo ?? process.env.EMAIL_REPLY_TO ?? "hello@viberation.dev",
```

Nothing else in the file changes, and every existing caller keeps its behaviour because the field is optional.

- [ ] **Step 2: Verify nothing broke**

Run: `npm run typecheck`
Expected: clean. (There is no unit test for the adapter — it is a `fetch` wrapper and the repo mocks no network. Typecheck plus the existing callers compiling is the check that exists.)

- [ ] **Step 3: Write the sender**

Create `lib/feedback.ts`:

```ts
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
```

- [ ] **Step 4: Verify it compiles**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add lib/integrations/resend.ts lib/feedback.ts
git commit -m "feat(feedback): send a submission to staff, with their address as reply-to [VIB-237]"
```

---

### Task 4: The server action

**Files:**
- Create: `app/(site)/feedback/actions.ts`
- Test: `lib/feedback-action.test.ts`

**Interfaces:**
- Consumes: `feedbackSchema` (Task 1), `sendFeedback` (Task 3), `createClient` from `lib/integrations/supabase/server`, `getCurrentProfile` from `lib/queries/profiles`, `siteUrl` from `lib/site-url`.
- Produces: `submitFeedbackAction(previous: FeedbackFormState, formData: FormData): Promise<FeedbackFormState>` and `type FeedbackFormState = { error?: string; notice?: string }`. The form in Task 5 binds to exactly this signature.

The action itself is not unit tested — it is a server action that reads a session, and the repo has no harness for that. What *is* tested is the one piece of its logic that is pure and easy to get wrong: the honeypot decision. It is extracted so it can be.

- [ ] **Step 1: Write the failing test**

Create `lib/feedback-action.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { SUBMITTED_NOTICE, isBotSubmission } from "./feedback-guard.ts";

test("an empty honeypot is a person", () => {
  assert.equal(isBotSubmission(null), false);
  assert.equal(isBotSubmission(""), false);
});

test("anything in the honeypot is a bot, whitespace included", () => {
  assert.equal(isBotSubmission("Acme Ltd"), true);
  assert.equal(isBotSubmission(" "), true);
});

/*
 * Review Focus 4. A bot must get the same sentence a person gets. If the
 * action validated first, an invalid bot submission would come back with a
 * field-specific error and tell a crawler exactly which field to fix.
 */
test("the notice a bot gets is the identical string a person gets", () => {
  assert.ok(SUBMITTED_NOTICE.length > 0);
  assert.ok(!SUBMITTED_NOTICE.toLowerCase().includes("spam"));
  assert.ok(!SUBMITTED_NOTICE.toLowerCase().includes("bot"));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --experimental-strip-types --test lib/feedback-action.test.ts`
Expected: FAIL — `Cannot find module './feedback-guard.ts'`.

- [ ] **Step 3: Write the guard and the action**

Create `lib/feedback-guard.ts`:

```ts
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
```

Create `app/(site)/feedback/actions.ts`:

```ts
"use server";

import { sendFeedback } from "@/lib/feedback";
import { SUBMITTED_NOTICE, isBotSubmission } from "@/lib/feedback-guard";
import { createClient } from "@/lib/integrations/supabase/server";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { siteUrl } from "@/lib/site-url";
import { feedbackSchema } from "@/lib/validation/feedback";

export type FeedbackFormState = { error?: string; notice?: string };

/**
 * Visitor feedback (VIB-237).
 *
 * Public and unauthenticated, the second such write path after the newsletter
 * signup, and defended the same way: a honeypot a person never sees, and
 * nothing written to our own database at all.
 *
 * The send is awaited rather than left to `after()`, which is the opposite of
 * what comment notifications do. There the comment is already saved and the
 * email is a side effect; here the email *is* the submission, so telling
 * someone "that's gone through" before knowing it left would be untrue.
 */
export async function submitFeedbackAction(
  _previous: FeedbackFormState,
  formData: FormData,
): Promise<FeedbackFormState> {
  /*
   * Checked before validation, deliberately. A bot that submits rubbish gets
   * the success sentence rather than "your message is too short", which would
   * tell it exactly what to change.
   */
  if (isBotSubmission(formData.get("company"))) {
    return { notice: SUBMITTED_NOTICE };
  }

  const parsed = feedbackSchema.safeParse({
    kind: formData.get("kind"),
    message: formData.get("message"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  /*
   * Read from the session, never from the form: a username is a claim about
   * who someone is, and a form field saying "rafa" is worth nothing.
   */
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  const result = await sendFeedback(
    { ...parsed.data, username: profile?.username ?? null },
    siteUrl,
  );

  switch (result.status) {
    case "sent":
      return { notice: SUBMITTED_NOTICE };
    case "not_configured":
      // Previews and local dev. Say so plainly rather than claiming a
      // submission that did not happen — the same call subscribeAction makes.
      return {
        error: "Feedback is not switched on here yet. Email hello@viberation.dev instead.",
      };
    case "failed":
      console.error(`submitFeedbackAction: ${result.detail}`);
      return { error: "Something went wrong. Try again in a moment." };
  }
}
```

- [ ] **Step 4: Run the test and the typecheck**

Run: `node --experimental-strip-types --test lib/feedback-action.test.ts`
Expected: PASS, 3 tests.

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add lib/feedback-guard.ts lib/feedback-action.test.ts "app/(site)/feedback/actions.ts"
git commit -m "feat(feedback): server action with honeypot before validation [VIB-237]"
```

---

### Task 5: The page, the form, and the footer link

**Files:**
- Create: `components/features/feedback/FeedbackForm.tsx`
- Create: `app/(site)/feedback/page.tsx`
- Modify: `app/(site)/layout.tsx:251-269` — the `FOOTER_COLUMNS` constant

**Interfaces:**
- Consumes: `submitFeedbackAction` and `FeedbackFormState` (Task 4), `FEEDBACK_KINDS` (Task 1), `KIND_LABELS` (Task 2), `Label` and `buttonVariants`/`ButtonIcon` from `components/ui`.
- Produces: the `/feedback` route. Nothing else consumes it.

- [ ] **Step 1: Write the form**

Create `components/features/feedback/FeedbackForm.tsx`. The honeypot block is copied from `NewsletterForm` on purpose — same technique, same reasons, and two different hidden-field tricks would be two things to maintain.

```tsx
"use client";

import { IconArrowUpRight } from "@tabler/icons-react";
import { useActionState } from "react";

import {
  submitFeedbackAction,
  type FeedbackFormState,
} from "@/app/(site)/feedback/actions";
import { ButtonIcon, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KIND_LABELS } from "@/lib/emails/feedback";
import { FEEDBACK_KINDS } from "@/lib/validation/feedback";

/** Native select and textarea, same as ContentForm: keyboard and screen-reader behaviour for free. */
const fieldClass =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-3";

export function FeedbackForm() {
  const [state, formAction, pending] = useActionState<FeedbackFormState, FormData>(
    submitFeedbackAction,
    {},
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="kind">What kind of feedback is this?</Label>
        <select id="kind" name="kind" required defaultValue="" className={fieldClass}>
          <option value="" disabled>
            Pick one
          </option>
          {FEEDBACK_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {KIND_LABELS[kind]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Your feedback</Label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={8}
          placeholder="What would you change, add, or fix?"
          className={`${fieldClass} leading-relaxed`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Your email</Label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={fieldClass}
        />
        <p className="text-muted-foreground text-sm">
          Optional, and only used to reply to you. Leave it blank to stay anonymous.
        </p>
      </div>

      {/*
        Honeypot, identical to NewsletterForm's. Hidden from sight and from
        screen readers, and skipped by tab order, so only a form-filling bot
        ever puts anything in it. aria-hidden + tabIndex rather than
        display:none, which some bots check.
      */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className={buttonVariants({ variant: "pill", size: "pill" })}
      >
        <ButtonIcon>
          <IconArrowUpRight />
        </ButtonIcon>
        {pending ? "Sending…" : "Send it"}
      </button>

      {state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}

      {state.notice ? (
        <p role="status" className="text-sm font-semibold">
          {state.notice}
        </p>
      ) : null}
    </form>
  );
}
```

- [ ] **Step 2: Write the page**

Create `app/(site)/feedback/page.tsx`:

```tsx
import type { Metadata } from "next";

import { FeedbackForm } from "@/components/features/feedback/FeedbackForm";

export const metadata: Metadata = {
  title: "Send feedback",
  description:
    "Suggest an improvement, ask for a feature, or tell us something is broken.",
};

/**
 * Visitor feedback (VIB-237).
 *
 * Static — the form is the only moving part, and it is a client component
 * with its own server action. Nothing here reads the database.
 */
export default function FeedbackPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-heading text-4xl font-extrabold tracking-[-0.035em]">
        Send feedback
      </h1>
      <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
        Something missing, something wrong, something you wish this site did?
        Tell us. It goes straight to an inbox a person reads.
      </p>
      <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
        The most useful feedback names the thing you were trying to do. No
        account needed, and nothing you send here is stored on the site.
      </p>

      <FeedbackForm />
    </div>
  );
}
```

- [ ] **Step 3: Link it from the footer**

In `app/(site)/layout.tsx`, add a third column to `FOOTER_COLUMNS`, after the `Legal` column and before the closing `] as const;`:

```ts
  {
    heading: "Say hello",
    links: [
      { label: "Send feedback", href: "/feedback" },
      { label: "Docs and support", href: "/docs" },
    ],
  },
```

The grid is already `lg:grid-cols-[2fr_1fr_1fr]` with one brand block plus two columns, so a third column needs the template widened. Change that class on the `div` inside `VisitorFooter` to:

```tsx
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
```

- [ ] **Step 4: Verify it in the browser**

Run the dev server through the preview tool (never `npm run dev` in a shell), then:

1. Load `/feedback`. Confirm the heading, the three fields and the button render, and that the honeypot is not visible.
2. Submit with the message left empty — the browser blocks it. Then submit with a 3-character message by removing `minLength` in devtools: expect the inline error "Tell us a little more — a sentence is plenty."
3. Submit a valid message. Locally there is no `RESEND_API_KEY`, so expect **"Feedback is not switched on here yet"** — that is the correct local outcome and proves the action ran end to end without claiming a send that did not happen.
4. Check the console and server logs for errors.
5. Load `/` and confirm the footer's fourth column appears and the link works, at desktop width and at `mobile` preset.
6. Screenshot `/feedback` for the PR.

- [ ] **Step 5: Run the full suite, then commit**

Run: `npm run test && npm run typecheck && npm run lint && npm run build`
Expected: all clean, and the build output lists `/feedback`.

```bash
git add "app/(site)/feedback/page.tsx" "app/(site)/layout.tsx" components/features/feedback/FeedbackForm.tsx
git commit -m "feat(feedback): the /feedback page and its footer link [VIB-237]"
```

---

### Task 6: Changelog, then the PR

**Files:**
- Modify: `lib/changelog.ts` — prepend one entry

- [ ] **Step 1: Add the entry**

In `lib/changelog.ts`, insert as the first element of `CHANGELOG`:

```ts
  {
    date: "2026-10-04",
    kind: "added",
    title: "Send feedback",
    body: "There is now a page for telling us what to change, add or fix. No account needed, and you can leave your email off if you would rather not hear back.",
  },
```

No `feature: true`. It is a new way to reach us, not a new capability of the product in the sense §28 means — the same distinction VIB-234 drew.

- [ ] **Step 2: Verify the changelog tests still pass**

Run: `node --experimental-strip-types --test lib/changelog.test.ts`
Expected: PASS. (The suite asserts ordering and key uniqueness, which a new newest-first entry must not break.)

- [ ] **Step 3: Commit and push**

```bash
git add lib/changelog.ts
git commit -m "docs(changelog): log the feedback page [VIB-237]"
git push -u origin HEAD
```

- [ ] **Step 4: Open the PR**

Title: `feat(feedback): visitor feedback form at /feedback [VIB-237]`

The body must state: that nothing is stored and why that was the choice; that there is no rate limit and what the upgrade path is; that the honeypot is checked before validation so a bot learns nothing; that the send is awaited rather than backgrounded, unlike comment notifications; and that the local verification ended at "not switched on here yet" because previews have no Resend key, so the real send wants checking on the Vercel preview. End with the attribution line.

- [ ] **Step 5: Confirm CI, and flag the open question**

Check the PR's checks. Then remind Ali of the one thing the spec left open: `/feedback` is a fourth visitor-facing utility route, and Bible §28 names only `/blog`, `/docs` and `/changelog`. Confirm it is MVP and not Phase 1.5 before merging, since CLAUDE.md puts Phase 1.5 out of scope.

---

## Self-review notes

- **Spec coverage.** Every section maps to a task: fields and validation → 1; renderer and escaping → 2; recipient and `reply_to` → 3; error handling, honeypot and session attribution → 4; page, form and footer → 5; changelog and the scope question → 6. The spec's "no test for the server action" is honoured — the pure part was extracted into `lib/feedback-guard.ts` so the leak-prone rule is still pinned.
- **One thing the spec did not foresee:** `sendEmail` has no `replyTo`. Task 3 adds it as an optional field, which is the only change to a shared module here.
- **Review Focus coverage.** 1 and 3 → Task 1; 2 → Task 1, with a named fallback if `emailSchema` turns out to accept a trailing newline; 5 → Task 2; 4 → Task 4.
- **Type consistency.** `FeedbackKind` is defined once in Task 1 and imported by Tasks 2 and 5. `FeedbackFormState` is defined in Task 4 and consumed by Task 5. `KIND_LABELS` lives in the renderer and is read by the form, so the select and the subject line cannot disagree.
