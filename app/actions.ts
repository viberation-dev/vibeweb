"use server";

import { subscribeToNewsletter } from "@/lib/integrations/resend";
import { emailSchema } from "@/lib/validation/auth";

export type NewsletterFormState = { error?: string; notice?: string };

/**
 * Newsletter signup (VIB-91).
 *
 * Public and unauthenticated — the only write path in the app that anyone can
 * reach. Two cheap defences, both deliberate:
 *
 *   - a honeypot field a person never sees and a bot fills in. Filled means
 *     dropped, and the response is the same success message a person gets, so
 *     the bot learns nothing. No CAPTCHA, no third-party script.
 *   - nothing is written to our own database at all, so the worst a flood can
 *     do is waste Resend calls rather than fill a table.
 *
 * Reuses `emailSchema` from the auth forms rather than a second definition —
 * one answer to "is this an email address" across the app.
 */
export async function subscribeAction(
  _previous: NewsletterFormState,
  formData: FormData,
): Promise<NewsletterFormState> {
  // Hidden field, labelled as one to ignore. A real submission leaves it empty.
  if (formData.get("company")) {
    return { notice: "Thanks — check your inbox to confirm." };
  }

  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await subscribeToNewsletter(parsed.data);

  switch (result.status) {
    case "subscribed":
      return { notice: "Thanks — you're on the list." };
    case "not_configured":
      // Previews and local dev land here. Say so plainly rather than claiming
      // a subscription that did not happen.
      return { error: "Signups are not switched on yet. Try again soon." };
    case "failed":
      console.error(`subscribeAction: ${result.detail}`);
      return { error: "Something went wrong. Try again in a moment." };
  }
}
