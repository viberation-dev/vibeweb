-- Qoder, Alibaba's agentic coding platform (VIB-212).
--
-- Filed under ides rather than desktop_apps or agents: the thing you download
-- and the thing the row is about is an IDE, a VS Code fork in the same shape
-- as Cursor, Trae and Kiro. The JetBrains plugin, CLI, desktop app and mobile
-- client are the same agent reached from elsewhere, which under the VIB-191
-- rule is where it runs, not what it can do — one row, not five.
--
-- The two facts a reader cannot get from "another Cursor" are Quest mode
-- (describe a feature, it goes away and ships it across files, rather than
-- editing with you turn by turn) and RepoWiki (a generated map of the
-- codebase it keeps between sessions). Those lead the description.
--
-- The other fact worth being plain about is the models: Qwen, DeepSeek, Kimi
-- and GLM, with auto-routing, and no Claude or GPT. For most readers here
-- that is the deciding detail, so it is in the tagline-adjacent first half
-- rather than buried in key_facts.
--
-- Taken from qoder.com and qoder.com/pricing on 2026-10-01: Community Edition
-- $0, Pro $20/mo, Pro+ $60/mo, Ultra $200/mo, all metered in credits, with a
-- one-off 14-day Pro trial on a new account. Hence Freemium and free-tier.
--
-- No badge: Qoder launched in August 2025 and is a year old, so 'new' would
-- be wrong, and 'popular' is a claim this directory has not checked.
insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url, platform, best_for, badge)
values
  ('Qoder', 'qoder', 'ides',
   'An agentic IDE that reads the whole repo first.',
   'Qoder is Alibaba''s coding IDE, built on VS Code like Cursor and Trae, and its two distinctive parts are Quest mode and RepoWiki. Quest mode is the delegating one: you describe a feature, it plans, writes across however many files it needs and checks its own work, rather than editing alongside you a turn at a time. RepoWiki is a map of your codebase that it generates and keeps, so the agent starts each session already knowing how the project fits together instead of rediscovering it. The models behind it are Qwen, DeepSeek, Kimi and GLM, picked by you or routed automatically — there is no Claude or GPT here, which is the thing to check before you switch. The same agent is also reachable from a JetBrains plugin, a CLI, a desktop app and a phone app. The free Community Edition is real but light; paid plans are metered in credits.',
   'Freemium', 'https://qoder.com', array['macos','windows','linux'], 'intermediate', null)
on conflict (slug) do nothing;

update tools set key_facts = '[
  {"label": "Made by", "value": "Alibaba"},
  {"label": "Built on", "value": "VS Code"},
  {"label": "Models", "value": "Qwen, DeepSeek, Kimi and GLM, or auto-routed"},
  {"label": "Also available as", "value": "A JetBrains plugin, a CLI, a desktop app and a phone app"},
  {"label": "Costs", "value": "Free Community Edition; Pro $20, Pro+ $60 and Ultra $200 a month, metered in credits"},
  {"label": "Worth knowing", "value": "New accounts get one 14-day Pro trial"}
]'::jsonb, updated_at = now()
where slug = 'qoder';

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from tools t, tags g
where t.slug = 'qoder'
  and g.slug in ('coding-agent', 'code-generation', 'local-files', 'vs-code-based',
                 'mcp-client', 'jetbrains', 'free-tier', 'free-trial',
                 'windows', 'macos', 'linux')
on conflict (tool_id, tag_id) do nothing;

-- The rows a reader comparing agentic IDEs will already have open. kind is
-- pairs_with because that is the only third kind there is; tool_links has no
-- "alternative to", and adding one for three edges is not worth a type change.
insert into tool_links (tool_id, linked_tool_id, kind, note, sort_order)
select a.id, b.id, 'pairs_with', n.note, n.sort_order
from tools a
join (values
  ('cursor', 'the same shape, on Claude and GPT', 0),
  ('trae', 'the other VS Code fork out of ByteDance', 1),
  ('kiro', 'the other one that plans before it writes', 2)
) as n(slug, note, sort_order) on true
join tools b on b.slug = n.slug
where a.slug = 'qoder'
on conflict (tool_id, linked_tool_id) do nothing;

-- VIB-211 added the GitHub Copilot app with its platforms in key_facts but
-- left the platform column empty, so it is missing from the "runs on Windows"
-- filter its own page claims. Same three platforms, from the same source.
update tools set platform = array['macos','windows','linux'], updated_at = now()
where slug = 'github-copilot-app' and platform = '{}';
