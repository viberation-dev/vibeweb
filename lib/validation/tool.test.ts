import assert from "node:assert/strict";
import { test } from "node:test";

import { toolEditorSchema } from "./tool.ts";

const valid = {
  announce_revision: null,
  clear_announcement: null,
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
  editor_pick: null,
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
  assert.equal(toolEditorSchema.parse(valid).editor_pick, false);
  assert.equal(toolEditorSchema.parse({ ...valid, editor_pick: "on" }).editor_pick, true);
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

test("skill category and excluded agents are optional and closed", () => {
  const plain = toolEditorSchema.parse(valid);
  assert.equal(plain.skill_category, null);
  assert.deepEqual(plain.skill_agents_excluded, []);

  const skill = toolEditorSchema.parse({
    ...valid,
    skill_category: "design_ui",
    skill_agents_excluded: ["chatgpt", "not-an-agent"],
  });
  assert.equal(skill.skill_category, "design_ui");
  assert.deepEqual(skill.skill_agents_excluded, ["chatgpt"]);

  assert.equal(toolEditorSchema.safeParse({ ...valid, skill_category: "cooking" }).success, false);
});

test("announcing a revision requires a note", () => {
  const parsed = toolEditorSchema.safeParse({
    ...valid,
    announce_revision: "on",
    revision_note: "   ",
  });
  assert.equal(parsed.success, false);
  assert.match(parsed.error!.issues[0].message, /what changed/i);
  assert.deepEqual(parsed.error!.issues[0].path, ["revision_note"]);
});

test("an announced revision resolves to a timestamp and the note", () => {
  const parsed = toolEditorSchema.parse({
    ...valid,
    announce_revision: "on",
    revision_note: "Added Opus 5.5 pricing",
  });
  assert.equal(parsed.revision_note, "Added Opus 5.5 pricing");
  assert.ok(parsed.revised_at, "revised_at is stamped");
});

test("an unticked save omits the revision keys, so an existing announcement survives", () => {
  const parsed = toolEditorSchema.parse({
    ...valid,
    announce_revision: null,
    revision_note: "typed then unticked",
  });
  // Omitted, not null: the update payload must not mention these columns at
  // all, or a plain edit would wipe a previously announced revision.
  assert.equal("revised_at" in parsed, false);
  assert.equal("revision_note" in parsed, false);
});

test("clearing writes both columns as null, which the check constraint requires", () => {
  const parsed = toolEditorSchema.parse({
    ...valid,
    clear_announcement: "on",
  });
  // Null, not omitted: this is the one save that is meant to change these
  // columns back, and tools_revision_pair / content_revision_pair reject a
  // row with one set and the other null.
  assert.equal(parsed.revised_at, null);
  assert.equal(parsed.revision_note, null);
});

test("clearing needs no note of its own", () => {
  // The note refinement guards an announcement. A clear has nothing to say.
  assert.ok(toolEditorSchema.safeParse({ ...valid, clear_announcement: "on" }).success);
});

test("announcing and clearing at once is an error rather than a guess", () => {
  const parsed = toolEditorSchema.safeParse({
    ...valid,
    announce_revision: "on",
    revision_note: "Added Opus 5.5 pricing",
    clear_announcement: "on",
  });
  assert.equal(parsed.success, false);
  assert.deepEqual(parsed.error!.issues[0].path, ["clear_announcement"]);
});

test("an unticked clear_announcement leaves an announcement alone", () => {
  // The box only renders on an already-announced row, and an unticked box
  // posts nothing, so null is the ordinary case. It must read as "keep".
  const parsed = toolEditorSchema.parse({ ...valid, clear_announcement: null });
  assert.equal("revised_at" in parsed, false);
  assert.equal("revision_note" in parsed, false);
});

test("a caller that forgets the field is an error, not a silent keep", () => {
  // How the first version of the clear shipped broken: the save action built
  // its parse input field by field and never read clear_announcement, which
  // an optional field accepted as "keep". The box did nothing, quietly.
  const withoutField: Record<string, unknown> = { ...valid };
  delete withoutField.clear_announcement;
  assert.equal(toolEditorSchema.safeParse(withoutField).success, false);
});
