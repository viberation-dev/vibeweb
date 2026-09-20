import assert from "node:assert/strict";
import { test } from "node:test";

import { comparisonEditorSchema, comparisonSlug } from "./comparison.ts";

const valid = {
  tool_a_id: "6f1c0b5e-8a0e-4c39-9d4b-1a2b3c4d5e6f",
  tool_b_id: "7a2d1c6f-9b1f-4d4a-8e5c-2b3c4d5e6f70",
  intro: "  Both are good.  ",
  pick_a: "You want A.",
  pick_b: "You want B.",
  models_a: "anthropic/claude-opus-5\n\n  anthropic/claude-sonnet-5  \r\n",
  models_b: "",
  published: "on",
};

test("a valid comparison parses, with model lines split and trimmed", () => {
  const result = comparisonEditorSchema.safeParse(valid);
  assert.ok(result.success);
  assert.equal(result.data.intro, "Both are good.");
  assert.deepEqual(result.data.models_a, ["anthropic/claude-opus-5", "anthropic/claude-sonnet-5"]);
  assert.deepEqual(result.data.models_b, []);
  assert.equal(result.data.published, true);
});

test("the same tool on both sides is rejected", () => {
  const result = comparisonEditorSchema.safeParse({ ...valid, tool_b_id: valid.tool_a_id });
  assert.equal(result.success, false);
});

test("more than three models, or a malformed id, is rejected", () => {
  const four = "a/b\nc/d\ne/f\ng/h";
  assert.equal(comparisonEditorSchema.safeParse({ ...valid, models_a: four }).success, false);
  assert.equal(comparisonEditorSchema.safeParse({ ...valid, models_b: "claude opus" }).success, false);
});

test("an unticked checkbox means a draft", () => {
  const result = comparisonEditorSchema.safeParse({ ...valid, published: undefined });
  assert.ok(result.success);
  assert.equal(result.data.published, false);
});

test("slug joins the two tool slugs", () => {
  assert.equal(comparisonSlug("claude", "gpt"), "claude-vs-gpt");
});
