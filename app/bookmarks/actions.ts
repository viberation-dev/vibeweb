"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/integrations/supabase/server";
import {
  addBookmark,
  removeBookmark,
  renameBookmarkFolder,
  setBookmarkFolder,
} from "@/lib/queries/bookmarks";
import { safeRedirect } from "@/lib/validation/auth";
import {
  renameBookmarkFolderSchema,
  setBookmarkFolderSchema,
  toggleBookmarkSchema,
} from "@/lib/validation/bookmarks";

type Client = Awaited<ReturnType<typeof createClient>>;

/**
 * The signed-in user's id, or a redirect to sign in.
 *
 * Read from the session server-side rather than from the form: RLS would
 * reject a write aimed at someone else's row anyway, but never accepting a
 * user id from the client removes the question entirely.
 */
async function requireUserId(client: Client, returnTo: string) {
  const { data, error } = await client.auth.getUser();

  if (error || !data.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(returnTo)}`);
  }
  return data.user.id;
}

/**
 * Add or remove one bookmark.
 *
 * A plain form action rather than a client component: the button works with
 * no JavaScript, and the page it lives on stays a Server Component.
 */
export async function toggleBookmarkAction(formData: FormData): Promise<void> {
  const parsed = toggleBookmarkSchema.safeParse({
    target_type: formData.get("target_type"),
    target_id: formData.get("target_id"),
    intent: formData.get("intent"),
  });

  if (!parsed.success) {
    // Nothing here comes from a human typing — a failure means a tampered or
    // stale form, so there is no message worth showing.
    throw new Error(`toggleBookmarkAction: ${parsed.error.issues[0].message}`);
  }

  /*
   * Where to send an unauthenticated visitor back to after signing in. Passed
   * through safeRedirect for the same reason the login form does: it lands in
   * a redirect URL, and an absolute value there would bounce the user off-site.
   */
  const returnTo = safeRedirect(formData.get("return_to")?.toString(), "/bookmarks");

  const supabase = await createClient();
  const userId = await requireUserId(supabase, returnTo);
  const target = { targetType: parsed.data.target_type, targetId: parsed.data.target_id };

  if (parsed.data.intent === "add") {
    await addBookmark(supabase, userId, target);
  } else {
    await removeBookmark(supabase, userId, target);
  }

  // Both the page the button sits on and the bookmarks list are now stale.
  revalidatePath(returnTo);
  revalidatePath("/bookmarks");
}

/** Move a bookmark into a folder, or clear its folder when left blank. */
export async function setBookmarkFolderAction(formData: FormData): Promise<void> {
  const parsed = setBookmarkFolderSchema.safeParse({
    bookmark_id: formData.get("bookmark_id"),
    folder_name: formData.get("folder_name"),
  });

  if (!parsed.success) {
    throw new Error(`setBookmarkFolderAction: ${parsed.error.issues[0].message}`);
  }

  const supabase = await createClient();
  const userId = await requireUserId(supabase, "/bookmarks");

  await setBookmarkFolder(supabase, userId, parsed.data.bookmark_id, parsed.data.folder_name);
  revalidatePath("/bookmarks");
}

/** Rename one folder across every bookmark filed under it. */
export async function renameBookmarkFolderAction(formData: FormData): Promise<void> {
  const parsed = renameBookmarkFolderSchema.safeParse({
    from: formData.get("from"),
    to: formData.get("to"),
  });

  if (!parsed.success) {
    throw new Error(`renameBookmarkFolderAction: ${parsed.error.issues[0].message}`);
  }

  const supabase = await createClient();
  const userId = await requireUserId(supabase, "/bookmarks");

  await renameBookmarkFolder(supabase, userId, parsed.data.from, parsed.data.to);
  revalidatePath("/bookmarks");
}
