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
