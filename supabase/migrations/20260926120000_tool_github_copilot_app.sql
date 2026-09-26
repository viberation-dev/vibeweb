-- The GitHub Copilot app (VIB-211).
--
-- A desktop app under the VIB-191 rule: it changes what the tool can do, not
-- merely where it runs. The directory already has three Copilot rows and none
-- of them is this one —
--
--   github-copilot        the editor extension, in Plugins
--   copilot-chat          the chat half of that extension, in Plugins
--   copilot-coding-agent  the cloud agent you assign an issue to, in Agents
--
-- — so the slug is suffixed rather than taking `github-copilot`, which is
-- already the extension and is linked from elsewhere.
--
-- The interesting fact for a vibe coder is not that GitHub shipped an app.
-- It is that the app runs Claude Code and Codex alongside GitHub's own cloud
-- agent, in one window, on your repositories. That is the sentence the
-- tagline and the first line of the description carry.
--
-- Taken from github.com/features/ai/github-app on 2026-09-26: macOS, Windows
-- and Linux; works on any Copilot plan including the free one, or with your
-- own API key; Claude Code and Codex need Pro or higher; MCP servers, skills
-- and plugins sync from your GitHub settings, and custom servers can be added
-- locally or over HTTP; sessions are isolated, with their own branch, files
-- and terminal.
--
-- pricing_tier Freemium, matching the other Copilot rows: the app is on the
-- $0 plan, and the agents that make it interesting are not.
insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url, best_for, badge)
values
  ('GitHub Copilot app', 'github-copilot-app', 'desktop_apps',
   'Claude Code, Codex and GitHub''s own agent, in one window.',
   'The GitHub Copilot app is GitHub''s desktop app for working with agents on your repositories, and its draw is that it is not tied to one: you can run GitHub''s cloud agent, Claude Code or Codex from the same window, against the same repository. Work happens in sessions, each with its own branch, files and terminal, so you can start one from an issue, watch it, run checks and open the pull request without leaving the app. Your MCP servers, skills and plugins sync down from your GitHub settings, and you can point it at custom ones locally or over HTTP. It runs on macOS, Windows and Linux, works on any Copilot plan including the free one or with your own API key, and the Claude Code and Codex agents need Pro or above.',
   'Freemium', 'https://github.com/features/ai/github-app', 'intermediate', 'new')
on conflict (slug) do nothing;

update tools set key_facts = '[
  {"label": "Made by", "value": "GitHub"},
  {"label": "Runs", "value": "GitHub''s cloud agent, Claude Code and Codex"},
  {"label": "Runs on", "value": "macOS, Windows and Linux"},
  {"label": "Costs", "value": "On the free Copilot plan; Claude Code and Codex need Pro or above, or your own API key"},
  {"label": "Not the same as", "value": "The Copilot extension in your editor, which is a separate entry"}
]'::jsonb, updated_at = now()
where slug = 'github-copilot-app';

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from tools t, tags g
where t.slug = 'github-copilot-app'
  and g.slug in ('coding-agent', 'local-files', 'mcp-client', 'skills-ecosystem',
                 'free-tier', 'byok', 'windows', 'macos', 'linux')
on conflict (tool_id, tag_id) do nothing;

-- The three rows a reader will confuse this with, linked both ways by the
-- page itself would be four edges; one direction each is enough to get there.
insert into tool_links (tool_id, linked_tool_id, kind, note, sort_order)
select a.id, b.id, 'pairs_with', n.note, n.sort_order
from tools a
join (values
  ('github-copilot', 'the same subscription, inside your editor', 0),
  ('copilot-coding-agent', 'the cloud agent this app can drive', 1),
  ('claude-code', 'one of the agents it runs', 2)
) as n(slug, note, sort_order) on true
join tools b on b.slug = n.slug
where a.slug = 'github-copilot-app'
on conflict (tool_id, linked_tool_id) do nothing;
