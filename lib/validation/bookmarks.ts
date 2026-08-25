import { z } from "zod";

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

export const toggleBookmarkSchema = bookmarkTargetSchema.extend({
  /**
   * The button says what it wants done rather than reporting what it thinks
   * the current state is — the server never has to guess which way to flip.
   */
  intent: z.enum(["add", "remove"]),
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
