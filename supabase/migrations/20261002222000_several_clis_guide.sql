-- Guide: one machine, several CLIs (VIB-228).
--
-- Row 6 of docs/extend-guides-plan.md. The advanced question for CLIs is not
-- "use one harder", it is coexistence: four binaries, four config
-- directories, four auth states, and up to four instruction files that each
-- tool reads differently.
--
-- Published on insert: no new block kind. The config section renders from
-- CODING_CLIS, which is also where the AGENTS.md answers come from -- this
-- guide would otherwise be the most duplication-prone page on the site.
insert into content (type, title, slug, body, role_level, pillar, status, blocks) values
(
  'guide',
  'One machine, several CLIs',
  'several-coding-clis',
  'Most people end up with more than one terminal agent: one that came with a subscription, one a project expects, one they wanted to try. That is fine. What is not fine is four instruction files that disagree, four sign-ins you forgot about, and no idea which tool a given repo was set up for.',
  'intermediate',
  'fundamentals',
  'published',
  '[
    {"kind": "text", "body": "Nobody decides to run four coding CLIs. You pay for one, a client''s repo expects another, something new comes out and you try it on a branch, and six months later `which` returns four binaries and you have four sets of instructions in slightly different dialects.\n\nThis is about making that state deliberate rather than accidental."},
    {"kind": "heading", "level": 2, "title": "What actually collides"},
    {"kind": "text", "body": "Less than you would think, and in specific places.\n\nThe binaries do not collide. They have different names, they install globally, and they stay out of each other''s way.\n\nThe config directories do not collide either. Each one owns its own folder and ignores everyone else''s.\n\nWhat collides is the instructions, because that is the one file that is about the project rather than about the tool — and every tool has an opinion about what it is called."},
    {"kind": "cli_config", "label": "Look it up for", "clis": ["claude-code", "codex", "gemini-cli", "opencode", "qwen-code", "aider"]},
    {"kind": "heading", "level": 2, "title": "The AGENTS.md question, answered properly"},
    {"kind": "text", "body": "The obvious move is one AGENTS.md that everything reads. It half works, and the half that does not is worth knowing before you rely on it.\n\nCodex, opencode and Qwen Code read it directly. That part is genuinely solved.\n\nClaude Code reads it only when there is no CLAUDE.md in the working directory or above it. Add a CLAUDE.local.md for your own notes and you have silently stopped it reading the shared file.\n\nGemini CLI reads GEMINI.md until you list AGENTS.md in its settings, which you can do and most people have not.\n\nAider reads nothing unless you pass it."},
    {"kind": "callout", "tone": "tip", "body": "The arrangement that holds up: write AGENTS.md as the real file, then give each tool that wants its own name a pointer to it rather than a copy.\n\nFor Claude Code that is a CLAUDE.md containing `@AGENTS.md`, which also survives the CLAUDE.local.md problem. For Gemini CLI it is one line of settings. A copy works today and diverges by the second edit, which is the whole reason this page exists."},
    {"kind": "heading", "level": 2, "title": "Which tool was this repo set up for"},
    {"kind": "text", "body": "A repo tells you, if you look. A `.claude/` directory, a `.cursor/`, an `AGENTS.md` with Codex-flavoured instructions in it — those are the previous person''s choice, and matching it is usually cheaper than converting it.\n\nThis matters most on someone else''s project. Their instructions file was tested against their tool. Reading it with a different one is fine; assuming the conventions in it apply equally is where you get surprised."},
    {"kind": "heading", "level": 2, "title": "The things that do quietly go wrong"},
    {"kind": "text", "body": "Four sign-ins. Each tool holds its own credentials in its own folder, which means revoking access in one place leaves three. Worth knowing if a laptop goes missing, and worth a note somewhere of which tools are signed in to what.\n\nFour subscriptions. Easier to accumulate than to notice, because none of them is expensive on its own.\n\nFour sets of MCP servers. The same server added to three tools is three connections and three copies of its tool definitions, one per session you start. If you only use one tool for the work that needs it, only install it there.\n\nMuscle memory. The commands differ in small ways, and the mistake is usually harmless. Usually."},
    {"kind": "heading", "level": 2, "title": "A setup that holds"},
    {"kind": "text", "body": "Pick a primary. The one you reach for without thinking, where your MCP servers and skills live and where you keep them current.\n\nKeep the others installed but bare. No global MCP servers, no accumulated skills, nothing you would miss. They exist for the projects that expect them.\n\nWrite AGENTS.md, point the others at it, and check once a quarter that they are actually reading it. That last part is a one-prompt job and it is the one everybody skips."},
    {"kind": "prompt", "label": "Paste this into each of your CLIs", "prompt": "Which instruction file are you reading for this project, and what is its full path? If there is more than one candidate here, tell me which one wins and which you are ignoring.", "prompts": [
      {"title": "Check each one reads the same file", "prompt": "Which instruction file are you reading for this project, and what is its full path? If there is more than one candidate here, tell me which one wins and which you are ignoring."},
      {"title": "Find what this repo was set up for", "prompt": "Look for config and instruction files from any AI coding tool in this repository, and tell me which tool it looks like this project was set up for. Do not change anything."},
      {"title": "Audit a tool you have not used lately", "prompt": "What MCP servers and skills do you currently have available, and which are global rather than from this project? Do not change anything — I want to know what I left switched on."}
    ]},
    {"kind": "text", "body": "Run the first one in each tool, in the same repo, on the same day. If the answers disagree, you have found the thing this page is about."},
    {"kind": "links", "links": [
      {"label": "Coding CLIs: the terminal as the interface", "href": "/learn/coding-clis-explained"},
      {"label": "Global or project: where config lives", "href": "/learn/global-or-project-config"},
      {"label": "AGENTS.md: a README for your coding agent", "href": "/tools/agents-md"},
      {"label": "Browse coding CLIs", "href": "/tools?category=clis"}
    ]}
  ]'::jsonb
)
on conflict (slug) do update set
  title      = excluded.title,
  body       = excluded.body,
  role_level = excluded.role_level,
  pillar     = excluded.pillar,
  status     = excluded.status,
  blocks     = excluded.blocks,
  updated_at = now();

insert into content_tags (content_id, tag_id)
select c.id, t.id
from content c
join tags t on t.slug in ('coding-agent')
where c.slug = 'several-coding-clis'
on conflict do nothing;
