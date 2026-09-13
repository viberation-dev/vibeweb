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

test("OpenRouter family and featured model are optional, and shaped when given", () => {
  // Every tool that is not a model has neither, and `valid` omits both.
  const plain = toolEditorSchema.parse(valid);
  assert.equal(plain.openrouter_family, null);
  assert.equal(plain.openrouter_id, null);

  const model = toolEditorSchema.parse({
    ...valid,
    openrouter_family: " OpenAI/GPT ",
    openrouter_id: " OpenAI/GPT-5.6-Luna ",
  });
  assert.equal(model.openrouter_family, "openai/gpt");
  assert.equal(model.openrouter_id, "openai/gpt-5.6-luna");

  // The adapter puts these in URLs, so nothing that could walk out of /models/.
  for (const family of ["gpt", "../admin", "a/b/c", "openai/gpt:free"]) {
    assert.equal(
      toolEditorSchema.safeParse({ ...valid, openrouter_family: family }).success,
      false,
      `expected ${family} to be rejected`,
    );
  }
});

test("a featured model must belong to its family", () => {
  assert.equal(
    toolEditorSchema.safeParse({
      ...valid,
      openrouter_family: "anthropic/claude",
      openrouter_id: "openai/gpt-5.6-luna",
    }).success,
    false,
  );
  // A featured model with no family has nothing to belong to.
  assert.equal(
    toolEditorSchema.safeParse({ ...valid, openrouter_id: "anthropic/claude-sonnet-5" }).success,
    false,
  );
  // A family alone is fine: the page then leads with the newest model.
  assert.ok(toolEditorSchema.safeParse({ ...valid, openrouter_family: "anthropic/claude" }).success);
});

test("skills.sh source is optional, keeps its case, and is shaped when given", () => {
  assert.equal(toolEditorSchema.parse(valid).skills_sh_source, null);
  assert.equal(
    toolEditorSchema.parse({ ...valid, skills_sh_source: " Leonxlnx/taste-skill " }).skills_sh_source,
    "Leonxlnx/taste-skill",
  );
  assert.equal(
    toolEditorSchema.parse({ ...valid, skills_sh_source: "anthropics/skills/frontend-design" })
      .skills_sh_source,
    "anthropics/skills/frontend-design",
  );
  // The adapter puts this in a URL, so nothing that could walk out of /skills/.
  for (const source of ["skills", "../admin/x", "a/b/c/d", "https://skills.sh/a/b"]) {
    assert.equal(
      toolEditorSchema.safeParse({ ...valid, skills_sh_source: source }).success,
      false,
      `expected ${source} to be rejected`,
    );
  }
});
