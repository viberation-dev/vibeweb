-- Guide: Playwright MCP, the first structured tool guide (VIB-192).
--
-- Inserted as a draft on purpose. One Supabase project serves production and
-- every preview, so a published row would appear on the live site before the
-- renderer merges. RLS hides drafts from non-staff, so the preview
-- deployment renders it for review while production sees nothing. A
-- follow-up migration publishes it once this is merged.
--
-- `body` is kept as a short plain summary even though `blocks` is the page:
-- generateMetadata and the structured data still read body, and a guide with
-- no meta description is a guide search engines describe badly.
insert into content (type, title, slug, body, role_level, pillar, status, blocks) values
(
  'guide',
  'Playwright MCP without burning your context window',
  'playwright-mcp-guide',
  'Playwright MCP lets your AI tool drive a real browser: clicking, filling forms and reading what is actually on the page. Installing it takes one command. Using it without eating your whole context window takes a little more, and that is the part nobody tells you.',
  'beginner',
  'tool_reviews',
  'draft',
  '[
    {"kind": "text", "body": "Your AI tool can write a login form. It cannot normally tell you whether the form works, because it cannot see your site. It is reasoning from the code.\n\nPlaywright MCP closes that gap. It gives your tool a real browser it can drive: open a page, click a button, fill a field, read what came back. When it says the checkout works, it has been through the checkout."},
    {"kind": "text", "body": "Worth it when you are debugging something you can only see in a browser, checking a change actually rendered, or filling in the same test form for the twentieth time.\n\nNot worth it for writing code, explaining an error, or anything where the answer is already in the files. It is a browser, not a brain, and every page it reads costs you context."},
    {"kind": "callout", "tone": "info", "body": "MCP stands for Model Context Protocol. It is a standard way to plug a tool into an AI assistant. You do not need to understand the protocol to use it, any more than you need to understand HTTP to open a website."},
    {"kind": "tabs", "label": "Install it in", "tabs": [
      {"key": "claude-code", "title": "Claude Code", "blocks": [
        {"kind": "text", "body": "One command, run in your terminal."},
        {"kind": "code", "language": "bash", "code": "claude mcp add playwright npx @playwright/mcp@latest", "expected": "A line confirming the server was added. Restart Claude Code, then run /mcp to see playwright listed as connected."},
        {"kind": "text", "body": "That adds it to this project only, and keeps it private to you. That is the default."},
        {"kind": "code", "language": "bash", "code": "claude mcp add --scope user playwright npx @playwright/mcp@latest", "expected": "The same confirmation. Playwright MCP is now available in every project on your machine, still just for you."},
        {"kind": "text", "body": "Or share it with your team through git, which writes a .mcp.json file in the project for you to commit:"},
        {"kind": "code", "language": "bash", "code": "claude mcp add --scope project playwright npx @playwright/mcp@latest", "expected": "The same confirmation, and a .mcp.json file in your project folder. Commit that file so your team gets the same setup."}
      ]},
      {"key": "cursor", "title": "Cursor", "blocks": [
        {"kind": "text", "body": "Open Cursor Settings, then MCP, then Add new MCP Server. Give it the name playwright and the command npx @playwright/mcp@latest.\n\nIf you would rather edit the file directly, that panel is writing this:"},
        {"kind": "code", "language": "json", "code": "{\n  \"mcpServers\": {\n    \"playwright\": {\n      \"command\": \"npx\",\n      \"args\": [\"@playwright/mcp@latest\"]\n    }\n  }\n}", "expected": "Playwright appears in Cursor''s MCP list with a green dot once it connects."},
        {"kind": "text", "body": "Put that in ~/.cursor/mcp.json for every project, or .cursor/mcp.json inside one project for just that one."}
      ]},
      {"key": "vs-code", "title": "VS Code", "blocks": [
        {"kind": "text", "body": "One command, run in your terminal."},
        {"kind": "code", "language": "bash", "code": "code --add-mcp ''{\"name\":\"playwright\",\"command\":\"npx\",\"args\":[\"@playwright/mcp@latest\"]}''", "expected": "VS Code confirms the server was added. Reload the window and Playwright appears in the MCP servers list."}
      ]}
    ]},
    {"kind": "callout", "tone": "tip", "body": "The first run downloads a browser, so give it a minute and do not panic at the pause. After that it starts in seconds.\n\nYou need Node.js installed. If npx is not a command your terminal knows, install Node first."},
    {"kind": "text", "body": "Check it works. Ask your tool to do something small and verifiable:"},
    {"kind": "prompt", "label": "Copy this into your AI tool", "prompt": "Using Playwright, open example.com and tell me exactly what the main heading says.", "prompts": [
      {"title": "Check it works", "prompt": "Using Playwright, open example.com and tell me exactly what the main heading says."},
      {"title": "Check my own site", "prompt": "Using Playwright, open http://localhost:3000 and tell me what you see. If anything looks broken, or an error appears in the console, describe it before suggesting a fix."},
      {"title": "Fill in a form", "prompt": "Using Playwright, open [your page], fill in the form with sensible test values, submit it, and tell me what happened. Do not use real personal details."}
    ]},
    {"kind": "text", "body": "It should open a browser window, read the page and answer \"Example Domain\". If it answers without opening anything, it is working from memory and the server is not connected. Check the MCP list in your tool."},
    {"kind": "callout", "tone": "warning", "body": "This is the part that costs you money and patience.\n\nEvery time your tool looks at a page, it reads a text description of the whole thing. On a real app that can be thousands of tokens, and it does it again after every single click. Three or four page reads can fill more of your context window than the entire codebase you are working on. People blame the model for going vague halfway through a session; usually it is this."},
    {"kind": "text", "body": "Four habits that fix it.\n\n1. Ask for what you need, not for everything. \"Find the submit button\" uses a search that returns a few lines. \"Look at the page\" returns the whole thing. Say what you are after.\n\n2. Skip screenshots unless you need to see it. An image costs far more than the text description, and for \"did this button move\" the text already answers you. Ask for a screenshot when the question is genuinely visual.\n\n3. Close the tab when you are done. Tabs left open keep showing up in what your tool reads.\n\n4. Start a fresh session after a long browser stretch. Once the context is full of stale page snapshots, clearing it is faster than fighting it."},
    {"kind": "text", "body": "If you are doing a lot of browser work, the server has flags for this. Turning image responses off stops screenshots eating the budget:"},
    {"kind": "code", "language": "bash", "code": "claude mcp add playwright -- npx @playwright/mcp@latest --image-responses omit", "expected": "The same confirmation. Your tool now works from text descriptions only, which is what you want for most debugging."},
    {"kind": "text", "body": "Add --headless to stop a browser window popping up, and --isolated to throw away cookies and logins between runs rather than keeping a profile on disk. Both go after the -- as well, alongside --image-responses."},
    {"kind": "callout", "tone": "warning", "body": "It really does drive a real browser as you. If you point it at a site you are logged into, it can act as you there: click things, submit things, buy things. Keep it on sites you own or test accounts you do not mind breaking, and read what it is about to do before approving it. --isolated is a good default for this reason."},
    {"kind": "text", "body": "When it goes wrong, it is usually one of three things.\n\nNothing happens and your tool answers from memory. The server is not connected. Check the MCP list in your tool, and restart it after installing.\n\nnpx: command not found. Node.js is not installed, or not on your PATH. Install Node and open a new terminal.\n\nIt opens the page but sees nothing useful. The page is probably still loading. Ask it to wait for a specific piece of text to appear before reading."},
    {"kind": "links", "links": [
      {"label": "Playwright MCP in the directory", "href": "/tools/playwright-mcp"},
      {"label": "Official documentation", "href": "https://github.com/microsoft/playwright-mcp"},
      {"label": "More MCP servers", "href": "/tools?category=mcp_servers"}
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

-- Tagged narrowly. The related-reading query on a tool page matches *any*
-- shared facet tag, so tagging this `official` would surface it on dozens of
-- unrelated tools. local-mcp and testing are the two Playwright MCP carries
-- that actually describe this guide.
insert into content_tags (content_id, tag_id)
select c.id, t.id
from content c
join tags t on t.slug in ('local-mcp', 'testing')
where c.slug = 'playwright-mcp-guide'
on conflict do nothing;
