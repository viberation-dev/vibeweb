import { z } from "zod";

import {
  ANNOUNCE_CONFLICT_ISSUE,
  ANNOUNCE_FIELDS,
  ANNOUNCEMENT_NOTE_ISSUE,
  announceAndClearAgree,
  hasAnnouncementNote,
  resolveAnnouncement,
} from "./announce.ts";

/**
 * Server-side validation for the Learn content editor (VIB-59).
 *
 * This is the security control; the browser's `required` attributes are UX
 * only (§34). The enums mirror the Postgres enums from migrations 03/14 —
 * a value added there surfaces as a type error where this feeds the query
 * layer, which is the boundary that has the generated Database type.
 */

export const contentEditorSchema = z.object({
  type: z.enum([
    "article",
    "guide",
    "cheatsheet",
    "course_link",
    "help_article",
    "role_guide",
    "announcement",
  ]),
  title: z.string().trim().min(1, "Give the article a title."),
  /*
   * Matches what the router can actually address: `/learn/[slug]` with
   * anything else in it either double-encodes or collides with a path
   * segment. Lowercase because two slugs differing only in case would be two
   * URLs for one article.
   */
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slugs are lowercase letters, numbers and single hyphens.",
    ),
  /** Empty body is allowed — an outline saved as a draft is a real state. */
  body: z.string().transform((value) => (value.trim() === "" ? null : value)),
  /*
   * Empty select → null, because both columns are nullable. Written out per
   * field rather than through a shared helper: anything that takes the value
   * as a plain `string` widens the inferred output back to `string`, which
   * the query layer then refuses.
   */
  role_level: z
    .union([z.enum(["beginner", "intermediate", "expert"]), z.literal("")])
    .transform((value) => (value === "" ? null : value)),
  audience: z
    .union([z.enum(["enduser", "author", "admin", "seller"]), z.literal("")])
    .transform((value) => (value === "" ? null : value)),
  /* Unfiled is a real answer, not a missing one — see lib/learn.ts. */
  pillar: z
    .union([
      z.enum([
        "fundamentals",
        "context_engineering",
        "prompt_engineering",
        "tool_reviews",
        "walkthroughs",
        "founder_playbook",
      ]),
      z.literal(""),
    ])
    .transform((value) => (value === "" ? null : value)),
  status: z.enum(["draft", "published"]),
  ...ANNOUNCE_FIELDS,
})
  .refine(announceAndClearAgree, ANNOUNCE_CONFLICT_ISSUE)
  // Resolve the pair, then check it: the refinement sees the resolved values
  // and the error lands on the field the editor typed into. Mirrors the
  // database's check constraint, but gives a message instead of a 500.
  .transform(({ announce_revision, clear_announcement, revision_note, ...rest }) => ({
    ...rest,
    ...resolveAnnouncement({ announce_revision, clear_announcement, revision_note }),
  }))
  .refine(hasAnnouncementNote, ANNOUNCEMENT_NOTE_ISSUE);

export type ContentEditorInput = z.infer<typeof contentEditorSchema>;
