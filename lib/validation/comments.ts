import { z } from "zod";

/**
 * Server-side validation for the appreciation and comment forms (VIB-199).
 *
 * This is the security control; the textarea's `maxlength` is UX. The target
 * enum mirrors Postgres `target_kind` (migration 01), and the body bound
 * mirrors the check constraint on `comments.body` — both ends say the same
 * thing so a form cannot get past one by going round the other.
 */

const target = {
  target_type: z.enum(["tool", "content", "prompt", "collection", "wizard"]),
  target_id: z.uuid({ message: "That is not something you can comment on." }),
};

export const appreciateSchema = z.object({
  ...target,
  /**
   * The button states what it wants done rather than what it believes the
   * current state is, so a stale page cannot toggle the wrong way.
   */
  intent: z.enum(["add", "remove"]),
});

export const commentSchema = z.object({
  ...target,
  body: z
    .string()
    .trim()
    .min(1, { message: "Write something first." })
    .max(4000, { message: "Comments are 4000 characters or fewer." }),
  /**
   * Which comment this replies to. Blank means a new top-level comment.
   *
   * That the parent is itself top-level is enforced by the `comments_depth`
   * trigger, not here: only the database can see the parent's parent, and a
   * check that cannot be complete should not pretend to be.
   */
  parent_id: z
    .union([z.literal(""), z.uuid()])
    .nullish()
    .transform((value) => value || null),
});

export const commentIdSchema = z.object({
  comment_id: z.uuid(),
});

export const appreciateCommentSchema = commentIdSchema.extend({
  intent: z.enum(["add", "remove"]),
});

export const moderateCommentSchema = commentIdSchema.extend({
  intent: z.enum(["hide", "restore"]),
});
