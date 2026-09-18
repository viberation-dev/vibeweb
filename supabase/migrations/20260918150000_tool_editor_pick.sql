-- Editor's picks (VIB-182).
--
-- A flag staff tick in the tool editor; each category page shows its picks
-- as one curated row above the grid. A boolean rather than a picks table:
-- a tool is picked for the one category it belongs to, so there is nothing
-- to relate. Order within the row follows the page's sort.
--
-- `tools` already grants select to anon/authenticated and writes to staff
-- through RLS (migration 03), and those table-level grants cover a new
-- column, so nothing else to grant.

alter table tools
  add column editor_pick boolean not null default false;

-- Starter picks, so every category has a row on day one. Staff re-pick in
-- the admin editor; a slug that no longer exists is simply skipped.
update tools set editor_pick = true
where slug in (
  'claude',
  'claude-ai',
  'lovable', 'bolt', 'v0',
  'vercel', 'netlify', 'github-pages',
  'copilot-coding-agent', 'devin', 'claude-agent-sdk',
  'cursor', 'vs-code', 'google-antigravity',
  'windows-terminal', 'warp', 'ghostty',
  'claude-code', 'codex', 'gemini-cli',
  'superpowers', 'frontend-design', 'systematic-debugging',
  'github-mcp-server', 'supabase-mcp-server', 'playwright-mcp',
  'github-copilot',
  'nextjs',
  'shadcn-ui',
  'n8n',
  'supabase',
  'openrouter', 'skills-sh', 'resend'
);
