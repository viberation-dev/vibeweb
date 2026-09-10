import assert from "node:assert/strict";
import { test } from "node:test";

import { toolEditorSchema } from "./tool.ts";

const valid = {
  name: "  Claude Code  ",
  slug: "Claude-Code",
  category: "clis",
  tagline: "Agentic coding in the terminal",
  description: "",
  pricing_tier: "Paid",
  platform: ["macos", "windows", "linux"],
  best_for: "intermediate",
  outbound_url: "https://example.com/claude-code",
  is_affiliate: null,
};

test("a whole valid tool parses, trimmed and lowercased", () => {
  const result = toolEditorSchema.safeParse(valid);
  assert.ok(result.success);
  assert.equal(result.data.name, "Claude Code");
  assert.equal(result.data.slug, "claude-code");
});

test("pricing_tier is a closed list, not free text", () => {
  // "free" would read as Paid everywhere: hasFreeTier and the directory's
  // pricing filter both compare against the exact strings.
  assert.equal(toolEditorSchema.safeParse({ ...valid, pricing_tier: "free" }).success, false);
  assert.ok(toolEditorSchema.safeParse({ ...valid, pricing_tier: "Open source" }).success);
});

test("an unset pricing tier becomes null rather than an empty string", () => {
  const result = toolEditorSchema.safeParse({ ...valid, pricing_tier: "" });
  assert.ok(result.success);
  assert.equal(result.data.pricing_tier, null);
});

test("an outbound URL the redirect would refuse is rejected here", () => {
  // Same rule as safeOutboundUrl, so the editor cannot save a destination
  // /go/[slug] would then decline to send anyone to.
  for (const url of ["javascript:alert(1)", "data:text/html,x", "/tools", "example.com"]) {
    assert.equal(
      toolEditorSchema.safeParse({ ...valid, outbound_url: url }).success,
      false,
      `expected ${url} to be rejected`,
    );
  }
  assert.ok(toolEditorSchema.safeParse({ ...valid, outbound_url: "http://x.dev" }).success);
});

test("a blank outbound URL is allowed — the column is not null default ''", () => {
  const result = toolEditorSchema.safeParse({ ...valid, outbound_url: "  " });
  assert.ok(result.success);
  assert.equal(result.data.outbound_url, "");
});

test("an unticked affiliate box arrives as null and means false", () => {
  // Unchecked checkboxes are absent from FormData, so formData.get() is null.
  assert.equal(toolEditorSchema.parse(valid).is_affiliate, false);
  assert.equal(toolEditorSchema.parse({ ...valid, is_affiliate: "on" }).is_affiliate, true);
});

test("a slug with spaces or slashes is rejected", () => {
  for (const slug of ["claude code", "tools/claude", "-claude", ""]) {
    assert.equal(
      toolEditorSchema.safeParse({ ...valid, slug }).success,
      false,
      `expected ${JSON.stringify(slug)} to be rejected`,
    );
  }
});

test("an empty name is rejected and an unknown category too", () => {
  assert.equal(toolEditorSchema.safeParse({ ...valid, name: "  " }).success, false);
  assert.equal(toolEditorSchema.safeParse({ ...valid, category: "gizmos" }).success, false);
});

test("platform keeps only values the CHECK constraint would accept", () => {
  // The database would reject the write anyway; dropping here means a stale
  // form or a hand-posted value fails quietly rather than 500ing at a reader.
  const result = toolEditorSchema.safeParse({
    ...valid,
    platform: ["macos", "Mac", "haiku-os"],
  });
  assert.ok(result.success);
  assert.deepEqual(result.data.platform, ["macos"]);
});

test("no platforms ticked is an empty array, which reads as unstated", () => {
  const result = toolEditorSchema.safeParse({ ...valid, platform: [] });
  assert.ok(result.success);
  assert.deepEqual(result.data.platform, []);
});

test("an unstated audience is null, not a guess", () => {
  // A tier printed on a real product's page that nobody chose would be the
  // invented fact this column exists to avoid.
  const result = toolEditorSchema.safeParse({ ...valid, best_for: "" });
  assert.ok(result.success);
  assert.equal(result.data.best_for, null);
  assert.equal(toolEditorSchema.safeParse({ ...valid, best_for: "guru" }).success, false);
});

test("an OpenRouter id is optional, and vendor/model when given", () => {
  // Every tool that is not a model has none, and `valid` omits it entirely.
  assert.equal(toolEditorSchema.parse(valid).openrouter_id, null);
  assert.equal(toolEditorSchema.parse({ ...valid, openrouter_id: "  " }).openrouter_id, null);
  assert.equal(
    toolEditorSchema.parse({ ...valid, openrouter_id: " OpenAI/GPT-5.6-Luna " }).openrouter_id,
    "openai/gpt-5.6-luna",
  );
  // The adapter puts this in a URL, so nothing that could walk out of /models/.
  for (const id of ["gpt-5", "../admin", "a/b/c"]) {
    assert.equal(
      toolEditorSchema.safeParse({ ...valid, openrouter_id: id }).success,
      false,
      `expected ${id} to be rejected`,
    );
  }
});
