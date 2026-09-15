/**
 * Resend adapter — the newsletter audience (VIB-91).
 *
 * One typed module per third-party service (§34): nothing else in the app
 * knows Resend's URL shape, so swapping provider means rewriting this file
 * and no call site. Resend already sends the auth mail as Supabase's SMTP
 * provider; this is the separate contacts API.
 *
 * Why the list lives there rather than in a `subscribers` table: Resend owns
 * the unsubscribe link and the consent record, which is the part that is a
 * legal obligation rather than a feature. Keeping it here would have meant
 * the schema's only publicly-writable table, plus building confirmation and
 * unsubscribe flows by hand.
 */

const API = "https://api.resend.com";

export type SubscribeResult =
  /** Added, or already present — the reader sees the same thing either way. */
  | { status: "subscribed" }
  /** No API key or audience id configured. Expected on previews and locally. */
  | { status: "not_configured" }
  /** Resend answered, but not with success. `detail` is for the server log. */
  | { status: "failed"; detail: string };

function config(): { key: string; audienceId: string } | null {
  const key = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  return key && audienceId ? { key, audienceId } : null;
}

/**
 * Add one address to the newsletter audience.
 *
 * Never throws for an expected outcome — a signup form that 500s at a reader
 * because a key is missing is worse than one that says "not available right
 * now". Genuine faults are returned as `failed` with the detail for the log.
 *
 * An address already on the list reports `subscribed`. Resend answers 409 in
 * that case, and telling someone "you are already subscribed" leaks who is on
 * the list to anyone who can type an email address into a public form.
 */
export async function subscribeToNewsletter(
  email: string,
): Promise<SubscribeResult> {
  const settings = config();
  if (!settings) {
    return { status: "not_configured" };
  }

  let response: Response;
  try {
    response = await fetch(`${API}/audiences/${settings.audienceId}/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${settings.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    });
  } catch (error) {
    return {
      status: "failed",
      detail: error instanceof Error ? error.message : "network error",
    };
  }

  if (response.ok || response.status === 409) {
    return { status: "subscribed" };
  }

  return {
    status: "failed",
    detail: `${response.status} ${await response.text().catch(() => "")}`.trim(),
  };
}

export type SendResult =
  | { status: "sent"; id: string }
  | { status: "not_configured" }
  | { status: "failed"; detail: string };

export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** One-click unsubscribe (RFC 8058), so Gmail and Apple Mail show their own button. */
  unsubscribeUrl?: string;
};

/**
 * Sends one email (VIB-155). Only needs RESEND_API_KEY; the audience id is a
 * newsletter concern. The sender domain is the one Supabase auth mail already
 * goes out on, so it is verified in Resend.
 */
export async function sendEmail(email: OutgoingEmail): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { status: "not_configured" };
  }

  const headers: Record<string, string> = {};
  if (email.unsubscribeUrl) {
    headers["List-Unsubscribe"] = `<${email.unsubscribeUrl}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  let response: Response;
  try {
    response = await fetch(`${API}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Viberation <hello@mail.viberation.dev>",
        reply_to: process.env.EMAIL_REPLY_TO ?? "hello@viberation.dev",
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        headers,
      }),
    });
  } catch (error) {
    return {
      status: "failed",
      detail: error instanceof Error ? error.message : "network error",
    };
  }

  if (!response.ok) {
    return {
      status: "failed",
      detail: `${response.status} ${await response.text().catch(() => "")}`.trim(),
    };
  }

  const body = (await response.json().catch(() => ({}))) as { id?: string };
  return { status: "sent", id: body.id ?? "" };
}
