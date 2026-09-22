import assert from "node:assert/strict";
import { test } from "node:test";

import { toGuideBlocks } from "./guide.ts";

test("a guide accepts every shared block kind", () => {
  const blocks = toGuideBlocks([
    { kind: "text", body: "Playwright MCP drives a real browser." },
    { kind: "callout", tone: "warning", body: "It runs on your machine." },
    {
      kind: "code",
      language: "bash",
      code: "npx @playwright/mcp@latest --help",
      expected: "A list of options.",
    },
    { kind: "prompt", label: "Try it", prompt: "Open example.com and read the heading." },
    {
      kind: "links",
      links: [{ label: "Docs", href: "https://github.com/microsoft/playwright-mcp" }],
    },
    {
      kind: "tabs",
      label: "Your tool",
      tabs: [
        { key: "claude-code", title: "Claude Code", blocks: [{ kind: "text", body: "One command." }] },
        { key: "vs-code", title: "VS Code", blocks: [{ kind: "text", body: "One command." }] },
      ],
    },
  ]);

  assert.ok(blocks);
  assert.equal(blocks.length, 6);
  assert.equal(blocks[0].kind, "text");
});

test("a checklist block is not a guide block", () => {
  // Ticks live in wizard_progress.checklist_state, keyed by walkthrough and
  // step. A guide has no such store, so a tick would vanish on reload.
  assert.equal(
    toGuideBlocks([{ kind: "checklist", tasks: [{ id: "done", label: "Installed it" }] }]),
    null,
  );
});

test("a malformed block rejects the whole array", () => {
  // Half a guide is worse than falling back to `body`.
  assert.equal(toGuideBlocks([{ kind: "code" }]), null);
  assert.equal(
    toGuideBlocks([{ kind: "links", links: [{ label: "Bad", href: "javascript:alert(1)" }] }]),
    null,
  );
});

test("absent or empty blocks are null, not an error", () => {
  assert.equal(toGuideBlocks(null), null);
  assert.equal(toGuideBlocks(undefined), null);
  assert.equal(toGuideBlocks([]), null);
  assert.equal(toGuideBlocks("not an array"), null);
});
