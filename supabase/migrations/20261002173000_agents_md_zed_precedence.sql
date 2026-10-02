-- AGENTS.md: Zed reads it seventh, not first (VIB-220).
--
-- Finishes the check VIB-219 started. Cursor, Jules, Copilot's coding agent
-- and Devin are all listed correctly and are untouched. Zed is not.
--
-- Zed reads one project instruction file, the first match from:
--   .rules, .cursorrules, .windsurfrules, .clinerules,
--   .github/copilot-instructions.md, AGENT.md, AGENTS.md, CLAUDE.md,
--   GEMINI.md
--
-- AGENTS.md is seventh. A repo carrying any of the six above it gets that
-- file read instead and the AGENTS.md is never loaded -- including AGENT.md,
-- singular, which is easy to have by accident and reads as a typo of the
-- file that is actually being ignored.
--   zed.dev/docs/ai/instructions, read 2026-10-02.
--
-- The fourth per-tool caveat on this row, which is itself the honest shape of
-- the subject: most tools read AGENTS.md, and the ones that do not all fail
-- the same quiet way -- your file exists, and nothing reads it.
update tools set key_facts = '[
  {"label": "What it is", "value": "An AGENTS.md file at your repository root, in plain Markdown"},
  {"label": "Usually holds", "value": "Setup and build commands, how to run tests, code style, PR rules"},
  {"label": "Required fields", "value": "None — any headings you like"},
  {"label": "Monorepos", "value": "One per package; the agent uses the nearest file"},
  {"label": "Read by", "value": "Codex, Cursor, Copilot''s coding agent, Jules, Devin and more"},
  {"label": "Claude Code", "value": "Reads it only where there is no CLAUDE.md in the folder"},
  {"label": "Gemini CLI", "value": "Reads GEMINI.md instead, until you add AGENTS.md to context.fileName in settings.json"},
  {"label": "Aider", "value": "Reads no instruction file on its own — pass --read CONVENTIONS.md, or set read: in .aider.conf.yml"},
  {"label": "Zed", "value": "Reads one file, first match wins: .rules, .cursorrules, .windsurfrules, .clinerules, .github/copilot-instructions.md, AGENT.md, then AGENTS.md"},
  {"label": "Stewarded by", "value": "The Agentic AI Foundation, under the Linux Foundation"}
]'::jsonb, updated_at = now() where slug = 'agents-md';

-- Fails loudly rather than leaving Zed in the plain list.
do $$
begin
  if not exists (
    select 1 from tools
    where slug = 'agents-md'
      and key_facts @> '[{"label": "Zed"}]'::jsonb
  ) or exists (
    select 1 from tools
    where slug = 'agents-md'
      and key_facts::text like '%Jules, Zed%'
  ) then
    raise exception 'agents-md still lists Zed as reading AGENTS.md outright';
  end if;
end $$;
