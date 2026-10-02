-- Guide: global or project, the scope spine (VIB-221).
--
-- The piece the other Extend guides link back to instead of re-explaining
-- scope (docs/extend-guides-plan.md, row 0). Every guide about installing an
-- MCP server, a skill or a CLI hits the same fork in the first two minutes —
-- just me or the whole team, this project or all of them — and answering it
-- once is what lets the rest of them be short.
--
-- Inserted as a draft, for the reason VIB-192 recorded: one Supabase project
-- serves production and every preview, and this guide uses the `cli_config`
-- block kind, which only the renderer in this PR understands. A follow-up
-- migration publishes it once this is deployed.
--
-- Three of its sections render from the matrices rather than being authored:
-- the MCP install tabs from MCP_CLIENTS, the CLI table from CODING_CLIS. The
-- guide that explains where config lives should not be the one carrying a
-- stale copy of where config lives.
insert into content (type, title, slug, body, role_level, pillar, status, blocks) values
(
  'guide',
  'Global or project: where your AI tool looks for its config',
  'global-or-project-config',
  'Every AI tool asks you the same question when you install something into it, and most of them ask it in different words: just you or the whole team, this project or all of them. Get it wrong and you either install the same thing five times or turn something on everywhere and forget it is running.',
  'beginner',
  'fundamentals',
  'draft',
  '[
    {"kind": "text", "body": "You add an MCP server on Monday. On Wednesday you open a different project and it is gone. Or the opposite: you turn something on once, forget about it, and six weeks later it is still loading into every session you start, costing you context in projects that have nothing to do with it.\n\nBoth are the same mistake, and it is not really a mistake. Nobody told you the question was being asked."},
    {"kind": "heading", "level": 2, "title": "The question is always the same two"},
    {"kind": "text", "body": "Every tool, every time, is asking you two things at once.\n\nWhose machine is this for? Just you, or anyone who works on this repo.\n\nWhich projects does it apply to? This one, or all of them.\n\nThat is it. The answers live in different files, and the files are the whole subject."},
    {"kind": "callout", "tone": "info", "body": "The words differ and the meaning does not. Claude Code says user, Cursor says global, others say personal or home. All of them mean the same thing: your machine, every project, not shared with anyone.\n\nWhen a tool offers project or workspace, it means a file inside the repo — which means git decides who else gets it."},
    {"kind": "heading", "level": 2, "title": "Three places, and what belongs in each"},
    {"kind": "text", "body": "1. Your home folder — ~/.claude, ~/.codex, ~/.cursor and friends. Your settings, your sign-ins, your personal preferences. Nobody else ever sees this, and it applies to every project you open.\n\n2. The project, committed — .mcp.json, AGENTS.md, .cursor/mcp.json. Checked into git, so everyone who clones the repo gets it. This is where anything the project genuinely needs belongs.\n\n3. The project, not committed — CLAUDE.local.md and anything you have gitignored. Yours, for this repo only. Useful for a sandbox URL or test credentials you do not want in the repo."},
    {"kind": "callout", "tone": "warning", "body": "Nothing in group 2 should contain a secret. A committed config is a file you are publishing to everyone with repo access, and to anyone who ever gets a copy of the repo.\n\nIf a config needs an API key, the config names an environment variable and the key lives outside the repo. Every tool here supports that, and every one of them has had someone commit a key anyway."},
    {"kind": "heading", "level": 2, "title": "What it looks like for an MCP server"},
    {"kind": "text", "body": "Here is the same server, Playwright, added to each tool. Watch the scope line under each command — that is the fork, in each tool''s own words."},
    {"kind": "mcp_install", "server": "playwright", "command": "npx @playwright/mcp@latest"},
    {"kind": "text", "body": "Four of those take a command that writes the file for you. The rest you write yourself. Either way you are choosing between the same two files."},
    {"kind": "heading", "level": 2, "title": "What it looks like for a CLI"},
    {"kind": "text", "body": "A terminal agent keeps two things: its own settings, which are yours, and the instructions it reads about your project, which are the team''s. The second one is where these tools disagree most."},
    {"kind": "cli_config", "label": "Look it up for"},
    {"kind": "callout", "tone": "warning", "body": "This is the part that catches people out. Writing an AGENTS.md does not mean your tool reads it.\n\nClaude Code reads it only where there is no CLAUDE.md. Gemini CLI reads GEMINI.md until you name AGENTS.md in its settings. Zed reads whichever of nine files it finds first, and AGENTS.md is seventh. Aider reads nothing at all unless you pass it.\n\nIf you share a repo with people using different tools, check the tab above for each of them before assuming one file covers everyone."},
    {"kind": "heading", "level": 2, "title": "How to decide, in one line each"},
    {"kind": "text", "body": "Does the project need it to work? Commit it. A new teammate cloning the repo should get a working setup, not a list of things to install.\n\nIs it a preference, a key, or a habit? Home folder. Your editor layout is not the project''s business.\n\nIs it both? Commit the config, keep the credential out of it.\n\nNot sure? Start project-scoped. A thing that is on in one repo is easy to find later. A thing that is on everywhere is invisible until it causes a problem."},
    {"kind": "heading", "level": 2, "title": "The cost of global, which nobody mentions"},
    {"kind": "text", "body": "Anything installed globally loads in every session, in every project, forever. That is the point of it, and it is also the bill.\n\nEvery MCP server you add globally puts its tool definitions into the context window of every conversation you start, including the ones about a completely unrelated codebase. A few of those and you have spent real context before typing anything. People notice the model getting vaguer and blame the model.\n\nAnd a global install is a thing you stop seeing. Six servers you added over three months, all connected, most of them irrelevant to what you are doing today."},
    {"kind": "heading", "level": 2, "title": "Check what you have actually got"},
    {"kind": "text", "body": "Worth doing now rather than when something breaks."},
    {"kind": "prompt", "label": "Paste this into your AI tool", "prompt": "List every MCP server, skill and instruction file you can currently see, and for each one tell me whether it is coming from this project or from my home folder. Do not change anything.", "prompts": [
      {"title": "Audit what is loaded", "prompt": "List every MCP server, skill and instruction file you can currently see, and for each one tell me whether it is coming from this project or from my home folder. Do not change anything."},
      {"title": "Find what is global and unused", "prompt": "Of the MCP servers currently connected, which ones have nothing to do with this codebase? Do not remove anything, just tell me what you would turn off and why."},
      {"title": "Check my instruction file is read", "prompt": "Which instruction file are you actually reading for this project, and what path is it at? If there is more than one candidate in this repo, tell me which one wins and which are being ignored."}
    ]},
    {"kind": "text", "body": "The third one is worth running even if you are confident. It is the fastest way to find out that the file you have been carefully maintaining is not the one being read."},
    {"kind": "links", "links": [
      {"label": "Playwright MCP, without burning your context window", "href": "/learn/playwright-mcp-guide"},
      {"label": "Supabase MCP, safely", "href": "/learn/supabase-mcp-guide"},
      {"label": "AGENTS.md in the directory", "href": "/tools/agents-md"},
      {"label": "MCP servers", "href": "/tools?category=mcp_servers"},
      {"label": "CLIs", "href": "/tools?category=clis"}
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

-- Tagged `mcp-client` only: the tools that run MCP servers are exactly the
-- audience for a guide about where their config lives, and related reading
-- matches on any shared facet, so a second tag would spray this across the
-- directory (the warning VIB-192 left on the Playwright guide).
insert into content_tags (content_id, tag_id)
select c.id, t.id
from content c
join tags t on t.slug in ('mcp-client')
where c.slug = 'global-or-project-config'
on conflict do nothing;
