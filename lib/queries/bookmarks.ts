import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Enums, Tables } from "@/types/supabase";

export type Bookmark = Tables<"bookmarks">;

/**
 * What a bookmark can point at. Bookmarks are polymorphic
 * (target_type + target_id) with no database-level foreign key — a single FK
 * cannot span five tables — so the pair travels together everywhere.
 */
export type BookmarkTarget = {
  targetType: Enums<"target_kind">;
  targetId: string;
  /**
   * One model inside the tool's family, by OpenRouter id (VIB-113). Absent or
   * null means the tool itself — every bookmark that is not a model.
   */
  modelId?: string | null;
};

type Client = SupabaseClient<Database>;

/**
 * Every bookmark belonging to `userId`, newest first, optionally narrowed to
 * one target kind.
 *
 * Model bookmarks are left out unless asked for: every caller but the
 * Bookmarks tab turns this into "which cards show Saved", and saving one
 * Gemini model is not saving Gemini.
 *
 * RLS on `bookmarks` is owner-only (migration 05), so this can only ever
 * return the caller's own rows — the user_id filter is for the index, not
 * for security.
 */
export async function listBookmarks(
  client: Client,
  userId: string,
  targetType?: Enums<"target_kind">,
  { includeModels = false }: { includeModels?: boolean } = {},
): Promise<Bookmark[]> {
  let query = client
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (targetType) {
    query = query.eq("target_type", targetType);
  }
  if (!includeModels) {
    query = query.is("model_id", null);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`listBookmarks(${userId}): ${error.message}`);
  }
  return data;
}

/**
 * The table each target kind lives in.
 *
 * Bookmarks carry (target_type, target_id) with no foreign key — one FK
 * cannot span five tables — so migration 05 leaves target integrity to app
 * code. This map is that check's only moving part: add a target kind to the
 * Postgres enum and TypeScript demands its table here.
 */
const TARGET_TABLES: Record<
  Enums<"target_kind">,
  "tools" | "content" | "prompts" | "collections" | "wizards"
> = {
  tool: "tools",
  content: "content",
  prompt: "prompts",
  collection: "collections",
  // The database still calls walkthroughs wizards (VIB-120): the rename was
  // UI and code only, so the enum key and the table name stay as they are.
  wizard: "wizards",
};

/**
 * True when the row a bookmark would point at actually exists — and, for a
 * model bookmark, when the model belongs to that tool's family.
 *
 * RLS applies, so this is also what stops someone bookmarking a draft or
 * another user's private row: invisible reads as non-existent.
 *
 * The model is checked against the family prefix, not against OpenRouter's
 * live list: a model OpenRouter drops later is a stale bookmark the tool page
 * already handles, not something worth a network call on every save.
 */
export async function targetExists(
  client: Client,
  target: BookmarkTarget,
): Promise<boolean> {
  if (target.modelId) {
    if (target.targetType !== "tool") return false;
    const { data, error } = await client
      .from("tools")
      .select("openrouter_family")
      .eq("id", target.targetId)
      .maybeSingle();

    if (error) {
      throw new Error(
        `targetExists(tool/${target.targetId}): ${error.message}`,
      );
    }
    const family = data?.openrouter_family;
    return Boolean(family && target.modelId.startsWith(family));
  }

  const { data, error } = await client
    .from(TARGET_TABLES[target.targetType])
    .select("id")
    .eq("id", target.targetId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `targetExists(${target.targetType}/${target.targetId}): ${error.message}`,
    );
  }
  return data !== null;
}

/** True when the user has already bookmarked this target. */
export async function isBookmarked(
  client: Client,
  userId: string,
  target: BookmarkTarget,
): Promise<boolean> {
  const query = client
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("target_type", target.targetType)
    .eq("target_id", target.targetId);

  const { data, error } = await (
    target.modelId
      ? query.eq("model_id", target.modelId)
      : query.is("model_id", null)
  ).maybeSingle();

  if (error) {
    throw new Error(
      `isBookmarked(${target.targetType}/${target.targetId}): ${error.message}`,
    );
  }
  return data !== null;
}

/**
 * Bookmark a target. Bookmarking something already bookmarked is a no-op
 * rather than an error — a double-submitted form should not 500.
 */
export async function addBookmark(
  client: Client,
  userId: string,
  target: BookmarkTarget,
  folderName: string | null = null,
): Promise<void> {
  // No FK can enforce a polymorphic target, so this is the integrity check
  // migration 05 defers to app code. Cheap, and it turns a dangling bookmark
  // into a failed insert rather than a row that renders as nothing forever.
  if (!(await targetExists(client, target))) {
    throw new Error(
      `addBookmark: no ${target.targetType} with id ${target.targetId}` +
        (target.modelId ? ` in family of ${target.modelId}` : ""),
    );
  }

  const { error } = await client.from("bookmarks").upsert(
    {
      user_id: userId,
      target_type: target.targetType,
      target_id: target.targetId,
      model_id: target.modelId ?? null,
      folder_name: folderName,
    },
    // unique nulls not distinct (user_id, target_type, target_id, model_id)
    // is what makes this idempotent, for the tool itself (null) as much as for
    // a model; ignoreDuplicates keeps an existing folder assignment intact.
    {
      onConflict: "user_id,target_type,target_id,model_id",
      ignoreDuplicates: true,
    },
  );

  if (error) {
    throw new Error(
      `addBookmark(${target.targetType}/${target.targetId}): ${error.message}`,
    );
  }
}

/** Remove a bookmark. Removing one that is not there is a no-op. */
export async function removeBookmark(
  client: Client,
  userId: string,
  target: BookmarkTarget,
): Promise<void> {
  const query = client
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("target_type", target.targetType)
    .eq("target_id", target.targetId);

  // Removing the tool's bookmark leaves its saved models alone, and the other
  // way round: they are separate saves.
  const { error } = await (target.modelId
    ? query.eq("model_id", target.modelId)
    : query.is("model_id", null));

  if (error) {
    throw new Error(
      `removeBookmark(${target.targetType}/${target.targetId}): ${error.message}`,
    );
  }
}

/** Move a bookmark into a folder, or out of one when `folderName` is null. */
export async function setBookmarkFolder(
  client: Client,
  userId: string,
  bookmarkId: string,
  folderName: string | null,
): Promise<void> {
  const { error } = await client
    .from("bookmarks")
    .update({ folder_name: folderName })
    .eq("id", bookmarkId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`setBookmarkFolder(${bookmarkId}): ${error.message}`);
  }
}

/**
 * Rename a folder across every bookmark the user filed under it.
 *
 * Folders are free text on the bookmark row at MVP — there is no folders
 * table — so renaming one is an update across its members, and an empty
 * `to` empties the folder out into Unfiled.
 */
export async function renameBookmarkFolder(
  client: Client,
  userId: string,
  from: string,
  to: string | null,
): Promise<void> {
  const { error } = await client
    .from("bookmarks")
    .update({ folder_name: to })
    .eq("user_id", userId)
    .eq("folder_name", from);

  if (error) {
    throw new Error(`renameBookmarkFolder(${from}): ${error.message}`);
  }
}
