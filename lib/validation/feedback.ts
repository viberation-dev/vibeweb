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
