import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
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

test("every guide authored in a migration survives this schema", () => {
  /*
   * The failure this catches is silent: toGuideBlocks returns null for any
   * validation error and the page falls back to rendering plain `body`, so a
   * typo in a migration ships a guide that looks like one paragraph of
   * summary text and raises nothing anywhere. Cheaper to fail here.
   *
   * Reads the jsonb literal out of each migration that writes `blocks`, and
   * undoubles SQL's escaped apostrophes on the way.
   */
  const dir = new URL("../../supabase/migrations/", import.meta.url);
  let checked = 0;

  for (const name of readdirSync(dir).filter((f) => f.endsWith(".sql"))) {
    const sql = readFileSync(new URL(name, dir), "utf8");

    // Split on the closing delimiter and take what follows each opening one:
    // the literals span hundreds of lines, and a regex over that is a thing
    // nobody wants to debug at 3am.
    for (const chunk of sql.split("]'::jsonb").slice(0, -1)) {
      /*
       * `'[\n` specifically. A one-line `'[{"kind": "tabs", ...}]'::jsonb` is
       * a `@>` containment operand — a fragment matching one block, not a
       * guide — and it fails this schema by design, since it carries only the
       * fields being matched on.
       */
      const open = chunk.lastIndexOf("'[\n");
      if (open === -1) continue;

      const raw = `${chunk.slice(open + 1)}]`.replaceAll("''", "'");
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // Not a blocks array — some migrations carry other jsonb literals.
        continue;
      }
      if (!Array.isArray(parsed) || !parsed.every((b) => typeof b?.kind === "string")) continue;

      assert.ok(toGuideBlocks(parsed), `${name}: blocks rejected, the guide would render as body`);
      checked += 1;
    }
  }

  assert.ok(checked > 0, "found no authored blocks — has the migration format changed?");
});
