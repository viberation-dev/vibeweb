import assert from "node:assert/strict";
import { test } from "node:test";

import { toggleBookmarkSchema } from "./bookmarks.ts";

const tool = {
  target_type: "tool",
  target_id: "6f1c2c47-3d63-4c1e-9d0a-1d8d2f0f1a11",
  intent: "add",
};

test("a missing or blank model_id bookmarks the target itself", () => {
  assert.equal(toggleBookmarkSchema.parse({ ...tool, model_id: null }).model_id, null);
  assert.equal(toggleBookmarkSchema.parse({ ...tool, model_id: "" }).model_id, null);
});

test("a model_id must look like an OpenRouter id and sit on a tool", () => {
  assert.equal(
    toggleBookmarkSchema.parse({ ...tool, model_id: "google/gemini-3.7-flash" }).model_id,
    "google/gemini-3.7-flash",
  );
  assert.equal(toggleBookmarkSchema.safeParse({ ...tool, model_id: "not an id" }).success, false);
  assert.equal(
    toggleBookmarkSchema.safeParse({
      ...tool,
      target_type: "content",
      model_id: "google/gemini-3.7-flash",
    }).success,
    false,
  );
});
