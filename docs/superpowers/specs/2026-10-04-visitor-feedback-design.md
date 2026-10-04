# Visitor feedback — design

**Date:** 2026-10-04
**Status:** awaiting review
**Linear:** to be created on approval

## Intent

Visitors have no way to suggest an improvement or report that something is
wrong. The only contact route today is the `mailto:hello@viberation.dev` link
in the utility bar, which asks someone to leave the site, open a mail client
and compose a message from nothing. Most won't.

Success looks like: a visitor with a thought can leave it in under a minute
without an account, and Ali reads it in his inbox alongside the comment
notifications that already arrive there.

## Decisions taken before this spec

Both from Ali, 2026-10-04:

1. **Feedback is emailed, not stored.** No `feedback` table.
2. **It lives at its own `/feedback` route**, linked from the footer, rather
   than as a widget in the footer itself.

### Why no table is the right call, not just the cheap one

`app/(site)/actions.ts` is the only public write path in the app, and its
comment states the property deliberately: *"nothing is written to our own
database at all, so the worst a flood can do is waste Resend calls rather
than fill a table."* `lib/integrations/resend.ts` makes the same point about
why the newsletter list lives at Resend — it avoided *"the schema's only
publicly-writable table."*

A `feedback` table would have reversed that. It would also have needed, to be
honest about it: rate limiting (the app has none anywhere), spam triage, a
retention story for whatever abuse lands in it, and an admin screen. That is
most of the work in the feature, and none of it is the part Ali asked for.

What is given up, stated plainly so it is a choice rather than a surprise:
no status tracking, no way to tell someone their suggestion shipped, no list
to sort by how often a thing is asked for. If any of those start mattering,
the upgrade is a table behind the same form — the form and the validation
survive it, which is why this is a first step rather than a dead end.

## Shape

Seven files, five of them new. The arrangement is the one
`lib/comment-notifications.ts` and `lib/emails/comment-notification.ts`
already use for the same job — staff mail triggered by a public action —
rather than a new one.

| File | Responsibility |
|---|---|
| `app/(site)/feedback/page.tsx` | The page. Server component, static. |
| `components/features/feedback/FeedbackForm.tsx` | The form. Client, `useActionState`. |
| `app/(site)/feedback/actions.ts` | Server action: honeypot, parse, send. |
| `lib/validation/feedback.ts` | The zod schema. The security control. |
| `lib/emails/feedback.ts` | Pure renderer. Alias-free, escaped. |
| `lib/feedback.ts` | Composes and sends via the Resend adapter. |
| `app/(site)/layout.tsx` | One footer link (existing file). |

### Fields

- **What kind** — `improvement` · `feature` · `broken` · `other`. A native
  select, required, defaulting to nothing selected. It exists because it makes
  the subject line useful: "Something's broken" and "Feature idea" want
  different attention in an inbox.
- **The message** — textarea, required, 10 to 4000 characters. The lower bound
  rejects "hi"; the upper one stops a paste of a novel becoming an email that
  will not render.
- **Email, optional** — "only if you want a reply". Validated through the
  existing `emailSchema` from `lib/validation/auth.ts` **only when non-empty**,
  so leaving it blank is a valid submission rather than an error.
- **Honeypot** — a hidden `company` field, exactly as `NewsletterForm` has it:
  `absolute left-[-9999px]`, `aria-hidden`, `tabIndex={-1}`. Filled means
  dropped, and the response is the same success message a person gets, so a
  bot learns nothing from the difference.

### Who sent it

If a session exists, the action attaches the member's username to the email.
Not a field they fill in — read server-side from the session, so it cannot be
spoofed by editing the form. Signed-out submissions say "a visitor".

This is the one piece of context that changes how Ali reads a suggestion, and
it costs one `getCurrentProfile` call that the page's layout already makes.

### Recipient

`STAFF_NOTIFY_EMAIL ?? EMAIL_REPLY_TO ?? "hello@viberation.dev"` — the same
chain `lib/comment-notifications.ts` uses. Pointing staff mail somewhere else
stays one variable rather than three.

When the submitter gave an email address it goes in `reply_to`, so replying
from the inbox reaches them directly. The address is never shown anywhere
public, because nothing about this feature is public.

## Error handling

Mirrors `subscribeAction`, including the part people skip:

- Honeypot filled → the success notice. No send.
- Validation failure → the first zod message, inline, form state preserved.
- `not_configured` (no `RESEND_API_KEY`, which is previews and local dev) →
  say so honestly rather than claiming a submission that did not happen.
  `subscribeAction` already sets this precedent and it matters here more: a
  visitor told "thanks!" when nothing was sent has been lied to.
- `failed` → log the detail server-side, show a generic retry message. Never
  surface a provider error to a visitor.

Sending happens inside the action and the visitor waits for it, unlike comment
notifications which run in `after()`. The difference is deliberate: a comment
has already been saved and the notification is a side effect, whereas here the
send **is** the submission. Telling someone "thanks" before knowing it left
would be the lie above.

## Abuse

Honest about the ceiling, because the feature has no database to protect and
therefore a real one:

- Honeypot catches naive bots.
- The 4000-character cap bounds a single payload.
- Nothing is written to the database, so a flood cannot fill a table.
- **There is no rate limit.** The app has none anywhere, and adding one here
  alone would be the first. A determined flood wastes Resend quota and fills
  an inbox. That is the known ceiling; it gets a `ponytail:` comment in
  `lib/feedback.ts` naming the upgrade — a Vercel Firewall rate-limit rule on
  `/feedback`, which is configuration rather than code, or Turnstile if it
  ever gets worse than that.

This is the right trade now: the cost of being wrong is an annoying day, not
lost data or a breach.

## Testing

Two files, following `lib/emails/comment-notification.test.ts`:

- `lib/emails/feedback.test.ts` — the subject differs per kind; the message is
  escaped rather than interpolated (it is public text reaching an HTML
  template, so it is asserted, not trusted to a reading of the template); a
  signed-out submission is attributed to a visitor; an over-long message is
  truncated in the preheader.
- `lib/validation/feedback.test.ts` — an empty optional email parses; a
  malformed non-empty one does not; a 9-character message is rejected and a
  10-character one is not.

No test for the server action itself. It is honeypot-check, parse, send, and
all three parts are covered by the two files above plus the existing Resend
adapter — a test there would be testing `useActionState`.

## Scope boundaries

**Not building:** the table, status tracking, a public roadmap or voting, an
admin screen, in-app notifications, file attachments, a reply-from-the-app
flow, or a second feedback entry point anywhere else in the UI.

**Not touching:** comment notifications (VIB-205, already immediate and
working), the newsletter form, or any existing migration.

## Open question for Ali

`/feedback` becomes a fourth visitor-facing utility route beside `/blog`,
`/docs` and `/changelog`. Those three are named in Bible §28 as the
"Docs/Help IA section"; a feedback page is not, and I cannot read the Bible
from here to check whether it belongs in MVP scope or Phase 1.5. Worth
confirming before this ships, since CLAUDE.md puts anything from Phase 1.5
explicitly out of scope.

## Changelog

One entry, `added`, in the same PR. It is visitor-facing — a new page they can
use — unlike the member digest, which was operational staff mail. Not a
`feature: true` entry: it is a new way to reach Ali, not a new capability of
the product in the sense §28 means.
