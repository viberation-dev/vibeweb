-- Guide: MCP servers, giving your AI tool hands (VIB-223).
--
-- Row 1 of docs/extend-guides-plan.md. The concept piece the two
-- tool-specific MCP guides should have been able to assume: both Playwright
-- and Supabase open by explaining what MCP is, because there was nothing to
-- link to.
--
-- Inserted published, not as a draft. Unlike the VIB-221 guide this uses only
-- block kinds the live renderer already knows -- mcp_install shipped in
-- VIB-217 and is on production -- so there is no window where a visitor would
-- see plain body text.
--
-- Scope is row 0's job and is linked, not repeated. Install tabs come from
-- MCP_CLIENTS. What is authored here is the judgement: when a server is worth
-- it, what it costs, and how to tell it is actually connected.
insert into content (type, title, slug, body, role_level, pillar, status, blocks) values
(
  'guide',
  'MCP servers: giving your AI tool hands',
  'mcp-servers-explained',
  'Your AI tool can read your files and run commands in your terminal. That is the whole list. An MCP server is how it reaches anything else: a browser, a database, your error tracker, a design file. This is what they are, when one is worth adding, and what it costs you.',
  'beginner',
  'fundamentals',
  'published',
  '[
    {"kind": "text", "body": "Out of the box, your AI coding tool can do two things to the outside world: read and write files in your project, and run commands in your terminal. That is genuinely it.\n\nEverything else it appears to know, it is inferring from your code. Ask whether your deployed site is up and it will reason from the config. Ask what is in your database and it will read the schema file and guess."},
    {"kind": "text", "body": "An MCP server closes one of those gaps. It is a small program that exposes a specific thing — a browser, a database, an issue tracker, a payments dashboard — as a set of actions your tool can take. Install the Playwright one and your tool can open a page and tell you what is on it. Install the Supabase one and it can query your actual data instead of your schema file."},
    {"kind": "callout", "tone": "info", "body": "MCP stands for Model Context Protocol. It is an open standard for plugging a tool into an AI assistant, and the point of a standard is that one server works in every client that speaks it.\n\nYou do not need to understand the protocol to use one, any more than you need to understand HTTP to open a website."},
    {"kind": "heading", "level": 2, "title": "When one is worth it"},
    {"kind": "text", "body": "The test is whether the answer exists somewhere your tool cannot currently look.\n\nWorth it: checking whether the page you just changed actually renders. Reading real rows out of a database. Pulling the text of a ticket you are about to work on. Anything where you would otherwise copy and paste something in by hand, repeatedly.\n\nNot worth it: writing code, explaining an error, refactoring, anything already in the files. Your tool is better at those without help, and every server you add makes it slightly worse at all of them. That is the next section."},
    {"kind": "heading", "level": 2, "title": "What it costs"},
    {"kind": "callout", "tone": "warning", "body": "Every connected server loads a description of all its actions into the start of every conversation, before you type anything. A couple of servers is fine. Six is a meaningful bite out of the context window in every session, including the ones where you are just fixing a typo.\n\nThis is the most common cause of a tool that seems sharp in the morning and vague by the afternoon, and almost nobody traces it back to the servers they installed weeks ago."},
    {"kind": "text", "body": "There is a second cost, and it is the one worth being careful about. An MCP server is a program running on your machine with whatever access you gave it. A database server can usually write as well as read. A browser server can act as you on any site you are logged into.\n\nThat is not a reason to avoid them. It is a reason to install the one you need rather than the ten that looked interesting, and to prefer read-only access when a server offers it."},
    {"kind": "heading", "level": 2, "title": "Install one"},
    {"kind": "text", "body": "Playwright is a good first one: it gives your tool a browser, which is the gap you notice most, and it needs no account or key. Pick your tool below."},
    {"kind": "mcp_install", "server": "playwright", "command": "npx @playwright/mcp@latest"},
    {"kind": "callout", "tone": "tip", "body": "The first run downloads a browser, so give it a minute rather than assuming it hung.\n\nIf npx is not a command your terminal recognises, install Node.js first and open a new terminal."},
    {"kind": "text", "body": "Whether that lands in the project or on your whole machine is the one real decision here, and it is the same decision for skills and CLIs. The scope guide covers it properly."},
    {"kind": "heading", "level": 2, "title": "Check it actually connected"},
    {"kind": "text", "body": "This matters more than it sounds. A tool with no server connected will often answer the question anyway, from memory, in a confident voice. You want a question it cannot possibly answer without really looking."},
    {"kind": "prompt", "label": "Paste this into your AI tool", "prompt": "Using Playwright, open example.com and tell me exactly what the main heading says.", "prompts": [
      {"title": "Prove it is connected", "prompt": "Using Playwright, open example.com and tell me exactly what the main heading says."},
      {"title": "Point it at your own work", "prompt": "Using Playwright, open http://localhost:3000 and describe what you see. If anything is broken or an error appears in the console, tell me what it is before suggesting a fix."},
      {"title": "List what you have connected", "prompt": "Which MCP servers are connected right now, and what can each one actually do? Do not change anything."}
    ]},
    {"kind": "text", "body": "A browser window should open and it should answer \"Example Domain\". If it answers without opening anything, it is working from memory and the server is not connected — check the MCP list in your tool, and restart it if you installed the server mid-session."},
    {"kind": "heading", "level": 2, "title": "Where to find servers worth having"},
    {"kind": "text", "body": "Start from what you already use. The best first server is almost always one for a service that is already part of your day, because that is where the copying and pasting is.\n\nTwo warnings on browsing. An official server from the company that makes the product is a different proposition from one person''s weekend project with access to your database. And a server that has not been updated in a year is usually a server whose API has moved on."},
    {"kind": "links", "links": [
      {"label": "Browse MCP servers", "href": "/tools?category=mcp_servers"},
      {"label": "Global or project: where config lives", "href": "/learn/global-or-project-config"},
      {"label": "Playwright MCP, without burning your context window", "href": "/learn/playwright-mcp-guide"},
      {"label": "Supabase MCP, safely", "href": "/learn/supabase-mcp-guide"}
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

-- `mcp-client` only, as on the scope guide: related reading matches any
-- shared facet, so a second tag sprays this across unrelated tool pages.
insert into content_tags (content_id, tag_id)
select c.id, t.id
from content c
join tags t on t.slug in ('mcp-client')
where c.slug = 'mcp-servers-explained'
on conflict do nothing;
