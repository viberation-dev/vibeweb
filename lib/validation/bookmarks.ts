import { z } from "zod";

import { OPENROUTER_ID } from "../model-facts.ts";

/**
 * Server-side validation for the bookmark forms.
 *
 * The target enum mirrors Postgres `target_kind` (migration 01); a mismatch
 * surfaces at the query-layer boundary against the generated Database type.
 */

const folderName = z
  .string()
  .trim()
  .max(60, { message: "Folder names are 60 characters or fewer." })
  // An empty input means "no folder", not a folder called "".
  .transform((value) => (value === "" ? null : value));

export const bookmarkTargetSchema = z.object({
  target_type: z.enum(["tool", "content", "prompt", "collection", "wizard"]),
  target_id: z.uuid({ message: "That bookmark target is not valid." }),
});

export const toggleBookmarkSchema = bookmarkTargetSchema
  .extend({
    /**
     * The button says what it wants done rather than reporting what it thinks
     * the current state is — the server never has to guess which way to flip.
     */
    intent: z.enum(["add", "remove"]),
    /**
     * One model inside a tool's family (VIB-113). Missing or blank means the
     * target itself. Shape-checked here and in bookmarks_model_id_shape; that
     * it belongs to the tool's family is checked in addBookmark.
     */
    model_id: z
      .union([z.literal(""), z.string().regex(OPENROUTER_ID)])
      .nullish()
      .transform((value) => value || null),
  })
  .refine((data) => data.model_id === null || data.target_type === "tool", {
    message: "Only tools have models.",
  });

export const setBookmarkFolderSchema = z.object({
  bookmark_id: z.uuid(),
  folder_name: folderName,
});

export const renameBookmarkFolderSchema = z.object({
  /** The folder as it stands. Unfiled is not a folder, so it cannot be renamed. */
  from: z.string().trim().min(1).max(60),
  to: folderName,
});
