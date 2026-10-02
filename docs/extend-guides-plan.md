# Plan: the Extend guides (MCP · Skills · CLIs)

Editorial plan for the three guides the brief asked for. Written against what
the repo already does, not from scratch — two structured guides and a
code-backed install matrix already exist, and the brief as written would
duplicate both.

Status: plan only. No content rows written yet.

---

## What the brief asked for, and why it does not ship as written

> Three articles (MCP / Skills / CLIs), each split Basic → Intermediate →
> Advanced, each covering global and local install across Claude, ChatGPT,
> Antigravity, VS Code, Cursor and Open Code, plus a links directory.

Four conflicts with the platform. Each has a fix that produces *less* content
and more value.

**1. Basic/Intermediate/Advanced is already a column, not a section.**
`content.role_level` is `beginner | intermediate | expert`, and Learn filters
the index by the reader's own tier ([lib/role-level.ts](lib/role-level.ts)).
A single row holding all three tiers cannot be filtered, so a beginner lands on
a page that is two-thirds not for them, and the tier facet shows it three times
or not at all.

→ Ship the ladder as **separate rows at separate tiers**, one topic per row.
The `heading` block and the "On this page" rail carry structure within a row
([lib/validation/blocks.ts](lib/validation/blocks.ts)).

**2. The Skills install matrix is already built, in code.**
`SKILL_AGENTS` in [lib/skill-taxonomy.ts](lib/skill-taxonomy.ts) holds, for
eight agents, the project path, the personal path, the skills-CLI `-a` value,
the upload steps for chat apps, a note and a vendor docs link — every path
checked against the vendor's own docs on 2026-09-13. A prose article restating
it is a second copy of the same facts, and the copy is the one that goes stale.
CLAUDE.md names this exact failure mode twice.

→ The Skills guide **links to the matrix and does not repeat it**. It carries
what the matrix cannot: what a skill is for, when a skill is the wrong tool,
and what breaks.

**3. Six clients × three topics × three tiers is 54 cells of mostly the same
paragraph.** The real axis is two questions, identical across all three topics:
*whose machine* (personal vs project) and *which client reads which file*. That
is one idea, repeated 54 times by the brief's structure.

→ Teach the scope model **once**, in a spine piece every other row links to.
The per-client fork is a `tabs` block, which is what both existing guides
already use ("Install it in": Claude Code / Cursor / VS Code).

**4. A curated external links list is the directory's job.** We have
`/tools?category=mcp_servers`, `?category=skills` and `?category=clis`
([lib/tool-categories.ts](lib/tool-categories.ts)). An external link list in
prose competes with our own directory and rots unattended.

→ `links` blocks point at directory filters plus the one vendor doc per client.
Nothing else.

---

## What to ship instead: one spine + six rows

| # | Row | Type | Tier | Pillar |
|---|-----|------|------|--------|
| 0 | Global or project: where your AI tool looks for its config | guide | beginner | fundamentals |
| 1 | MCP servers: giving your AI tool hands | guide | beginner | fundamentals |
| 2 | Running MCP servers you do not fully trust | guide | expert | fundamentals |
| 3 | Skills: teaching your tool your way of working | guide | beginner | fundamentals |
| 4 | Writing a skill worth keeping | guide | intermediate | context_engineering |
| 5 | Coding CLIs: the terminal as the interface | guide | beginner | fundamentals |
| 6 | One machine, several CLIs | guide | intermediate | fundamentals |

Row 0 is the spine. It is the piece the brief did not ask for and the one that
makes the other six short: config precedence, personal vs project vs committed,
why `.mcp.json` is committed and `~/.claude/` is not, and what "global" costs
you when you forget it is on. Every other row links back to it instead of
re-explaining it.

That is seven rows instead of three articles, and roughly **40% less text** than
the brief, because the repetition is gone.

### Why MCP gets a second row and Skills gets a different second row

The advanced half of each topic is not "more of the same, harder". It is a
different question per topic, and pretending otherwise is what makes
Basic/Intermediate/Advanced read as filler:

- **MCP → trust.** An MCP server is third-party code with your credentials and
  a browser. The Playwright guide already carries one warning of this shape
  ("it can act as you there: click things, submit things, buy things"). Row 2
  is that warning given its own page: what a server can reach, what the context
  cost actually is, and what to check before adding one.
- **Skills → authoring.** Installing a skill is one command. The hard part is
  writing one that fires when it should, which is a prompt-engineering problem,
  not an install problem. Hence `context_engineering`.
- **CLIs → coexistence.** Installing one CLI is `npm i -g`. The real problem is
  four of them on one machine: PATH collisions, four auth states, `AGENTS.md`
  vs `CLAUDE.md`, and which one a given repo expects.

---

## Format: use the house blocks, not prose

