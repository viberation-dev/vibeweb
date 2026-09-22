# Structured Tool Guides Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a `content` row carry typed authored blocks instead of flat text, and write the first tool guide (Playwright MCP) in that format.

**Architecture:** `content` gains a nullable `blocks jsonb` column; null means render `body` exactly as today. Block schemas are extracted from `lib/validation/walkthrough.ts` into a shared `lib/validation/blocks.ts` that both walkthroughs and guides compose. The renderer is extracted the same way, into `components/features/resource/BlockView.tsx`; the walkthrough renderer keeps only `checklist`, the one kind that needs step context.

**Tech Stack:** Next.js (App Router, RSC), TypeScript, Zod, Supabase Postgres, Tailwind, `node:test` via `node --experimental-strip-types`.

**Spec:** `docs/superpowers/specs/2026-09-22-structured-tool-guides-design.md`

**Linear:** VIB-192. Branch `cre8ivevisionltd/vib-192-structured-tool-guides-starting-with-playwright-mcp` (already created; the spec is already committed on it).

## Global Constraints

- **Test runner is `node:test`, not Jest or Vitest.** `npm test` runs `node --experimental-strip-types --test "**/*.test.ts"`. Single file: `node --experimental-strip-types --test lib/learn.test.ts`.
- **Test imports use explicit `.ts` extensions** (`from "./learn.ts"`). Strip-types requires it. Non-test source uses the `@/` alias with no extension.
- **A `lib/` file that a `node:test` file imports must not use the `@/` alias for a *value* import.** Strip-types does not resolve it and the test fails to run; `import type` is fine because it is erased. Use a relative import and say why in a comment. This binds `lib/validation/guide.ts` (Task 3). It does not bind `.tsx` components, which never run under node:test.
- **Never call `supabase.from(...)` from a component.** Queries live in `lib/queries/`.
- **RLS is the security boundary.** Do not add app-code row filtering as a substitute.
- **One Supabase project serves production and every Vercel preview.** A migration applied on this branch is live for production visitors immediately. This is why the guide row is inserted as a draft in Task 6.
- **Icons are Tabler (`@tabler/icons-react`), never Lucide.**
- **`components/ui/` may be restyled but must not learn product concepts.** `BlockView` goes in `components/features/resource/`, not `components/ui/`.
- **Commit and PR titles carry the issue ID:** `[VIB-192]`.
- **Commit message footer, every commit:**
  ```
  Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
  ```
- **Do not move `CopyButton`, `PromptBlock` or `TabsBlock`.** They live in `components/features/walkthroughs/` and are already imported from `components/features/skills/` and `components/features/tools/`. Importing them from `components/features/resource/` matches that existing precedent. Moving them would touch five more files for zero behaviour change.

---

### Task 1: Add the `blocks` column and regenerate types

**Files:**
- Create: `supabase/migrations/20260922100000_content_blocks.sql`
- Modify: `types/supabase.ts` (regenerated, not hand-edited)

**Interfaces:**
- Consumes: nothing.
- Produces: `Tables<"content">` gains `blocks: Json | null`, which Tasks 4, 5 and 6 rely on.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260922100000_content_blocks.sql`:

```sql
-- Structured guide bodies (VIB-192).
--
-- A guide is mostly commands, config and a fork in the road (install
-- globally or per project?). Those want a copy button, a visible expected
-- result and tabs, none of which survive being flattened into `body`, which
-- renders as preformatted text with no Markdown parser by design.
--
-- Nullable and additive: null means render `body` exactly as before, which
-- is every row that exists today. The shape is validated in
-- lib/validation/guide.ts, not here -- jsonb checks nothing beyond "is this
-- JSON", the same arrangement as wizards.steps.
--
-- No new grant. Migration 20 made Data API exposure opt-in for new *tables*;
-- `content` already has its grants and they cover new columns.
alter table public.content add column blocks jsonb;

comment on column public.content.blocks is
  'Authored blocks (lib/validation/guide.ts). Null means render `body` instead.';
```

- [ ] **Step 2: Apply the migration to the Supabase project**

Apply it with the Supabase `apply_migration` tool against project `gmlifpejccpdnmwuhsde`, name `content_blocks`.

This is safe to apply before merge: it adds a nullable column and no code reads it yet. The preview deployment reads this same database, so the column has to exist there for Task 6 to render at all.

- [ ] **Step 3: Verify the column landed**

Run this SQL against the project:

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'content' and column_name = 'blocks';
```

Expected: one row, `blocks | jsonb | YES`.

- [ ] **Step 4: Regenerate the database types**

Use the Supabase `generate_typescript_types` tool for project `gmlifpejccpdnmwuhsde` and write the result to `types/supabase.ts`.

Then check the diff touches only `content`:

```bash
git diff --stat types/supabase.ts
```

