-- Manus, Sixth and TasteCode (VIB-250).
--
-- Three more links from Ali, read off each site on 2026-10-10.
--
--   Manus      a general agent rather than a coding one, so agents, next to
--              Devin and Jules. Meta announced it was buying Manus in
--              December 2025 and the deal did not complete; the row says
--              "independent" and leaves the story out. Its pricing page
--              would not render, so key_facts carries no figure.
--   Sixth      a VS Code extension in the Cline mould, so plugins. Prices
--              are from trysixth.com/pricing.
--   TasteCode  a desktop app that drives Claude Code, Codex and Grok, which
--              is the GitHub Copilot app's shape, so desktop_apps. Same maker
--              as the Taste Skill row, hence the link.
insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url, platform, best_for, badge)
values
  ('Manus', 'manus', 'agents',
   'A general AI agent that does the task instead of describing it.',
   'Manus is a general-purpose agent: you describe an outcome and it goes away, browses, writes and builds until there is something to hand back. That might be a researched report, a slide deck, a website, a small game or an edited video. Wide Research fans one question out to many agents at once, the browser operator works inside your own logged-in browser, and automations run a task on a schedule. For vibe coders it is the tool for the work around the code, and for quick sites and prototypes. It is an independent company, and usage is metered in credits.',
   'Freemium', 'https://manus.im', array['web','ios','android'], 'beginner', null),

  ('Sixth', 'sixth', 'plugins',
   'A low-cost coding agent for VS Code you can steer from Telegram.',
   'Sixth is a coding agent that installs as a VS Code extension. It plans before it writes, in a mode it calls Deep Planning, runs sub-agents in parallel for research and checking, and shows you every change before it is applied. The unusual part is remote control: start a task on your computer, then watch, approve and redirect it from Telegram on your phone. It supports MCP, skills and hooks, and its paid plans cost well under the usual twenty dollars. The free plan is a monthly request allowance.',
   'Freemium', 'https://trysixth.com', array['macos','windows','linux'], 'intermediate', null),

  ('TasteCode', 'tastecode', 'desktop_apps',
   'A desktop home for Claude Code, Codex and Grok, with a design mode.',
   'TasteCode is a free, open-source desktop app that runs the coding agents you already pay for. It drives each provider''s own CLI, signed in with your account, and shows how much of each plan you have left. What sets it apart is Design Mode: describe a website and the agent works through a fixed sequence of brief, brand direction, page plan, assets, build and review, then fixes what the review found. Checkpoints restore your files and the conversation together. It is an early beta, from the makers of the Taste Skill.',
   'Open source', 'https://tastecode.dev', array['macos','windows'], 'intermediate', null)
on conflict (slug) do nothing;

update tools set key_facts = f.facts, updated_at = now()
from (values
  ('manus', '[
    {"label": "Made by", "value": "Manus AI"},
    {"label": "Costs", "value": "Free to start; paid plans add credits"},
    {"label": "Makes", "value": "Reports, slides, websites, games, video and designs"},
    {"label": "Also does", "value": "Wide Research, scheduled automations and a browser operator"},
    {"label": "Apps", "value": "Web, mobile and desktop"},
    {"label": "Good for", "value": "The research and writing around a build"}
  ]'::jsonb),
  ('sixth', '[
    {"label": "Free plan", "value": "50 agent requests and 2,000 completions a month"},
    {"label": "Paid plans from", "value": "$8 a month (Pro)"},
    {"label": "Works in", "value": "VS Code"},
    {"label": "Models", "value": "Claude, GPT and Gemini"},
    {"label": "Remote control", "value": "Watch and approve tasks from Telegram, on paid plans"},
    {"label": "Supports", "value": "MCP, skills and hooks"}
  ]'::jsonb),
  ('tastecode', '[
    {"label": "Cost", "value": "Free and open source (Apache 2.0)"},
    {"label": "Runs", "value": "Claude Code, Codex and Grok, through their own CLIs"},
    {"label": "Models", "value": "None of its own; you bring your subscriptions"},
    {"label": "Design Mode", "value": "Brief, brand, plan, assets, build and review for a website"},
    {"label": "Platforms", "value": "Mac on Apple silicon, and Windows"},
    {"label": "Worth knowing", "value": "Early beta; the Windows build is unsigned"}
  ]'::jsonb)
) as f(slug, facts)
where tools.slug = f.slug;

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('manus', array['cloud-agent','multi-agent','automation','search','websites','free-tier','beginner-friendly']),
  ('sixth', array['coding-agent','code-generation','extension','vs-code','mcp-client','free-tier','macos','windows','linux']),
  ('tastecode', array['open-source','coding-agent','design','frontend','local-files','macos','windows'])
) as m(slug, tag_slugs)
join tools t on t.slug = m.slug
join tags g on g.slug = any(m.tag_slugs)
on conflict (tool_id, tag_id) do nothing;

insert into tool_links (tool_id, linked_tool_id, kind, note, sort_order)
select a.id, b.id, 'pairs_with', n.note, n.sort_order
from (values
  ('manus', 'devin', 'the agent for the code itself', 0),
  ('manus', 'perplexity', 'for an answer rather than a finished deliverable', 1),
  ('sixth', 'cline', 'the open-source one it resembles', 0),
  ('tastecode', 'taste-skill', 'the same makers'' design skill', 0),
  ('tastecode', 'claude-code', 'one of the agents it drives', 1),
  ('tastecode', 'codex', 'another one', 2)
) as n(slug, linked_slug, note, sort_order)
join tools a on a.slug = n.slug
join tools b on b.slug = n.linked_slug
on conflict (tool_id, linked_tool_id) do nothing;
