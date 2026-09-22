# Structured tool guides

Design, 2026-09-22.

A series of beginner guides to individual tools in the directory — Playwright
MCP first, then other MCP servers, CLIs and editor plugins. Each guide answers
the questions a beginner actually arrives with: what is this, how do I install
it, how do I use it, and how do I stop it burning my context window.

This document covers the format those guides are written in and the first one.
The series after that is content, not engineering: each later guide is a
migration adding one row.

## Why a structured format

Guide bodies today are plain preformatted text. `content.body` is a `text`
column and `/learn/[slug]` renders it inside `whitespace-pre-wrap` with no
Markdown parser, deliberately — there is no sanitiser and nothing an author
types can become HTML.

That holds up for prose. It does not hold up for a tool guide, which is mostly
commands, config, and a fork in the road (install globally or per project?).
Those want a copy button, a visible expected result, and tabs. Written as flat
text they read as a wall.

## Reuse the walkthrough block schema

`walkthroughs.steps` already stores authored content as typed blocks —
`text`, `callout`, `code` (with an `expected` result), `prompt`, `links`,
`tabs`, `checklist` — validated in `lib/validation/walkthrough.ts` and
rendered by `components/features/walkthroughs/WalkthroughBlocks.tsx`.

That is the structured format, already built, already tested, already
understood by whoever reads this repo next. Guides use the same block kinds
rather than a second authoring shape.

Guides take every kind except `checklist`. A checklist tick is stored in
`wizard_progress.checklist_state`, which is keyed by walkthrough and step;
guides have no such store, and ticks that vanish on reload are worse than no
ticks at all.

`tabs` earns its place on day one: global versus project install is exactly
that shape.

## Schema change

One migration, one statement:

```sql
alter table content add column blocks jsonb;
```

`blocks` null means render `body` exactly as today. Non-null means render
blocks. Every one of the 17 existing rows keeps working untouched, and the
column is nullable and additive, so this is not a breaking migration and does
not need to be timed against a deploy.

No new grant is needed. The migration-20 rule (`public` no longer grants
`anon` and `authenticated` on new tables automatically) applies to new tables;
`content` already has its grants and they cover new columns.

No `tool_id` foreign key. Tool pages already surface related content:
`listContentSharingTags` pulls published Learn rows sharing *facet* tags with
the tool, rendered under "Related reading". Playwright MCP carries the facet
tags `local-mcp` and `testing`, so tagging the guide the same way surfaces it
with no schema change at all.

That is deliberately the weaker option. A dedicated `tool_id` with a "Read the
guide" link would be more prominent and would not depend on tagging a row
correctly. It is a one-column migration to add later, once there is a real
guide on a preview URL to judge prominence against. Adding it now would be
guessing.

Tagging note: the related-reading query matches *any* shared facet tag, so a
guide tagged `official` would appear on dozens of unrelated tool pages. Guides
are tagged narrowly — for the first one, `local-mcp` and `testing`, not
`official`.

## Renderer

`WalkthroughBlockView` takes `walkthroughSlug`, `stepIndex`, `checklistState`
and `canSave`. A guide has none of those.

The six shared kinds move to `components/features/resource/BlockView.tsx`,
taking only the block. The walkthrough renderer keeps `checklist` — the one
kind that genuinely needs step context — and delegates everything else.

The alternative, a second renderer for the same seven block kinds, is the
version that drifts. One of them gains a fix and the other does not, and the
bug surfaces a year later in whichever surface nobody was looking at.

This is the risk in the change. The extraction touches the live walkthrough
runner, which is a shipped feature with saved user progress behind it. The
block kinds are a discriminated union, so a kind dropped in the move fails the
typecheck rather than rendering blank, and `lib/walkthroughs.test.ts` already
covers the runner's navigation and progress maths.

## Where a guide surfaces

- `/learn/[slug]` renders `blocks` when present, `body` when not
- Tool pages, under "Related reading", via shared facet tags
- `/learn` index and search, as any guide does today

`contentPreview` in `lib/learn.ts` reads `body` for the one-line card preview
and returns null when it is empty. A blocks-only guide would render a card
with no preview line, so it gains a fallback: the first `text` block's opening
paragraph, run through the same collapse-and-truncate.

## Authoring

Guide bodies are written in migrations, the way walkthrough steps already are
(`20260916130000_walkthrough_idea_prompts.sql` and the rest).

The admin content editor is not extended. `contentEditorSchema` does not
mention `blocks`, so the editor keeps working unchanged for the plain-text
types, and a structured guide is out of its reach. Building a block editor is
a real feature with its own design; it is not part of writing a guide series,
and an editor with no content to edit is the wrong order.

## The first guide — Playwright MCP

Slug `playwright-mcp-guide`, type `guide`, pillar `tool_reviews`, role level
`beginner`, tagged `local-mcp` and `testing`.

Outline:

1. **What it is, and when you want it** — prose. Your agent drives a real
   browser: clicking, filling forms, reading what is actually on the page. The
   honest version of when that helps and when it is overkill.
2. **Install** — `tabs`, one per host (Claude Code, Cursor, VS Code), each
   with a `code` block. Global versus project covered inside each tab, since
   the answer differs by host.
3. **Check it worked** — a `code` block with an `expected` result, so a
   beginner can tell success from silence.
4. **Your first run** — a `prompt` block to copy.
5. **Keeping it cheap** — the section this series exists for. A full page
   snapshot is large; `browser_find` is not. When a screenshot is worth it and
   when it is not. Closing tabs. This is the part beginners get wrong and the
   part no vendor doc leads with.
6. **When it goes wrong** — `callout` blocks for the three errors people
   actually hit.

Every command, tool name and config path is verified against the official
Playwright MCP documentation at implementation time. Nothing in this outline
is a source; the docs are.

## Testing

- `lib/validation/guide.test.ts` — the schema accepts each supported kind and
  rejects a `checklist` block and a malformed `code` block
- a `contentPreview` case in `lib/learn.test.ts` for the blocks fallback,
  including a blocks array whose first block is not `text`
- the existing walkthrough tests must stay green through the extraction

No E2E. The block kinds render or they do not, and the preview URL on the PR
is how that gets judged.

## Out of scope

- A block editor in admin
- `tool_id` on `content`
- A Markdown renderer for content bodies
- Guides two onward — each is a content-only PR against this format
