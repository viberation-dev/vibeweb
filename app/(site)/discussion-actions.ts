"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/integrations/supabase/server";
import {
  addAppreciation,
  removeAppreciation,
} from "@/lib/queries/appreciations";
import {
  addComment,
  appreciateComment,
  deleteComment,
  setCommentHidden,
  unappreciateComment,
} from "@/lib/queries/comments";
import { safeRedirect } from "@/lib/validation/auth";
import {
  appreciateCommentSchema,
  appreciateSchema,
  commentIdSchema,
  commentSchema,
  moderateCommentSchema,
} from "@/lib/validation/comments";

/**
 * Appreciations and comments, as plain form actions (VIB-199).
 *
 * Forms posting to Server Actions rather than client components, the way
 * BookmarkButton already works: every control here functions with no
 * JavaScript, and the article pages stay Server Components.
 *
 * Shared by /learn, /blog and /walkthroughs rather than living under one of
 * them, because all three post the same four forms.
 */

type Client = Awaited<ReturnType<typeof createClient>>;

/**
 * The signed-in user's id, or a redirect to sign in and come back.
 *
 * Read from the session, never from the form. RLS would reject a write aimed
 * at someone else's row, but not accepting a user id from the client removes
 * the question rather than answering it.
 */
async function requireUserId(client: Client, returnTo: string) {
  const { data, error } = await client.auth.getUser();

  if (error || !data.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(returnTo)}`);
  }
  return data.user.id;
}

/**
 * Where to send the reader back to.
 *
 * Through safeRedirect for the reason the login form uses it: the value ends
 * up in a redirect, and an absolute one would bounce the reader off-site.
 */
function returnPath(formData: FormData, fallback = "/learn"): string {
  return safeRedirect(formData.get("return_to")?.toString(), fallback);
}

/** Appreciate a guide, article or walkthrough, or take it back. */
export async function toggleAppreciationAction(formData: FormData): Promise<void> {
  const parsed = appreciateSchema.safeParse({
    target_type: formData.get("target_type"),
    target_id: formData.get("target_id"),
    intent: formData.get("intent"),
  });

  if (!parsed.success) {
    // Nothing in this form is typed by a human, so a failure means a tampered
    // or stale page and there is no message worth showing.
    throw new Error(`toggleAppreciationAction: ${parsed.error.issues[0].message}`);
  }

  const returnTo = returnPath(formData);
  const supabase = await createClient();
  const userId = await requireUserId(supabase, returnTo);
  const target = {
    targetType: parsed.data.target_type,
    targetId: parsed.data.target_id,
  };

  if (parsed.data.intent === "add") {
    await addAppreciation(supabase, userId, target);
  } else {
    await removeAppreciation(supabase, userId, target);
  }

  revalidatePath(returnTo.split("?")[0]);
}

/**
 * Post a comment or a reply.
 *
 * The only form here a person types into, so it is the only one whose
 * validation failure is worth reporting rather than throwing: an empty or
 * over-long comment is a mistake, not tampering.
 */
export async function addCommentAction(formData: FormData): Promise<void> {
  const parsed = commentSchema.safeParse({
    target_type: formData.get("target_type"),
    target_id: formData.get("target_id"),
    body: formData.get("body"),
    parent_id: formData.get("parent_id"),
  });

  const returnTo = returnPath(formData);

  if (!parsed.success) {
    /*
     * An empty box is the overwhelmingly common case and it is not an error
     * state worth a page for — the reader pressed the button before typing.
     * Re-rendering the page leaves their draft where it is.
     */
    redirect(returnTo);
  }

  const supabase = await createClient();
  const userId = await requireUserId(supabase, returnTo);

  await addComment(
    supabase,
    userId,
    { targetType: parsed.data.target_type, targetId: parsed.data.target_id },
    parsed.data.body,
    parsed.data.parent_id,
  );

  revalidatePath(returnTo.split("?")[0]);
}

/** Delete one's own comment. The owner-only policy is what enforces "own". */
export async function deleteCommentAction(formData: FormData): Promise<void> {
  const parsed = commentIdSchema.safeParse({
    comment_id: formData.get("comment_id"),
  });

  if (!parsed.success) {
    throw new Error(`deleteCommentAction: ${parsed.error.issues[0].message}`);
  }

  const returnTo = returnPath(formData);
  const supabase = await createClient();
  const userId = await requireUserId(supabase, returnTo);

  await deleteComment(supabase, userId, parsed.data.comment_id);
  revalidatePath(returnTo.split("?")[0]);
}

/** Appreciate someone else's comment, or take it back. */
export async function toggleCommentAppreciationAction(
  formData: FormData,
): Promise<void> {
  const parsed = appreciateCommentSchema.safeParse({
    comment_id: formData.get("comment_id"),
    intent: formData.get("intent"),
  });

  if (!parsed.success) {
    throw new Error(
      `toggleCommentAppreciationAction: ${parsed.error.issues[0].message}`,
    );
  }

  const returnTo = returnPath(formData);
  const supabase = await createClient();
  const userId = await requireUserId(supabase, returnTo);

  if (parsed.data.intent === "add") {
    await appreciateComment(supabase, userId, parsed.data.comment_id);
  } else {
    await unappreciateComment(supabase, userId, parsed.data.comment_id);
  }

  revalidatePath(returnTo.split("?")[0]);
}

/**
 * Hide or restore a comment.
 *
 * No staff check here beyond having a session: `comments_moderate` is the
 * boundary, and a second check in app code that could drift from the policy
 * is worse than one that cannot. A member who posts this form writes nothing.
 */
export async function moderateCommentAction(formData: FormData): Promise<void> {
  const parsed = moderateCommentSchema.safeParse({
    comment_id: formData.get("comment_id"),
    intent: formData.get("intent"),
  });

  if (!parsed.success) {
    throw new Error(`moderateCommentAction: ${parsed.error.issues[0].message}`);
  }

  const returnTo = returnPath(formData);
  const supabase = await createClient();
  const staffId = await requireUserId(supabase, returnTo);

  await setCommentHidden(
    supabase,
    parsed.data.comment_id,
    parsed.data.intent === "hide",
    staffId,
  );
  revalidatePath(returnTo.split("?")[0]);
}