Both existing guides
([playwright](supabase/migrations/20260922110000_playwright_mcp_guide.sql),
[supabase](supabase/migrations/20260923100000_supabase_mcp_guide.sql)) already
set the pattern. Follow it exactly:

- `heading` for every section — the "On this page" rail is read from these.
- `tabs` with `label: "Install it in"` for the per-client fork. Not prose
  sections per client.
- `code` **always** with `expected:` — "what a correct run looks like" is the
  single most useful field we have and the one most often left empty.
- `prompt` with a `prompts` array for the verification step. Every guide ends
  with a copy-paste prompt that proves the thing works.
- `callout` `warning` for the cost and the trust failure modes.
- `links` to the directory filter plus vendor docs.
- Insert as `status: 'draft'`; one Supabase project serves prod and previews, so
  a published row is live before the PR merges. A follow-up migration publishes,
  as the Playwright pair already does.
- Short plain `body` alongside `blocks` — metadata and JSON-LD read `body`.

---

## Fact gate — do not author before this is filled in

Install commands are the part of a guide that is worth nothing if wrong, and the
client list in the brief is partly unverified here. Before writing a single
`code` block, confirm each cell against the vendor's own docs and record the
date, the way `SKILL_AGENTS` already does.

| Client | MCP install | Skills install | CLI install |
|---|---|---|---|
| Claude Code | verified — `MCP_CLIENTS` | verified — `SKILL_AGENTS` | confirm |
| Claude Desktop | verified — `MCP_CLIENTS`, no project scope | n/a | n/a |
| Claude.ai | verified — hosted connectors only | verified — upload flow | n/a |
| ChatGPT | verified — hosted connectors only | verified — upload, safety scan | n/a |
| Codex | verified — `MCP_CLIENTS` (TOML) | verified — `.agents/skills` | confirm |
| Cursor | verified — `MCP_CLIENTS` | verified — `.cursor/skills` | confirm |
| VS Code / Copilot | verified — `MCP_CLIENTS` | verified — `.github/skills` | confirm |
| Antigravity | verified — `MCP_CLIENTS` | verified — `.agents/skills` | confirm |
| Gemini CLI | verified — `MCP_CLIENTS` | verified — `.gemini/skills` | confirm |
| opencode | verified — `MCP_CLIENTS` (own `mcp` shape) | **confirm** | **confirm** |

The MCP column is closed: [lib/mcp-clients.ts](lib/mcp-clients.ts) (VIB-215)
holds all ten clients, checked against each vendor's own docs on 2026-10-02 and
dated in the file. The CLI column is still open, and the right answer there is
probably the same move a third time rather than prose.

It settled the two cells that needed a decision rather than research:
**ChatGPT and Claude.ai take remote connectors and cannot run a local server at
all.** They carry `kind: "hosted"` with the route they do have, mirroring
`folder` vs `upload` in the Skills matrix. The guides say so plainly instead of
offering a workaround.

Two findings worth knowing before authoring:

- **Four of the ten clients have no add command** (Claude Desktop, Cursor,
  Antigravity, opencode). "One command" is not the universal shape, so the
  install section is a config file with a command where one exists, not the
  reverse.
- **The config key is not always `mcpServers`.** VS Code's `.vscode/mcp.json`
  uses `servers`, Codex uses TOML `[mcp_servers.<name>]`, and opencode uses
  `mcp` with the command as an array. A guide that shows one JSON blob "for
  every editor" is wrong for three of them.

---

## The follow-on worth more than the three articles

Skills has `SKILL_AGENTS`: one typed, dated, code-backed matrix that every
surface renders from. MCP and CLIs have nothing — their install facts live
hand-copied inside individual guide rows, which is why guide 3 will contradict
guide 1 within a quarter.

**Build `MCP_CLIENTS` in the same shape as `SKILL_AGENTS`** (client id, label,
`kind: "config-file" | "command" | "hosted"`, project config path, personal
config path, add-command, docs URL, checked-on date). Then the install tabs in
every MCP guide render from it, `/tools/[slug]` for any MCP server can show "how
to add this to your tool", and the facts have one home.

That is one file, it kills the drift the brief would create, and it turns a
third of each article into generated output. Worth doing before guides 1 and 2
rather than after.

---

## Sequence

1. `MCP_CLIENTS` constant plus the fact gate filled in (one PR, one Linear
   issue).
2. Row 0, the scope spine. Everything links to it, so it goes first.
3. Rows 1, 3, 5 — the beginner triad, each with install tabs rendered from the
   matrix.
4. Rows 2, 4, 6 — the second tier, one per topic, each answering its own
   question rather than being "advanced".

One Linear issue and one branch per row, per CLAUDE.md. Each row is a draft
insert plus a publish migration.
