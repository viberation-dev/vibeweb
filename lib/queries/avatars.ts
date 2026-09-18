import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

type Client = SupabaseClient<Database>;

/**
 * Profile photos in the public `avatars` bucket (VIB-178).
 *
 * Storage policies only let a user write under their own id, and the bucket
 * itself rejects anything over 2MB or not PNG, JPEG or WebP. This module is
 * the only place that knows the bucket's name or its path shape.
 */
const BUCKET = "avatars";

export const AVATAR_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
} as const;

export type AvatarType = keyof typeof AVATAR_TYPES;

/** Public URL for a stored path. Pure string building, no request. */
export function avatarUrl(client: Client, path: string | null): string | null {
  return path
    ? client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
    : null;
}

/**
 * Uploads a new photo and returns its path. A fresh name each time, so the
 * CDN and browsers never serve the old picture from cache under the new one.
 */
export async function uploadAvatar(
  client: Client,
  userId: string,
  file: File,
  type: AvatarType,
): Promise<string> {
  const path = `${userId}/${Date.now()}.${AVATAR_TYPES[type]}`;
  const { error } = await client.storage
    .from(BUCKET)
    .upload(path, file, { contentType: type });

  if (error) {
    throw new Error(`uploadAvatar(${userId}): ${error.message}`);
  }
  return path;
}

/** Deletes a stored photo. Best effort: a leftover file is harmless. */
export async function removeAvatarFile(
  client: Client,
  path: string,
): Promise<void> {
  await client.storage.from(BUCKET).remove([path]);
}
