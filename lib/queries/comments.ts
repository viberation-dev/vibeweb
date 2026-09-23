import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildCommentTree,
  displayName,
  type CommentNode,
} from "@/lib/comment-tree";
import type { Database, Enums } from "@/types/supabase";

export type { CommentNode } from "@/lib/comment-tree";

type Client = SupabaseClient<Database>;

export type CommentTarget = {
  targetType: Enums<"target_kind">;
  targetId: string;
};

/**
 * Every visible comment on one target, oldest first, as a two-level tree.
 *
 * One query. The join pulls the author and the full appreciation rows, and
 * the count and "did I appreciate this" are derived from those rows in
 * memory rather than as two more round trips per comment.
 *
 * ponytail: that means the whole appreciation set for a thread crosses the
 * wire. Fine at a few hundred; if a thread ever gets big enough for it to
 * matter, this becomes a view with the counts aggregated in Postgres.
 *
 * Hidden comments never arrive — the RLS policy filters them for everyone
 * but staff, so there is no second check here to forget.
 */
export async function listComments(
  client: Client,
  target: CommentTarget,
  userId?: string | null,
): Promise<CommentNode[]> {
  const { data, error } = await client
    .from("comments")
    .select(
      /*
       * The relationship has to be named: `comments` points at `profiles`
       * twice (user_id and hidden_by), and an unhinted embed is ambiguous.
       * `author:` then gives it the name the renderer actually uses.
       */
      "id, body, created_at, parent_id, user_id, author:profiles!comments_user_id_fkey(id, username, avatar_path), comment_appreciations(user_id)",
    )
    .eq("target_type", target.targetType)
    .eq("target_id", target.targetId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(
      `listComments(${target.targetType}:${target.targetId}): ${error.message}`,
    );
  }

  /*
   * Shaping lives in lib/comment-tree.ts, which has no database import and
   * is unit tested — including the case that is awkward to reproduce here, a
   * reply whose parent was hidden by a moderator and so never arrived.
   */
  return buildCommentTree(data, userId);
}

/** How many visible comments a target has, replies included. */
export async function countComments(
  client: Client,
  target: CommentTarget,
): Promise<number> {
  const { count, error } = await client
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("target_type", target.targetType)
    .eq("target_id", target.targetId);

  if (error) {
    throw new Error(
      `countComments(${target.targetType}:${target.targetId}): ${error.message}`,
    );
  }
  return count ?? 0;
}

/**
 * Posts a comment, or a reply to one.
 *
 * `parentId` is trusted only as far as the database allows: the depth
 * trigger rejects a reply to a reply, and RLS rejects a `user_id` that is
 * not the caller. Nothing here re-implements either.
 */
export async function addComment(
  client: Client,
  userId: string,
  target: CommentTarget,
  body: string,
  parentId?: string | null,
): Promise<void> {
  const { error } = await client.from("comments").insert({
    user_id: userId,
    target_type: target.targetType,
    target_id: target.targetId,
    parent_id: parentId ?? null,
    body,
  });

  if (error) {
    throw new Error(`addComment(${userId}): ${error.message}`);
  }
}

/**
 * Deletes one's own comment.
 *
 * The `user_id` filter is for the error message, not for security — the
 * owner-only delete policy is what actually stops someone deleting another
 * person's comment.
 */
export async function deleteComment(
  client: Client,
  userId: string,
  commentId: string,
): Promise<void> {
  const { error } = await client
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`deleteComment(${commentId}): ${error.message}`);
  }
}

/** Appreciates a comment. A repeat is the state the reader wanted. */
export async function appreciateComment(
  client: Client,
  userId: string,
  commentId: string,
): Promise<void> {
  const { error } = await client
    .from("comment_appreciations")
    .insert({ comment_id: commentId, user_id: userId });

  // 23505 — unique_violation, i.e. already appreciated.
  if (error && error.code !== "23505") {
    throw new Error(`appreciateComment(${commentId}): ${error.message}`);
  }
}

export async function unappreciateComment(
  client: Client,
  userId: string,
  commentId: string,
): Promise<void> {
  const { error } = await client
    .from("comment_appreciations")
    .delete()
    .eq("comment_id", commentId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`unappreciateComment(${commentId}): ${error.message}`);
  }
}

/**
 * Hides or restores a comment. Staff only — the `comments_moderate` policy
 * is what enforces that, not this function.
 */
export async function setCommentHidden(
  client: Client,
  commentId: string,
  hidden: boolean,
  staffId: string,
): Promise<void> {
  const { error } = await client
    .from("comments")
    .update({
      hidden_at: hidden ? new Date().toISOString() : null,
      hidden_by: hidden ? staffId : null,
    })
    .eq("id", commentId);

  if (error) {
    throw new Error(`setCommentHidden(${commentId}): ${error.message}`);
  }
}

/** One comment as the moderation list shows it, hidden ones included. */
export type ModerationComment = {
  id: string;
  body: string;
  createdAt: string;
  hiddenAt: string | null;
  authorName: string;
  targetType: Enums<"target_kind">;
  targetId: string;
};

/**
 * The newest comments across the whole site, for the moderation screen.
 *
 * Hidden rows are included, which only works for staff — `comments_read`
 * returns them to nobody else, so a member who reached this page would see an
 * ordinary thread rather than a moderation queue. requireStaff keeps them off
 * the page; RLS is what keeps them out of the data.
 */
export async function listCommentsForModeration(
  client: Client,
  limit = 100,
): Promise<ModerationComment[]> {
  const { data, error } = await client
    .from("comments")
    .select(
      "id, body, created_at, hidden_at, target_type, target_id, author:profiles!comments_user_id_fkey(username)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`listCommentsForModeration: ${error.message}`);
  }

  return data.map((row) => ({
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    hiddenAt: row.hidden_at,
    authorName: displayName(row.author?.username ?? null),
    targetType: row.target_type,
    targetId: row.target_id,
  }));
}

/**
 * The title of the thing a comment is on, for the staff notification
 * (VIB-205).
 *
 * `content` and `wizards` are the only commentable targets today and both
 * carry a `title`. Anything else returns null rather than guessing at a
 * column name — the caller falls back to the path, which is always right.
 *
 * Never throws. A notification that cannot name the piece is worth sending;
 * a comment that fails to save because its notification could not be
 * addressed is not.
 */
export async function getCommentTargetTitle(
  client: Client,
  target: CommentTarget,
): Promise<string | null> {
  const table =
    target.targetType === "content"
      ? "content"
      : // The database still calls walkthroughs wizards (VIB-120).
        target.targetType === "wizard"
        ? "wizards"
        : null;
  if (!table) return null;

  const { data, error } = await client
    .from(table)
    .select("title")
    .eq("id", target.targetId)
    .maybeSingle();

  return error ? null : (data?.title ?? null);
}
