-- DESIGN.md, Google Stitch, and the two community libraries (VIB-213).
--
-- Four rows because they are four different things, and conflating them is
-- the mistake a reader arrives with: the format is Google's, the tool that
-- generates it is Google's, and the two libraries full of ready-made files
-- are not. Each gallery row says who runs it, in the description and again
-- in key_facts, so nobody takes a community upload for a Google artefact.
--
-- Category calls:
--
--   DESIGN.md       utilities, on the Agent Skills precedent. An open file
--                   format that agents read is already filed there, and the
--                   directories that grew around it (skills.sh, SkillsMP,
--                   Awesome Skills) sit beside it. Not templates — those are
--                   starter codebases. Not clis — the CLI validates the
--                   format, it is not the product.
--   Google Stitch   tools, the same bucket as Claude Design: a design tool
--                   you use, not a thing you install in a repo.
--   both libraries  utilities, beside the format they index.
--
-- Sources, read 2026-10-01: github.com/google-labs-code/design.md (Apache-2.0,
-- spec version "alpha", CLI published as @google/design.md with lint, diff,
-- export and spec commands), blog.google's Stitch announcement of 21 Apr 2026,
-- designmd.ai/about and designmd.app/about.
--
-- Deliberately not stated: Stitch's exact credit allowances and which Gemini
-- model is behind it. Both change, both come from third-party write-ups
-- rather than a Google pricing page, and a directory that repeats them
-- becomes the citation for them. "Free, with daily limits" is the durable
-- version of that fact.
insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url, platform, best_for, badge)
values
  ('DESIGN.md', 'design-md', 'utilities',
   'One file that tells your agent what your app should look like.',
   'DESIGN.md is Google''s open format for handing a coding agent your visual identity. It is one Markdown file you drop next to your README: the top is YAML with the actual values — colours, type scale, spacing, corner radii, component tokens — and the rest is prose explaining why those values exist and when to use them. The agent gets exact numbers and the reasoning behind them, which is the part a screenshot or a "make it look modern" prompt cannot give it. Without something like this an agent re-decides your design on every prompt, so the fifth component it writes rarely matches the first. There is a command-line tool, npx @google/design.md, that checks a file against the spec, flags colour pairs that fail WCAG contrast, and exports your tokens to Tailwind or the W3C token format. The spec is Apache-licensed and still marked alpha, so expect it to move.',
   'Free', 'https://github.com/google-labs-code/design.md', '{}', 'intermediate', null),

  ('Google Stitch', 'google-stitch', 'tools',
   'Describe a screen, get the design and the code for it.',
   'Stitch is Google Labs'' design tool: you describe an app in words, sketch it, or say it out loud, and it draws the screens. From there you can keep editing on a canvas, paste the result into Figma as real editable frames, export front-end code, or export a DESIGN.md — the format started here before Google published it. It is the fastest way to get a design system you did not have to write by hand, which is the gap this directory had, since every other route into DESIGN.md assumes you already have one. Free to use, with a daily cap on how much you can generate.',
   'Free', 'https://stitch.withgoogle.com', array['web'], 'beginner', null),

  ('DESIGNmd', 'designmd-ai', 'utilities',
   'A community library of DESIGN.md files, with an MCP server.',
   'DESIGNmd is a gallery of DESIGN.md files other people have written, so you can take a finished design system instead of authoring one. Browse by style or tag, download the file, drop it in your project. It also ships an MCP server, so your agent can search and install a design system without you opening the site, and two skills that teach an agent to author or find one. Run by designkit-md, not by Google: everything in it is user-submitted, so read a file before you adopt it, the way you would read a skill before installing it.',
   'Free', 'https://designmd.ai', array['web'], 'intermediate', null),

  ('designmd.app', 'designmd-app', 'utilities',
   'Ready-made DESIGN.md files, and a setup guide per agent.',
   'A second, larger library of DESIGN.md files, organised by visual style rather than by brand — Swiss minimalism, brutalism, Art Nouveau, flat corporate, and a set taken from real companies. Its more useful half is the guides: one page each for wiring a DESIGN.md into Claude Code, Cursor, Kiro, Windsurf, Copilot and Stitch, which is the step most people get wrong, since dropping the file in the repo does not on its own make every agent read it. Maintained by ft.ia.br, independently of Google, and the files are community-contributed.',
   'Free', 'https://designmd.app', array['web'], 'beginner', null)