Expected: `blocks: Json | null` added to the content `Row`, and `blocks?: Json | null` to its `Insert` and `Update`. If unrelated tables changed, the generator has picked up drift — stop and report it rather than committing it.

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: passes. Nothing reads `blocks` yet, so this only proves the generated file is well formed.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260922100000_content_blocks.sql types/supabase.ts
```

Commit with this message:

```
feat(content): a blocks column for structured bodies [VIB-192]

Nullable and additive, so every existing row keeps rendering `body`.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 2: Extract the shared block schemas

Pure refactor. `lib/validation/walkthrough.ts` keeps its public exports and its behaviour; the block definitions move so guides can compose them.

**Files:**
- Create: `lib/validation/blocks.ts`
- Modify: `lib/validation/walkthrough.ts:18-120`

**Interfaces:**
- Consumes: nothing.
- Produces, from `lib/validation/blocks.ts`:
  - `textBlock`, `calloutBlock`, `promptBlock`, `codeBlock`, `linksBlock`, `tabsBlock` — Zod object schemas
  - `nestedBlockSchema` — discriminated union of text/callout/prompt/code/links
  - `sharedBlockSchema` — discriminated union of all six kinds including `tabs`
  - `type SharedBlock = z.infer<typeof sharedBlockSchema>`
  - `type NestedBlock = z.infer<typeof nestedBlockSchema>`

  Task 3 composes the guide union from these; Task 4 renders `SharedBlock`.

- [ ] **Step 1: Confirm the existing tests pass before touching anything**

Run: `npm test`
Expected: PASS. This is the baseline the refactor must preserve. If it already fails, stop and report — do not refactor on top of a red suite.

- [ ] **Step 2: Create `lib/validation/blocks.ts`**

Move these out of `lib/validation/walkthrough.ts` **verbatim**, keeping every existing comment: `textBlock`, `calloutBlock`, `promptOption`, `promptBlock`, `codeBlock`, `linkHref`, `linksBlock`, `nestedBlockSchema`, `tabsBlock`. Export each one. Do **not** move `checklistTask`, `checklistBlock`, `walkthroughBlockSchema`, `walkthroughStepSchema` or `walkthroughStepsSchema`.

Head the new file with:

```ts
import { z } from "zod";

/**
 * Authored content blocks, shared by walkthrough steps and guide bodies
 * (VIB-192).
 *
 * These started as `walkthroughs.steps` (§26 §1 taxonomy, MVP subset) and
 * moved here when guides took the same format. A second authoring shape for
 * the same six kinds is the pair that drifts: one of them gains a fix and
 * the other does not, and the bug surfaces in whichever surface nobody was
 * looking at.
 *
 * `checklist` is deliberately *not* here. Its ticks live in
 * `wizard_progress.checklist_state`, keyed by walkthrough and step, so it
 * only makes sense inside a runner. It stays in walkthrough.ts.
 */
```

End the file with:

```ts
/** Every kind both surfaces render. */
export const sharedBlockSchema = z.discriminatedUnion("kind", [
  textBlock,
  calloutBlock,
  promptBlock,
  codeBlock,
  linksBlock,
  tabsBlock,
]);

export type SharedBlock = z.infer<typeof sharedBlockSchema>;
export type NestedBlock = z.infer<typeof nestedBlockSchema>;
```

- [ ] **Step 3: Rewrite `lib/validation/walkthrough.ts` to import them**

Replace the moved definitions with an import, keeping `checklistTask`, `checklistBlock`, `walkthroughBlockSchema`, `walkthroughStepSchema` and `walkthroughStepsSchema` exactly as they are:

```ts
import { z } from "zod";

import {
  calloutBlock,
  codeBlock,
  linksBlock,
  promptBlock,
  tabsBlock,
  textBlock,
  type NestedBlock,
} from "@/lib/validation/blocks";
```

Keep the existing `NestedWalkthroughBlock` export so nothing downstream breaks, now as an alias:

```ts
/** Kept as an alias: the nested set moved to blocks.ts and is shared (VIB-192). */
export type NestedWalkthroughBlock = NestedBlock;
```

`walkthroughBlockSchema` stays a discriminated union of all seven kinds, unchanged.

- [ ] **Step 4: Typecheck and run the tests**

Run: `npm run typecheck && npm test`
Expected: both pass, with no change in test output from Step 1.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: clean. Import ordering is enforced — fix any ordering complaint rather than disabling the rule.

- [ ] **Step 6: Commit**

