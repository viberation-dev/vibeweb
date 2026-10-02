-- Guide: coding CLIs, the terminal as the interface (VIB-224).
--
-- Row 5 of docs/extend-guides-plan.md. Published rather than drafted: it uses
-- cli_config, which shipped in VIB-221 and is on production.
--
-- Deliberately does not compare the CLIs. Pricing, models and install
-- commands are in tools.key_facts and render on each tool page; repeating
-- them here would be the same duplication these guides exist to avoid, and it
-- would be out of date within a month. What is authored is the part a
-- directory row cannot say: why a terminal agent is a different kind of thing
-- from a chat window, and what actually makes one good once you have it.
insert into content (type, title, slug, body, role_level, pillar, status, blocks) values
(
  'guide',
  'Coding CLIs: the terminal as the interface',
  'coding-clis-explained',
  'A coding CLI is an AI agent that lives in your terminal rather than a chat window or a sidebar. The difference is not the typing. It is that it can run your tests, read what broke, and try again without asking you to paste anything.',
  'beginner',
  'fundamentals',
  'published',
  '[
    {"kind": "text", "body": "A chat window gives you an answer. You copy it into your editor, run it, something fails, you copy the error back. That loop is most of the time you spend, and you are the one carrying the messages."},
    {"kind": "text", "body": "A coding CLI closes that loop. It runs in your project folder, so it can open your files, edit them, run your tests, read the failure, and go again. You stop being the courier.\n\nThat is the whole pitch, and it is also the whole risk: something that can edit files and run commands without asking you each time is powerful in exactly the way that is hard to undo."},
    {"kind": "callout", "tone": "warning", "body": "Work in git, and commit before you set one going. Not because these tools are reckless, but because \"undo the last twenty minutes\" needs to be one command rather than an archaeology project.\n\nIf you take one habit from this page, take that one."},
    {"kind": "heading", "level": 2, "title": "What they all have in common"},
    {"kind": "text", "body": "They differ in which model they use and what they cost, and the directory covers that per tool. Underneath, they are the same shape:\n\nThey work in a folder. Run one in your project and that project is its world.\n\nThey ask before doing something irreversible, at least by default. Read the thing it is asking about. The prompt is the safety feature.\n\nThey read an instructions file. This is the part people skip, and it is the part that decides whether the tool is any good at your project."},
    {"kind": "heading", "level": 2, "title": "Where each one keeps its things"},
    {"kind": "text", "body": "Two separate concerns: its own settings and sign-in, which are yours, and the instructions it reads about this project, which belong to the team. Pick your tool."},
    {"kind": "cli_config", "label": "Look it up for", "clis": ["claude-code", "codex", "gemini-cli", "opencode", "qwen-code", "aider"]},
    {"kind": "callout", "tone": "warning", "body": "Note how little they agree. Four different instruction filenames, and four different answers to whether an AGENTS.md gets read at all.\n\nIf more than one person works on your repo with more than one tool, check each tab before assuming a single file covers everyone."},
    {"kind": "heading", "level": 2, "title": "The instructions file is the whole game"},
    {"kind": "text", "body": "A terminal agent with no instructions re-derives your project from scratch every session: how to run the tests, where things live, what the conventions are. It will guess, and it will guess the industry default rather than your actual setup.\n\nTen lines fixes most of it. The build and test commands. Where the important code lives. Two or three rules it keeps getting wrong."},
    {"kind": "callout", "tone": "tip", "body": "Write it the way you would brief a competent contractor on their first morning. Not an architecture essay — the handful of things they would otherwise have to ask you, or get wrong once.\n\nMost of these tools have an init command that drafts one by reading your codebase. Run it, then cut it down. The drafts are always too long, and length is what makes a tool ignore it."},
    {"kind": "heading", "level": 2, "title": "Try one properly"},
    {"kind": "text", "body": "The first session people run is usually \"write me a feature\", which is the hardest thing to judge. Start with something where you already know the right answer, so you can tell whether it did well."},
    {"kind": "prompt", "label": "Paste this into your CLI", "prompt": "Read this project and tell me how to run it, how to run its tests, and what the three most important folders are. Do not change any files.", "prompts": [
      {"title": "See if it understands the project", "prompt": "Read this project and tell me how to run it, how to run its tests, and what the three most important folders are. Do not change any files."},
      {"title": "A real, small, reversible task", "prompt": "Find the test suite, run it, and tell me what passes and what fails. If anything fails, explain why before changing anything."},
      {"title": "Draft the instructions file", "prompt": "Read this codebase and draft a short instructions file for yourself: build and test commands, where the main code lives, and any conventions you can see. Keep it under 30 lines and tell me the filename you would save it as for this tool."}
    ]},
    {"kind": "text", "body": "The third one is the one to actually keep. Have it draft the file, read it yourself, delete half of it, and commit what is left."},
    {"kind": "heading", "level": 2, "title": "Picking one"},
    {"kind": "text", "body": "Honest answer: start with whichever one matches a subscription you already pay for, and switch later if it annoys you. They are close enough that the choice matters less than the habits, and your instructions file mostly moves between them.\n\nThe comparisons that matter — pricing, which models, whether you can bring your own key, whether it runs local models — are on each tool''s page in the directory, where they get kept up to date."},
    {"kind": "links", "links": [
      {"label": "Browse coding CLIs", "href": "/tools?category=clis"},
      {"label": "Global or project: where config lives", "href": "/learn/global-or-project-config"},
      {"label": "AGENTS.md: a README for your coding agent", "href": "/tools/agents-md"},
      {"label": "MCP servers: giving your AI tool hands", "href": "/learn/mcp-servers-explained"}
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

-- `coding-agent`: the facet the CLIs carry, so this surfaces as related
-- reading on their pages and nowhere unrelated.
insert into content_tags (content_id, tag_id)
select c.id, t.id
from content c
join tags t on t.slug in ('coding-agent')
where c.slug = 'coding-clis-explained'
on conflict do nothing;