on conflict (slug) do nothing;

update tools set key_facts = '[
  {"label": "Made by", "value": "Google Labs"},
  {"label": "What it is", "value": "A DESIGN.md file in your project root: YAML design tokens, then prose"},
  {"label": "Check one", "value": "npx @google/design.md lint DESIGN.md"},
  {"label": "Exports to", "value": "Tailwind v3 and v4, and the W3C design-token format"},
  {"label": "Licence", "value": "Apache 2.0; the spec is still marked alpha"},
  {"label": "Works with", "value": "Any agent you point at the file — Claude Code, Cursor, Kiro, Windsurf"}
]'::jsonb, updated_at = now() where slug = 'design-md';

update tools set key_facts = '[
  {"label": "Made by", "value": "Google Labs"},
  {"label": "Takes", "value": "A written prompt, a sketch, or your voice"},
  {"label": "Gives you", "value": "Multi-screen designs, Figma frames, front-end code, and a DESIGN.md"},
  {"label": "Costs", "value": "Free, with a daily limit on generations"},
  {"label": "Good for", "value": "Getting a design system when you do not have one"}
]'::jsonb, updated_at = now() where slug = 'google-stitch';

update tools set key_facts = '[
  {"label": "Run by", "value": "designkit-md — a community project, not Google"},
  {"label": "Cost", "value": "Free; a free API key is needed to download through the MCP server"},
  {"label": "MCP server", "value": "npx designmd-mcp, roughly 2K tokens of context"},
  {"label": "Also ships", "value": "Two skills: one for authoring a DESIGN.md, one for finding one"},
  {"label": "Watch out", "value": "Files are user-submitted; read one before you adopt it"}
]'::jsonb, updated_at = now() where slug = 'designmd-ai';

update tools set key_facts = '[
  {"label": "Run by", "value": "ft.ia.br — a community project, not Google"},
  {"label": "Cost", "value": "Free"},
  {"label": "Organised by", "value": "Visual style, plus a set drawn from real companies"},
  {"label": "Best part", "value": "A setup guide each for Claude Code, Cursor, Kiro, Windsurf, Copilot and Stitch"},
  {"label": "Watch out", "value": "Files are community-contributed; quality varies"}
]'::jsonb, updated_at = now() where slug = 'designmd-app';

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('design-md',     array['design','open-source','official','frontend','code-generation']),
  ('google-stitch', array['design','free-tier','frontend','code-export','no-code']),
  ('designmd-ai',   array['design','free-tier','local-mcp','skills-ecosystem','frontend']),
  ('designmd-app',  array['design','free-tier','frontend'])
) as v(slug, tag_slugs)
join tools t on t.slug = v.slug
join tags g on g.slug = any (v.tag_slugs)
on conflict (tool_id, tag_id) do nothing;

-- The format is the hub: Stitch writes one, the two libraries hand you one,
-- and the agents are what read it. Edges point out from each row, so the
-- format's own page collects the libraries as incoming "Works with".
insert into tool_links (tool_id, linked_tool_id, kind, note, sort_order)
select a.id, b.id, n.kind::tool_link_kind, n.note, n.sort_order
from (values
  ('design-md',     'google-stitch', 'official',   'Google''s own tool, which exports one', 0),
  ('design-md',     'claude-code',   'pairs_with', 'reads it from your project root', 1),
  ('design-md',     'cursor',        'pairs_with', 'reads it from your project root', 2),
  ('designmd-ai',   'design-md',     'pairs_with', 'the format it indexes', 0),
  ('designmd-app',  'design-md',     'pairs_with', 'the format it indexes', 0)
) as n(a_slug, b_slug, kind, note, sort_order)
join tools a on a.slug = n.a_slug
join tools b on b.slug = n.b_slug
on conflict (tool_id, linked_tool_id) do nothing;
