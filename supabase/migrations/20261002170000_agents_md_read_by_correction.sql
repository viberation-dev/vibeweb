-- AGENTS.md: correct which tools actually read it (VIB-219).
--
-- The row listed Gemini CLI and Aider under "Read by". Building CODING_CLIS
-- (VIB-216) against each vendor's own docs showed neither reads it the way
-- that fact implies:
--
--   Gemini CLI reads GEMINI.md. It reads AGENTS.md only once you add it to
--   `context.fileName` in settings.json.
--     google-gemini/gemini-cli, docs/cli/gemini-md.md, read 2026-10-02.
--
--   Aider loads no instruction file automatically at all. CONVENTIONS.md is
--   a convention you pass with --read, or set as `read:` in
--   .aider.conf.yml.
--     aider.chat/docs/usage/conventions.html, read 2026-10-02.
--
-- Stated per tool rather than softened in the list, which is what the row
-- already does for Claude Code. The failure this avoids is someone writing
-- the file, assuming their tool reads it, and never finding out it did not.
--
-- Cursor, Copilot's coding agent, Jules, Zed and Devin are left exactly as
-- they were. They were not checked in this pass, and quietly re-wording a
-- fact nobody verified is how the row got this wrong in the first place.
update tools set key_facts = '[
  {"label": "What it is", "value": "An AGENTS.md file at your repository root, in plain Markdown"},
  {"label": "Usually holds", "value": "Setup and build commands, how to run tests, code style, PR rules"},
  {"label": "Required fields", "value": "None — any headings you like"},
  {"label": "Monorepos", "value": "One per package; the agent uses the nearest file"},
  {"label": "Read by", "value": "Codex, Cursor, Copilot''s coding agent, Jules, Zed, Devin and more"},
  {"label": "Claude Code", "value": "Reads it only where there is no CLAUDE.md in the folder"},
  {"label": "Gemini CLI", "value": "Reads GEMINI.md instead, until you add AGENTS.md to context.fileName in settings.json"},
  {"label": "Aider", "value": "Reads no instruction file on its own — pass --read CONVENTIONS.md, or set read: in .aider.conf.yml"},
  {"label": "Stewarded by", "value": "The Agentic AI Foundation, under the Linux Foundation"}
]'::jsonb, updated_at = now() where slug = 'agents-md';

-- Fails loudly rather than leaving the wrong fact in place.
do $$
begin
  if exists (
    select 1 from tools
    where slug = 'agents-md'
      and key_facts @> '[{"label": "Read by"}]'::jsonb
      and (
        key_facts::text like '%Gemini CLI, Jules%'
        or key_facts::text like '%Zed, Aider%'
      )
  ) then
    raise exception 'agents-md still lists Gemini CLI or Aider as reading AGENTS.md outright';
  end if;
end $$;
