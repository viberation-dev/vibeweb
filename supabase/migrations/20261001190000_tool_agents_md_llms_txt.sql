-- AGENTS.md and llms.txt (VIB-214).
--
-- Both in utilities, beside DESIGN.md (VIB-213) and Agent Skills: an open
-- file format that an agent reads is a utility here. Three rows now make a
-- real cluster, which is the point — a reader who finds one should find the
-- others, so each links to the other two.
--
-- They are not the same kind of file, and the descriptions say which way
-- each one points:
--   AGENTS.md  lives in your repo and tells an agent how to work on it.
--   llms.txt   lives on your site and tells an agent how to read it.
-- Confusing those is the predictable mistake, so each row names the other.
--
-- The Claude Code fact on AGENTS.md is the one that matters to this
-- audience and is easy to get wrong: Claude Code reads AGENTS.md only where
-- a folder has no CLAUDE.md. Stated that precisely, not as "Claude Code
-- supports AGENTS.md", which would have people delete a CLAUDE.md that is
-- still the file being read.
--
-- The llms.txt row carries its own caveat for the same reason. The proposal
-- is widely published and genuinely useful to an agent you point at your
-- docs; no crawler is obliged to read it, and a directory that implies
-- otherwise is selling SEO that does not exist.
--
-- Sources, read 2026-10-01: agents.md (60k+ repositories, stewarded by the
-- Agentic AI Foundation under the Linux Foundation), llmstxt.org (v2,
-- modified 10 Aug 2026, Jeremy Howard), and code.claude.com's changelog for
-- the 21 Sep 2026 AGENTS.md change.
insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url, platform, best_for, badge)
values
  ('AGENTS.md', 'agents-md', 'utilities',
   'A README for your coding agent, in one file at the repo root.',
   'AGENTS.md is a plain Markdown file you put at the root of a repository to tell a coding agent how to work on it: how to install and run the project, how to run the tests, what the code style is, what a pull request should look like. A README is for people and stays short; this is the detail an agent needs and a human contributor would skim past. There are no required fields — write whatever headings you like, since the agent just reads the text. In a monorepo you can put one in each package, and an agent uses the nearest file to whatever it is editing. The format came out of a joint effort across OpenAI Codex, Cursor, Amp, Jules and Factory rather than one vendor, is now stewarded by the Agentic AI Foundation under the Linux Foundation, and is in well over sixty thousand open-source repositories. Claude Code reads it too, but only in a folder with no CLAUDE.md — if you have both, the CLAUDE.md is the one being read.',
   'Free', 'https://agents.md', '{}', 'beginner', null),

  ('llms.txt', 'llms-txt', 'utilities',
   'A map of your site, written for the agents that read it.',
   'llms.txt points the other way from AGENTS.md: it goes on your website, not in your repo, and it is for agents reading your documentation rather than agents writing your code. The problem it solves is that a web page buries its actual content in navigation, markup and scripts, and an agent fetching it wastes most of its context window on everything that is not the answer. So you publish one Markdown file at /llms.txt — a title, a short summary, then lists of links to clean Markdown versions of your pages — and an agent reads that first and follows only the links it needs. The proposal is Jeremy Howard''s, now in its second version, and OpenAI, Anthropic and Google all publish one for their own developer docs; Chrome''s Lighthouse checks whether you have one. Be clear-eyed about what it is, though: a convention, not a standard anyone is obliged to honour. It helps an agent you have pointed at your docs. It is not a search ranking trick.',
   'Free', 'https://llmstxt.org', '{}', 'intermediate', null)
on conflict (slug) do nothing;

update tools set key_facts = '[
  {"label": "What it is", "value": "An AGENTS.md file at your repository root, in plain Markdown"},
  {"label": "Usually holds", "value": "Setup and build commands, how to run tests, code style, PR rules"},
  {"label": "Required fields", "value": "None — any headings you like"},
  {"label": "Monorepos", "value": "One per package; the agent uses the nearest file"},
  {"label": "Read by", "value": "Codex, Cursor, Copilot''s coding agent, Gemini CLI, Jules, Zed, Aider, Devin and more"},
  {"label": "Claude Code", "value": "Reads it only where there is no CLAUDE.md in the folder"},
  {"label": "Stewarded by", "value": "The Agentic AI Foundation, under the Linux Foundation"}
]'::jsonb, updated_at = now() where slug = 'agents-md';

update tools set key_facts = '[
  {"label": "What it is", "value": "A Markdown file at /llms.txt on your website"},
  {"label": "Holds", "value": "A title, a one-line summary, then lists of links to clean Markdown pages"},
  {"label": "Proposed by", "value": "Jeremy Howard; version 2 published August 2026"},
  {"label": "Who publishes one", "value": "OpenAI, Anthropic and Google, for their own developer docs"},
  {"label": "Also", "value": "Chrome''s Lighthouse checks for one"},
  {"label": "Watch out", "value": "A convention, not a standard — no crawler is obliged to read it"}
]'::jsonb, updated_at = now() where slug = 'llms-txt';

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('agents-md', array['open-source','automation','free-tier']),
  ('llms-txt',  array['open-source','websites','search','free-tier'])
) as v(slug, tag_slugs)
join tools t on t.slug = v.slug
join tags g on g.slug = any (v.tag_slugs)
on conflict (tool_id, tag_id) do nothing;

-- The cluster: each format links to its siblings and to the agents that
-- actually read it. One direction per pair, as elsewhere.
insert into tool_links (tool_id, linked_tool_id, kind, note, sort_order)
select a.id, b.id, n.kind::tool_link_kind, n.note, n.sort_order
from (values
  ('agents-md', 'claude-code', 'pairs_with', 'reads it where there is no CLAUDE.md', 0),
  ('agents-md', 'codex',       'pairs_with', 'where the format started', 1),
  ('agents-md', 'cursor',      'pairs_with', 'reads it from the repo root', 2),
  ('agents-md', 'design-md',   'pairs_with', 'the same idea, for how your app should look', 3),
  ('llms-txt',  'agents-md',   'pairs_with', 'the one for your repo, not your site', 0),
  ('llms-txt',  'design-md',   'pairs_with', 'the one for your visual design', 1)
) as n(a_slug, b_slug, kind, note, sort_order)
join tools a on a.slug = n.a_slug
join tools b on b.slug = n.b_slug
on conflict (tool_id, linked_tool_id) do nothing;
