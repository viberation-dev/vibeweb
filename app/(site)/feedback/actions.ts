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
