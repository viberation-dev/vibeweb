import { z } from "zod";

/**
 * Server-side validation for the testimonial editor (VIB-102).
 *
 * This is the security control; the browser's `required` attributes are UX
 * only (§34). Same shape as `contentEditorSchema` — empty selects and empty
 * optional text become null rather than "", because the columns are nullable
 * and an empty string is a different thing from "not stated".
 */

/** "" → null, written out per field so the inferred type stays narrow. */
const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value));

export const testimonialEditorSchema = z.object({
  quote: z.string().trim().min(1, "A testimonial needs the quote itself."),
  author_name: z
    .string()
    .trim()
    .min(1, "A testimonial needs a name — an anonymous quote is not proof."),
  location: optionalText,
  initials: z
    .string()
    .trim()
    .toUpperCase()
    .max(2, "Initials are one or two letters.")
    .transform((value) => (value === "" ? null : value)),
  role_level: z
    .union([z.enum(["beginner", "intermediate", "expert"]), z.literal("")])
    .transform((value) => (value === "" ? null : value)),
  /*
   * Where they said it. Not shown to visitors — it is what makes the claim
   * checkable later, so it is validated as a real URL rather than free text.
   */
  source_url: z
    .union([z.string().trim().url("That does not look like a URL."), z.literal("")])
    .transform((value) => (value === "" ? null : value)),
  /*
   * Required, and the reason this form is not just quote + name.
   *
   * A testimonial is a named real person's words on a page carrying affiliate
   * links. The column is `not null` in the schema; this is the matching
   * message, so the editor is told *why* rather than getting a constraint
   * violation. A date input gives "YYYY-MM-DD", which Postgres accepts as a
   * timestamptz at midnight UTC.
   */
  consent_at: z
    .string()
    .trim()
    .min(1, "Record when this person agreed to be quoted.")
    .refine((value) => !Number.isNaN(Date.parse(value)), "That is not a date.")
    .refine(
      (value) => Date.parse(value) <= Date.now(),
      "Consent cannot be dated in the future.",
    ),
  /* Checkboxes are absent from FormData when unticked, hence the coercion. */
  published: z
    .union([z.literal("on"), z.literal("")])
    .optional()
    .transform((value) => value === "on"),
  sort_order: z.coerce
    .number()
    .int("Order is a whole number.")
    .min(0, "Order cannot be negative."),
});

export type TestimonialEditorInput = z.infer<typeof testimonialEditorSchema>;
