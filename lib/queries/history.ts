import type { SupabaseClient } from "@supabase/supabase-js";

import type { BookmarkTarget } from "@/lib/queries/bookmarks";
import type { Database, Tables } from "@/types/supabase";

export type HistoryItem = Tables<"history_items">;

/** History points at the same polymorphic pair a bookmark does. */
export type HistoryTarget = BookmarkTarget;

type Client = SupabaseClient<Database>;

/** Migration 05's prune trigger keeps roughly this many rows per user. */
export const HISTORY_LIMIT = 200;

/**
 * Recently viewed items for `userId`, newest first.
 *
 * RLS on `history_items` is owner-only (migration 05), so this can only ever
 * return the caller's own rows — the user_id filter is for the index
 * (history_user_visited_idx), not for security.
 */
export async function listHistory(
  client: Client,
  userId: string,
  limit = HISTORY_LIMIT,
): Promise<HistoryItem[]> {
  const { data, error } = await client
    .from("history_items")
    .select("*")
    .eq("user_id", userId)
    .order("visited_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`listHistory: ${error.message}`);
  }
  return data;
}

/**
 * Record that `userId` looked at `target`.
 *
 * Delete-then-insert rather than a plain insert, because migration 05's
 * prune trigger caps the table at ~200 rows *per visit*, not per item —
 * insert-only would let one tool you keep reopening evict the rest of your
 * history. One row per target keeps "recently viewed, max 200" (§31) meaning
 * 200 distinct things.
 *
 * ponytail: two concurrent views of the same page can both delete and both
 * insert, leaving a duplicate row. It shows as one repeated card and the
 * next visit collapses it. A unique (user_id, target_type, target_id) index
 * plus upsert is the fix if that ever actually shows up.
 *
 * Deliberately does not throw: this runs in after(), where a rejected
 * promise has no page left to report to, and a lost history row is not worth
 * breaking a view over.
 */
export async function recordVisit(
  client: Client,
  userId: string,
  target: HistoryTarget,
): Promise<void> {
  const match = {
    user_id: userId,
    target_type: target.targetType,
    target_id: target.targetId,
  };

  const { error: deleteError } = await client.from("history_items").delete().match(match);

  if (deleteError) {
    console.error(`recordVisit: ${deleteError.message}`);
    return;
  }

  const { error } = await client.from("history_items").insert(match);

  if (error) {
    console.error(`recordVisit: ${error.message}`);
  }
}