```
refactor(validation): share the authored block schemas [VIB-192]

Moves the six context-free block kinds out of walkthrough.ts so guide
bodies compose the same shapes. checklist stays behind: its ticks are
keyed by walkthrough and step.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 3: The guide block schema

**Files:**
- Create: `lib/validation/guide.ts`
- Test: `lib/validation/guide.test.ts`

**Interfaces:**
- Consumes: `sharedBlockSchema`, `SharedBlock` from `lib/validation/blocks.ts` (Task 2).
- Produces:
  - `guideBlocksSchema` — `z.array(sharedBlockSchema).min(1)`
  - `toGuideBlocks(value: unknown): GuideBlock[] | null`
  - `type GuideBlock = SharedBlock`

  Tasks 5 and 6 consume `toGuideBlocks` and `GuideBlock`.

- [ ] **Step 1: Write the failing test**

Create `lib/validation/guide.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --experimental-strip-types --test lib/validation/guide.test.ts`
Expected: FAIL — cannot find module `./guide.ts`.

- [ ] **Step 3: Write the implementation**

Create `lib/validation/guide.ts`:

```ts
import { z } from "zod";

/*
 * Relative, not the `@/` alias: guide.test.ts runs under
 * `node --experimental-strip-types`, which does not resolve the alias for a
 * *value* import. Every `@/` import in a tested lib file is `import type`,
 * which strip-types erases; `sharedBlockSchema` is a value. Same constraint
 * lib/changelog.ts records ("Alias-free ... so it runs under plain node --test").
 */
import { sharedBlockSchema, type SharedBlock } from "./blocks";

/**
 * The shape of `content.blocks` (VIB-192).
 *
 * Every shared block kind, and no checklist: a guide has nowhere to save a
 * tick, and one that vanishes on reload is worse than none.
 *
 * jsonb enforces nothing beyond "is this JSON", so this schema is the only
 * thing between an authoring typo in a migration and a visitor's page
 * throwing. Same arrangement as walkthroughStepsSchema.
 */
export const guideBlocksSchema = z.array(sharedBlockSchema).min(1);

export type GuideBlock = SharedBlock;

/**
 * Parses a `content.blocks` column value.
 *
 * Returns null rather than throwing, and null for *any* failure — absent,
 * empty, or malformed. The caller's fallback is `body`, which is a real
 * page; half a rendered guide is not. A row whose blocks do not parse is an
 * authoring bug to fix in a migration, and it should not take the page down
 * on the way.
 */
