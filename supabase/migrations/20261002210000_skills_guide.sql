-- Guide: skills, teaching your tool your way of working (VIB-225).
--
-- Row 3 of docs/extend-guides-plan.md. Draft, because it uses `skill_install`
-- and the live renderer does not know that kind yet: an unknown kind makes
-- toGuideBlocks return null and the page falls back to plain `body`. The
-- follow-up migration publishes it once this deploys.
--
-- The hard part of this guide is the distinction nobody states plainly:
-- an MCP server gives a tool new *abilities*, a skill gives it new
-- *instructions*. People install skills expecting the first and conclude they
-- do nothing. So that comparison leads, and the install comes after.
--
-- Install tabs render from SKILL_AGENTS, which already carries the folder and
-- upload routes and was checked against the vendors' docs on 2026-09-13.
insert into content (type, title, slug, body, role_level, pillar, status, blocks) values
(
  'guide',
  'Skills: teaching your tool your way of working',
  'skills-explained',
  'A skill is a folder of instructions your AI tool reads when it is relevant, and ignores when it is not. Not new abilities, which is what an MCP server gives you. New habits. This is the difference, how to install one, and why most people''s first skill does nothing.',
  'beginner',
  'fundamentals',
  'draft',
  '[
    {"kind": "text", "body": "You have explained the same thing to your AI tool four times this month. How your team writes commit messages. The shape of a component in this codebase. The checklist you go through before a release.\n\nA skill is where that explanation lives so you stop typing it."},
    {"kind": "heading", "level": 2, "title": "Not the same thing as an MCP server"},
    {"kind": "text", "body": "This is the distinction worth getting straight, because installing the wrong kind of thing is the usual first mistake.\n\nAn MCP server gives your tool a new ability. It could not read your database; now it can.\n\nA skill gives your tool new instructions. It could always write a commit message; now it writes one the way your team does.\n\nIf the thing you want is \"reach something it cannot reach\", you want a server. If it is \"do the thing it already does, but properly\", you want a skill."},
    {"kind": "callout", "tone": "info", "body": "A skill is genuinely just a folder with a markdown file in it, plus any scripts or templates it needs. You can read one before you install it, and you should.\n\nThat is the whole format. It is not a plugin, there is no API, and nothing is compiled."},
    {"kind": "heading", "level": 2, "title": "Why your tool ignores it"},
    {"kind": "text", "body": "The first line of a skill is a description of when to use it, and that line is doing almost all the work. Your tool reads the descriptions of every installed skill and picks one when the description matches what you asked for. It does not read the skills themselves until it has picked one.\n\nSo a skill described as \"helps with code\" never fires, because nothing is specifically that. A skill described as \"use when writing or reviewing a database migration\" fires exactly when it should."},
    {"kind": "callout", "tone": "tip", "body": "If a skill you installed never seems to run, read its description first, before anything else. Nine times out of ten it is vague, and you can edit it. It is your folder now."},
    {"kind": "heading", "level": 2, "title": "Install one"},
    {"kind": "text", "body": "Skills come from GitHub repositories, and one repo often holds several. Here is a well-made set to start from, installed one skill at a time."},
    {"kind": "skill_install", "owner": "anthropics", "repo": "skills", "skill": "frontend-design"},
    {"kind": "callout", "tone": "warning", "body": "A skill can carry scripts, and a skill that runs a script runs it on your machine with your access. The format is plain files precisely so you can check, and the one habit worth keeping is to look before you install from somewhere you do not know.\n\nThe directory marks who published each one. Prefer skills from the people who make the tool, or from a repository you can see other people using."},
    {"kind": "text", "body": "Note the two kinds of tab above. Anything that runs in a terminal reads skills from a folder, so the skills CLI can put them there for you. Claude.ai and ChatGPT take a ZIP through their own settings screen instead — no command exists that would change that, and a skill that depends on running scripts may not work in them at all."},
    {"kind": "heading", "level": 2, "title": "Then write your own"},
    {"kind": "text", "body": "Installed skills are the smaller half. The ones worth having are about your project, and nobody else can write those.\n\nThe test for whether something should be a skill: have you explained it more than twice, and is it only relevant sometimes? Always-relevant things belong in your instructions file, which loads every session. Sometimes-relevant things belong in a skill, which does not."},
    {"kind": "prompt", "label": "Paste this into your AI tool", "prompt": "I keep explaining the same things to you in this project. Based on what you can see here and what I have corrected you on, suggest three skills worth writing, and for each one give the description line that decides when it fires.", "prompts": [
      {"title": "Find what is worth a skill", "prompt": "I keep explaining the same things to you in this project. Based on what you can see here and what I have corrected you on, suggest three skills worth writing, and for each one give the description line that decides when it fires."},
      {"title": "Write one", "prompt": "Write a skill for [the thing you keep explaining]. Put the description line first and make it specific about when to use it. Show me the file before saving it, and tell me which folder it goes in for this tool."},
      {"title": "Work out why one is not firing", "prompt": "Which skills can you currently see, and what does each one say about when to use it? For [skill name], tell me honestly whether its description would have matched what I asked you earlier."}
    ]},
    {"kind": "text", "body": "The third prompt is the useful one once you have a few. A skill that never fires is not a skill, it is a file."},
    {"kind": "links", "links": [
      {"label": "Browse skills", "href": "/skills"},
      {"label": "Global or project: where config lives", "href": "/learn/global-or-project-config"},
      {"label": "MCP servers: giving your AI tool hands", "href": "/learn/mcp-servers-explained"},
      {"label": "AGENTS.md: a README for your coding agent", "href": "/tools/agents-md"}
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
