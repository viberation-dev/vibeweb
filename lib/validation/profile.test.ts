import assert from "node:assert/strict";
import { test } from "node:test";

import { avatarSchema, profilePreferencesSchema } from "./profile.ts";

const file = (size: number, type: string) =>
  new File([new Uint8Array(size)], "a", { type });

test("avatars: PNG, JPEG and WebP up to 2MB only", () => {
  assert.ok(avatarSchema.safeParse(file(1000, "image/png")).success);
  assert.ok(
    avatarSchema.safeParse(file(2 * 1024 * 1024, "image/webp")).success,
  );
  assert.equal(
    avatarSchema.safeParse(file(2 * 1024 * 1024 + 1, "image/jpeg")).success,
    false,
  );
  // SVG can carry script, so it is refused even though it is an image.
  assert.equal(
    avatarSchema.safeParse(file(100, "image/svg+xml")).success,
    false,
  );
  assert.equal(avatarSchema.safeParse(file(0, "image/png")).success, false);
  assert.equal(avatarSchema.safeParse("not a file").success, false);
});

test("a blank display name clears it", () => {
  const parsed = profilePreferencesSchema.parse({
    display_name: "   ",
    username: "",
    role_level: "beginner",
    layout_mode: "essentials",
  });
  assert.equal(parsed.display_name, null);
});