export function toGuideBlocks(value: unknown): GuideBlock[] | null {
  const parsed = guideBlocksSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --experimental-strip-types --test lib/validation/guide.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: both clean.

- [ ] **Step 6: Commit**

```
feat(content): validate structured guide bodies [VIB-192]

Parses content.blocks, returning null on any failure so the page falls
back to `body` rather than rendering half a guide.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 4: Extract the shared renderer

**Files:**
- Create: `components/features/resource/BlockView.tsx`
- Modify: `components/features/walkthroughs/WalkthroughBlocks.tsx:1-155`

**Interfaces:**
- Consumes: `SharedBlock`, `NestedBlock` from `lib/validation/blocks.ts` (Task 2).
- Produces: `BlockView({ block }: { block: SharedBlock | NestedBlock })` — a server component rendering one block with no walkthrough context. Task 5 renders guide blocks through it.

This is the riskiest task in the plan: it touches the live walkthrough runner, which has saved user progress behind it. The block kinds are a discriminated union, so a kind dropped in the move fails `npm run typecheck` rather than silently rendering blank.

- [ ] **Step 1: Create `components/features/resource/BlockView.tsx`**

Move the `text`, `callout`, `prompt`, `code`, `links` and `tabs` cases out of `WalkthroughBlockView` **verbatim** — same markup, same Tailwind classes, same `CALLOUT_TONES` and `CALLOUT_LABELS` constants. The only change is that the `tabs` case recurses into `BlockView` instead of `WalkthroughBlockView`.

```tsx
import { IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";

import { CopyButton } from "@/components/features/walkthroughs/CopyButton";
import { PromptBlock } from "@/components/features/walkthroughs/PromptBlock";
import { TabsBlock } from "@/components/features/walkthroughs/TabsBlock";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NestedBlock, SharedBlock } from "@/lib/validation/blocks";

const CALLOUT_TONES = {
  info: "border-l-primary bg-muted/40",
  tip: "border-l-primary bg-muted/40",
  warning: "border-l-destructive bg-destructive/5",
} as const;

const CALLOUT_LABELS = {
  info: "Note",
  tip: "Tip",
  warning: "Careful",
} as const;

/**
 * Renders one authored block that needs no surrounding context (VIB-192).
 *
 * Every kind except `checklist`, which needs a walkthrough slug and step to
 * save a tick against and stays in WalkthroughBlocks.tsx. Guides render
 * entirely through here.
 *
 * Imports CopyButton, PromptBlock and TabsBlock from features/walkthroughs/
 * rather than moving them: features/skills/ and features/tools/ already
 * import CopyButton from there, so this matches the existing arrangement
 * instead of churning five files.
 */
export function BlockView({ block }: { block: SharedBlock | NestedBlock }) {
  switch (block.kind) {
    case "text":
      return <p className="leading-relaxed whitespace-pre-line">{block.body}</p>;

    case "callout":
      return (
        <aside className={cn("rounded-r-lg border-l-4 p-4", CALLOUT_TONES[block.tone])}>
          <p className="text-xs font-medium tracking-wide uppercase">
            {CALLOUT_LABELS[block.tone]}
          </p>
          <p className="mt-1 leading-relaxed whitespace-pre-line">{block.body}</p>
        </aside>
      );

    case "prompt":
      return <PromptBlock label={block.label} prompt={block.prompt} prompts={block.prompts} />;

    case "code":
      return (
        <div className="rounded-lg border">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
            <p className="font-mono text-xs text-muted-foreground">{block.language}</p>
            <CopyButton text={block.code} />
          </div>
          <pre className="overflow-x-auto px-4 py-3 font-mono text-sm">
            <code>{block.code}</code>
          </pre>
          {block.expected ? (
            <div className="border-t px-4 py-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                What you should see
              </p>
              <pre className="mt-1 overflow-x-auto font-mono text-sm whitespace-pre-wrap">
                <code>{block.expected}</code>
              </pre>
            </div>
          ) : null}
        </div>
      );

    case "links":
      return (
        <ul className="flex flex-wrap gap-2">
          {block.links.map((link) => (
            <li key={link.href}>
              {link.href.startsWith("/") ? (
                <Link
                  href={link.href}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {link.label}
                  <IconExternalLink aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      );

    case "tabs":
      return (
        <TabsBlock
          label={block.label}
          detect={block.detect}
          tabs={block.tabs.map((tab) => ({
            key: tab.key,
            title: tab.title,
            content: tab.blocks.map((inner, i) => <BlockView key={i} block={inner} />),
          }))}
        />
      );
  }
}
```

- [ ] **Step 2: Reduce `WalkthroughBlockView` to checklist plus delegation**

In `components/features/walkthroughs/WalkthroughBlocks.tsx`, delete the six moved cases and the now-unused `CALLOUT_TONES`, `CALLOUT_LABELS`, `IconExternalLink`, `CopyButton`, `PromptBlock`, `TabsBlock` and `buttonVariants` imports. Keep `toggleTaskAction`, `Link` and `cn`, which the checklist case still uses. Add the `BlockView` import.

The function becomes:

```tsx
export function WalkthroughBlockView({
  block,
  walkthroughSlug,
  stepIndex,
  checklistState,
  canSave,
}: Props) {
  // Every other kind is context-free and shared with guides (VIB-192).
  if (block.kind !== "checklist") return <BlockView block={block} />;

  return (
    // ...the existing checklist markup, unchanged...
  );
}
```

Keep the existing checklist body exactly as it is, including the server-action form, the signed-out sign-in prompt and their comments. `WalkthroughNav` below it is untouched.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: passes. If a block kind was dropped in the move, the discriminated union makes this fail here — that is the check doing its job.

- [ ] **Step 4: Run the full test suite and lint**

Run: `npm test && npm run lint`
Expected: all pass, unchanged from Task 2's baseline.

- [ ] **Step 5: Verify the walkthrough runner still renders**

Start the dev server with `preview_start` and open `/walkthroughs/add-a-database-with-supabase?step=5`. That step has a `tabs` block (Vercel / Netlify / Cloudflare), a `code` block with an `expected` result, a `prompt` block with multiple options and a `checklist` — every kind except `links` on one screen.

Check: tabs switch, the copy button copies, the expected-result panel shows, and the checklist ticks (sign in first, or confirm the signed-out prompt appears).

- [ ] **Step 6: Commit**

```
refactor(ui): share the block renderer with guides [VIB-192]

WalkthroughBlockView keeps checklist, the one kind that needs a slug and
step to save against, and delegates the rest. Two renderers for the same
kinds is the pair that drifts.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 5: Render blocks on the Learn detail page and in card previews

**Files:**
- Modify: `lib/learn.ts:134-155` (`contentPreview`)
- Modify: `lib/resource-view.ts:70`
- Modify: `app/(site)/learn/[slug]/page.tsx:145-165`
- Test: `lib/learn.test.ts`

**Interfaces:**
- Consumes: `toGuideBlocks` (Task 3), `BlockView` (Task 4).
- Produces: `contentPreview(type, body, blocks?)` — third parameter optional, so no existing call site breaks.

- [ ] **Step 1: Write the failing tests**

Add to `lib/learn.test.ts`:

```ts
test("a blocks-only guide previews its first text block", () => {
  // Guides authored as blocks have no `body`, and a card with no preview
  // line is a card with a hole in it.
  assert.equal(
    contentPreview("guide", null, [
      { kind: "callout", tone: "info", body: "Runs on your own machine." },
      {
        kind: "text",
        body: "Playwright MCP lets your agent drive a real browser.\n\nSecond paragraph.",
      },
    ]),
    "Playwright MCP lets your agent drive a real browser.",
  );
});

test("a body wins over blocks when both are present", () => {
  assert.equal(
    contentPreview("guide", "The stored body.", [{ kind: "text", body: "A block." }]),
    "The stored body.",
  );
});

test("blocks with no text block preview nothing", () => {
  assert.equal(
    contentPreview("guide", null, [
      { kind: "code", language: "bash", code: "npx @playwright/mcp@latest" },
    ]),
    null,
  );
  assert.equal(contentPreview("guide", null, "not an array"), null);
  assert.equal(contentPreview("guide", null, null), null);
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `node --experimental-strip-types --test lib/learn.test.ts`
Expected: FAIL — `contentPreview` takes two arguments, so the third is ignored and the blocks cases return null where a string is expected.

- [ ] **Step 3: Implement the fallback**

In `lib/learn.ts`, replace `contentPreview`. Keep the existing doc comment and extend it:

```ts
/**
 * The one-line preview a card shows under the title.
 *
 * Prose gets its opening paragraph with whitespace collapsed. A cheatsheet
 * gets only its first *line*: its "first paragraph" is the whole reference
 * table, and collapsing that runs the columns together into a wall of words
 * — "git status what is actually changed right now git diff what changed…".
 * One line of a cheatsheet still reads as a sentence.
 *
 * A guide authored as blocks has no `body` at all (VIB-192), so it falls
 * back to the first `text` block. Blocks are read structurally rather than
 * through the Zod schema: this runs for every card in a 24-row index, and a
 * preview line is not worth parsing a whole guide for. A row whose blocks
 * are malformed previews nothing, which is what it did before.
 */
export function contentPreview(
  type: ContentType,
  body: string | null,
  blocks?: unknown,
): string | null {
  const source = body?.trim() ? body : firstTextBlockBody(blocks);
  if (!source) return null;

  const trimmed = source.trim();
  const opening =
    type === "cheatsheet" ? trimmed.split("\n")[0] : trimmed.split("\n\n")[0];
  const collapsed = opening.replace(/\s+/g, " ").trim();

  if (!collapsed) return null;
  return collapsed.length > 160
    ? `${collapsed.slice(0, 157).trimEnd()}…`
    : collapsed;
}

/** The body of the first `text` block, or null. Structural, not validated. */
function firstTextBlockBody(blocks: unknown): string | null {
  if (!Array.isArray(blocks)) return null;
  for (const block of blocks) {
    if (block?.kind === "text" && typeof block.body === "string") {
      return block.body;
    }
  }
  return null;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --experimental-strip-types --test lib/learn.test.ts`
Expected: PASS, including the four pre-existing `contentPreview` tests, which must be unchanged.

- [ ] **Step 5: Pass blocks through from the card view**

In `lib/resource-view.ts`, change line 70 and extend the comment above it:

```ts
    // `content` has no tagline column, so the preview is drawn from the body
    // rather than a second stored field — or from the blocks, for a guide
    // authored without one (VIB-192).
    description: contentPreview(item.type, item.body, item.blocks),
```

- [ ] **Step 6: Render blocks on the detail page**

In `app/(site)/learn/[slug]/page.tsx`, add the imports:

```tsx
import { BlockView } from "@/components/features/resource/BlockView";
import { toGuideBlocks } from "@/lib/validation/guide";
```

Above the return, derive the blocks:

```tsx
  const blocks = toGuideBlocks(item.blocks);
```

Replace the `{item.body ? (...) : null}` expression with:

```tsx
      {blocks ? (
        <div className="mt-6 flex flex-col gap-5">
          {blocks.map((block, i) => (
            <BlockView key={i} block={block} />
          ))}
        </div>
      ) : item.body ? (
        /*
         * ponytail: bodies render as preformatted text, not Markdown — no
         * parser, no sanitiser, no new dependency, and nothing an author can
         * type becomes HTML. Structured guides (VIB-192) take the branch
         * above instead; this is still how every prose row renders.
         *
         * pre-wrap, not pre-line: pre-line collapses runs of spaces, which
         * is exactly what a cheatsheet uses to line its columns up. And
         * columns only line up in a fixed-width font, so cheatsheets get one.
         */
        <div
          className={cn(
            "mt-6 whitespace-pre-wrap",
            item.type === "cheatsheet"
              ? "font-mono text-sm leading-6"
              : "leading-relaxed",
          )}
        >
          {item.body}
        </div>
      ) : null}
```

Leave the `plainSummary(item.body)` calls in `generateMetadata` and the structured data exactly as they are. A blocks-only guide would get no meta description, which Task 6's row avoids by carrying a short `body` as well.

- [ ] **Step 7: Typecheck, test and lint**

Run: `npm run typecheck && npm test && npm run lint`
Expected: all clean.

- [ ] **Step 8: Commit**

```
feat(learn): render structured guide bodies [VIB-192]

Blocks take the page when present, `body` otherwise, so every existing
row is untouched. Card previews fall back to the first text block.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 6: Write the Playwright MCP guide

**Files:**
- Create: `supabase/migrations/20260922110000_playwright_mcp_guide.sql`
- Modify: `lib/changelog.ts`

**Interfaces:**
- Consumes: the `blocks` column (Task 1), the schema (Task 3), the renderer (Tasks 4–5).
- Produces: a `content` row at `/learn/playwright-mcp-guide`.

**Why the row is a draft:** one Supabase project serves production and every preview. A published row appears on the live site the moment the migration runs, before the renderer has merged. RLS hides drafts from non-staff and shows them to staff at their own URL, so the preview deployment renders it for review while production sees nothing. It is published in Task 7, after merge.

**Before writing:** re-verify every command against <https://github.com/microsoft/playwright-mcp>. The commands below were taken from that README on 2026-09-22; if it now differs, the README wins and the guide changes to match.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260922110000_playwright_mcp_guide.sql`. `body` is a short plain summary kept alongside the blocks so `generateMetadata` still has a description; the blocks are the page.

Note the doubled single quotes inside the JSON (`Cursor''s`, and around the `code --add-mcp` argument) — that is SQL string escaping, not a typo.

```sql
-- Guide: Playwright MCP, the first structured tool guide (VIB-192).
--
-- Inserted as a draft on purpose. One Supabase project serves production and
-- every preview, so a published row would appear on the live site before the
-- renderer merges. RLS hides drafts from non-staff, so the preview
-- deployment renders it for review while production sees nothing. A
-- follow-up migration publishes it once this is merged.
--
-- `body` is kept as a short plain summary even though `blocks` is the page:
-- generateMetadata and the structured data still read body, and a guide with
-- no meta description is a guide search engines describe badly.
insert into content (type, title, slug, body, role_level, pillar, status, blocks) values
(
  'guide',
  'Playwright MCP without burning your context window',
  'playwright-mcp-guide',
  'Playwright MCP lets your AI tool drive a real browser: clicking, filling forms and reading what is actually on the page. Installing it takes one command. Using it without eating your whole context window takes a little more, and that is the part nobody tells you.',
  'beginner',
  'tool_reviews',
  'draft',
  '[
    {"kind": "text", "body": "Your AI tool can write a login form. It cannot normally tell you whether the form works, because it cannot see your site. It is reasoning from the code.\n\nPlaywright MCP closes that gap. It gives your tool a real browser it can drive: open a page, click a button, fill a field, read what came back. When it says the checkout works, it has been through the checkout."},
    {"kind": "text", "body": "Worth it when you are debugging something you can only see in a browser, checking a change actually rendered, or filling in the same test form for the twentieth time.\n\nNot worth it for writing code, explaining an error, or anything where the answer is already in the files. It is a browser, not a brain, and every page it reads costs you context."},
    {"kind": "callout", "tone": "info", "body": "MCP stands for Model Context Protocol. It is a standard way to plug a tool into an AI assistant. You do not need to understand the protocol to use it, any more than you need to understand HTTP to open a website."},
    {"kind": "tabs", "label": "Install it in", "tabs": [
      {"key": "claude-code", "title": "Claude Code", "blocks": [
        {"kind": "text", "body": "One command, run in your terminal."},
        {"kind": "code", "language": "bash", "code": "claude mcp add playwright npx @playwright/mcp@latest", "expected": "A line confirming the server was added. Restart Claude Code, then run /mcp to see playwright listed as connected."},
        {"kind": "text", "body": "That adds it for your user account, so every project gets it. To add it to one project only, so your team gets it through git, add --scope project:"},
        {"kind": "code", "language": "bash", "code": "claude mcp add --scope project playwright npx @playwright/mcp@latest", "expected": "The same confirmation, and a .mcp.json file in your project folder. Commit that file."}
      ]},
      {"key": "cursor", "title": "Cursor", "blocks": [
        {"kind": "text", "body": "Open Cursor Settings, then MCP, then Add new MCP Server. Give it the name playwright and the command npx @playwright/mcp@latest.\n\nIf you would rather edit the file directly, that panel is writing this:"},
        {"kind": "code", "language": "json", "code": "{\n  \"mcpServers\": {\n    \"playwright\": {\n      \"command\": \"npx\",\n      \"args\": [\"@playwright/mcp@latest\"]\n    }\n  }\n}", "expected": "Playwright appears in Cursor''s MCP list with a green dot once it connects."},
        {"kind": "text", "body": "Put that in ~/.cursor/mcp.json for every project, or .cursor/mcp.json inside one project for just that one."}
      ]},
      {"key": "vs-code", "title": "VS Code", "blocks": [
        {"kind": "text", "body": "One command, run in your terminal."},
        {"kind": "code", "language": "bash", "code": "code --add-mcp ''{\"name\":\"playwright\",\"command\":\"npx\",\"args\":[\"@playwright/mcp@latest\"]}''", "expected": "VS Code confirms the server was added. Reload the window and Playwright appears in the MCP servers list."}
      ]}
    ]},
    {"kind": "callout", "tone": "tip", "body": "The first run downloads a browser, so give it a minute and do not panic at the pause. After that it starts in seconds.\n\nYou need Node.js installed. If npx is not a command your terminal knows, install Node first."},
    {"kind": "text", "body": "Check it works. Ask your tool to do something small and verifiable:"},
    {"kind": "prompt", "label": "Copy this into your AI tool", "prompt": "Using Playwright, open example.com and tell me exactly what the main heading says.", "prompts": [
      {"title": "Check it works", "prompt": "Using Playwright, open example.com and tell me exactly what the main heading says."},
      {"title": "Check my own site", "prompt": "Using Playwright, open http://localhost:3000 and tell me what you see. If anything looks broken, or an error appears in the console, describe it before suggesting a fix."},
      {"title": "Fill in a form", "prompt": "Using Playwright, open [your page], fill in the form with sensible test values, submit it, and tell me what happened. Do not use real personal details."}
    ]},
    {"kind": "text", "body": "It should open a browser window, read the page and answer \"Example Domain\". If it answers without opening anything, it is working from memory and the server is not connected. Check the MCP list in your tool."},
    {"kind": "callout", "tone": "warning", "body": "This is the part that costs you money and patience.\n\nEvery time your tool looks at a page, it reads a text description of the whole thing. On a real app that can be thousands of tokens, and it does it again after every single click. Three or four page reads can fill more of your context window than the entire codebase you are working on. People blame the model for going vague halfway through a session; usually it is this."},
    {"kind": "text", "body": "Four habits that fix it.\n\n1. Ask for what you need, not for everything. \"Find the submit button\" uses a search that returns a few lines. \"Look at the page\" returns the whole thing. Say what you are after.\n\n2. Skip screenshots unless you need to see it. An image costs far more than the text description, and for \"did this button move\" the text already answers you. Ask for a screenshot when the question is genuinely visual.\n\n3. Close the tab when you are done. Tabs left open keep showing up in what your tool reads.\n\n4. Start a fresh session after a long browser stretch. Once the context is full of stale page snapshots, clearing it is faster than fighting it."},
    {"kind": "text", "body": "If you are doing a lot of browser work, the server has flags for this. Turning image responses off stops screenshots eating the budget:"},
    {"kind": "code", "language": "bash", "code": "claude mcp add playwright npx @playwright/mcp@latest --image-responses omit", "expected": "The same confirmation. Your tool now works from text descriptions only, which is what you want for most debugging."},
    {"kind": "text", "body": "Add --headless to stop a browser window popping up, and --isolated to throw away cookies and logins between runs rather than keeping a profile on disk."},
    {"kind": "callout", "tone": "warning", "body": "It really does drive a real browser as you. If you point it at a site you are logged into, it can act as you there: click things, submit things, buy things. Keep it on sites you own or test accounts you do not mind breaking, and read what it is about to do before approving it. --isolated is a good default for this reason."},
    {"kind": "text", "body": "When it goes wrong, it is usually one of three things.\n\nNothing happens and your tool answers from memory. The server is not connected. Check the MCP list in your tool, and restart it after installing.\n\nnpx: command not found. Node.js is not installed, or not on your PATH. Install Node and open a new terminal.\n\nIt opens the page but sees nothing useful. The page is probably still loading. Ask it to wait for a specific piece of text to appear before reading."},
    {"kind": "links", "links": [
      {"label": "Playwright MCP in the directory", "href": "/tools/playwright-mcp"},
      {"label": "Official documentation", "href": "https://github.com/microsoft/playwright-mcp"},
      {"label": "More MCP servers", "href": "/tools?category=mcp_servers"}
    ]}
  ]'::jsonb
)
on conflict (slug) do update set
  title      = excluded.title,
  body       = excluded.body,
  role_level = excluded.role_level,
  pillar     = excluded.pillar,
  blocks     = excluded.blocks,
  updated_at = now();

-- Tagged narrowly. The related-reading query on a tool page matches *any*
-- shared facet tag, so tagging this `official` would surface it on dozens of
-- unrelated tools. local-mcp and testing are the two Playwright MCP carries
-- that actually describe this guide.
insert into content_tags (content_id, tag_id)
select c.id, t.id
from content c
join tags t on t.slug in ('local-mcp', 'testing')
where c.slug = 'playwright-mcp-guide'
on conflict do nothing;
```

- [ ] **Step 2: Apply the migration**

Apply it with the Supabase `apply_migration` tool against project `gmlifpejccpdnmwuhsde`, name `playwright_mcp_guide`.

- [ ] **Step 3: Verify the row parses**

```sql
select slug, status, jsonb_array_length(blocks) as block_count,
       jsonb_path_query_array(blocks, '$[*].kind') as kinds
from content where slug = 'playwright-mcp-guide';
```

Expected: one row, `draft`, 16 blocks, kinds including `text`, `callout`, `tabs`, `prompt`, `code` and `links`.

Then confirm the tags attached:

```sql
select t.slug from content c
join content_tags ct on ct.content_id = c.id
join tags t on t.id = ct.tag_id
where c.slug = 'playwright-mcp-guide';
```

Expected: `local-mcp` and `testing`. An empty result means those tag slugs do not exist — check `select slug from tags order by slug` and fix the migration rather than leaving the guide untagged.

- [ ] **Step 4: Add the changelog entry**

Add a new entry at the top of the `CHANGELOG` array in `lib/changelog.ts`. This is a new feature, so it gets one — the repo rule is that the entry ships in the same PR as the change.

```ts
  {
    date: "2026-09-22",
    kind: "added",
    title: "Guides you can follow along with",
    body: "Guides can now include commands you can copy, tabs for your own setup, and what to expect when a command works. The first one covers Playwright MCP.",
  },
```

Two rules from that file apply: no issue IDs in the body, and the date is the **merge** date, not today's. If the PR merges on a later day, correct the date before merging.

Note the existing top entry is also dated 2026-09-22 (Desktop Apps). Two entries sharing a date is fine — the array is ordered, not grouped.

- [ ] **Step 5: Verify it renders**

Sign in as staff (drafts are staff-only), start the dev server with `preview_start` and open `/learn/playwright-mcp-guide`.

Check: the install tabs switch between Claude Code, Cursor and VS Code; every code block copies; the "What you should see" panels appear; the prompt block's three options are selectable; the two outbound links open in a new tab and the `/tools/playwright-mcp` link stays in-site.

- [ ] **Step 6: Typecheck, test, lint and build**

Run: `npm run typecheck && npm test && npm run lint && npm run build`
Expected: all clean. The build is worth running here because this is the last task before the PR and CI runs it anyway.

- [ ] **Step 7: Commit**

```
feat(learn): a Playwright MCP guide, the first structured one [VIB-192]

Inserted as a draft: one Supabase project serves production and every
preview, so it publishes after merge.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

### Task 7: Open the PR, then publish after merge

**Files:**
- Create (after merge): `supabase/migrations/20260922120000_publish_playwright_mcp_guide.sql`

- [ ] **Step 1: Push and open the PR**

```bash
git push -u origin cre8ivevisionltd/vib-192-structured-tool-guides-starting-with-playwright-mcp
```

Open a PR titled `feat(learn): structured tool guides, starting with Playwright MCP [VIB-192]`.

The description covers: what the format is and why it reuses the walkthrough blocks; that `blocks` is nullable so the 17 existing rows are untouched; that the renderer extraction touches the live walkthrough runner and how it was checked; that the guide row is a draft until merge and why. End it with:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

- [ ] **Step 2: Wait for CI and the preview URL**

Lint, typecheck and build run on every PR. Give Ali the preview URL — that link is how he reviews. Point him at `/walkthroughs/add-a-database-with-supabase?step=5` as well as the guide, since that is the page the refactor could have broken.

- [ ] **Step 3: After merge, publish the guide**

Create `supabase/migrations/20260922120000_publish_playwright_mcp_guide.sql`:

```sql
-- Publish the Playwright MCP guide now the renderer is on production
-- (VIB-192). Held back as a draft until merge because one Supabase project
-- serves production and every preview.
update content set status = 'published', updated_at = now()
where slug = 'playwright-mcp-guide';
```

Apply it, then confirm on production that `/learn/playwright-mcp-guide` renders signed out, that the card appears on `/learn` with a preview line, and that the guide shows under Related reading on `/tools/playwright-mcp`.

If it does *not* appear under Related reading, that is the tag-based discovery being too weak — the spec's fallback is a `tool_id` column, which is a separate issue, not a fix to squeeze in here.

- [ ] **Step 4: Set VIB-192 to Done in Linear**

By hand — merging does not move it.

---

## Guides two onward

Each later guide is one migration adding one row, plus a changelog line. No code. Ordering suggestion, highest traffic first: Supabase MCP Server, GitHub MCP Server, Claude Code, Gemini CLI, then the editor plugins.

If three guides in a row want the same block kind that does not exist yet, that is the signal to add one — not before.
