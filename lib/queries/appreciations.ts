import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Enums } from "@/types/supabase";

type Client = SupabaseClient<Database>;

/**
 * What an appreciation can point at (VIB-199).
 *
 * The same polymorphic pair bookmarks use, for the same reason: a guide, a
 * walkthrough and a prompt are all things a reader might want to endorse, and
 * a table per kind is how that becomes three half-built features.
 */
export type AppreciationTarget = {
  targetType: Enums<"target_kind">;
  targetId: string;
};

export type AppreciationState = {
  count: number;
  /** Whether the current reader has appreciated it. False when signed out. */
  mine: boolean;
};

/**
 * The count, and whether this reader is part of it.
 *
 * One round trip, not two: `head: true` with an exact count returns the
 * number without the rows, and the caller's own row is checked in the same
 * pass only when there is a user to check.
 */
export async function getAppreciationState(
  client: Client,
  target: AppreciationTarget,
  userId?: string | null,
): Promise<AppreciationState> {
  const [countResult, mineResult] = await Promise.all([
    client
      .from("appreciations")
      .select("id", { count: "exact", head: true })
      .eq("target_type", target.targetType)
      .eq("target_id", target.targetId),
    userId
      ? client
          .from("appreciations")
          .select("id")
          .eq("target_type", target.targetType)
          .eq("target_id", target.targetId)
          .eq("user_id", userId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (countResult.error) {
    throw new Error(
      `getAppreciationState(${target.targetType}:${target.targetId}): ${countResult.error.message}`,
    );
  }
  if (mineResult.error) {
    throw new Error(
      `getAppreciationState(${target.targetType}:${target.targetId}) mine: ${mineResult.error.message}`,
    );
  }

  return { count: countResult.count ?? 0, mine: mineResult.data !== null };
}

/**
 * Adds this reader's appreciation.
 *
 * A duplicate insert is not an error worth surfacing: the unique constraint
 * already says one per person, and a reader who double-submits the form meant
 * to appreciate it once. Any other failure still throws.
 */
export async function addAppreciation(
  client: Client,
  userId: string,
  target: AppreciationTarget,
): Promise<void> {
  const { error } = await client.from("appreciations").insert({
    user_id: userId,
    target_type: target.targetType,
    target_id: target.targetId,
  });

  // 23505 — unique_violation. Already appreciated, which is the desired state.
  if (error && error.code !== "23505") {
    throw new Error(`addAppreciation(${userId}): ${error.message}`);
  }
}

/** Removes it. Deleting something already gone is not an error either. */
export async function removeAppreciation(
  client: Client,
  userId: string,
  target: AppreciationTarget,
): Promise<void> {
  const { error } = await client
    .from("appreciations")
    .delete()
    .eq("user_id", userId)
    .eq("target_type", target.targetType)
    .eq("target_id", target.targetId);

  if (error) {
    throw new Error(`removeAppreciation(${userId}): ${error.message}`);
  }
}
