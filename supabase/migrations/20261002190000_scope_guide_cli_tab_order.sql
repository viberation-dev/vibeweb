-- Scope guide: open the CLI tabs on Claude Code, not Aider (VIB-222).
--
-- Two things only visible once the guide was published.
--
-- cliConfigTabs defaults to CODING_CLI_IDS order, which is alphabetical, so
-- the CLI section opened on Aider: the one CLI that reads no instruction file
-- at all and keeps its settings in a single YAML file rather than a
-- directory. The exception, presented as the example, to a beginner. The
-- block already takes a `clis` list, so the guide passes one -- most-used
-- first, odd-one-out last.
--
-- And the AGENTS.md callout told the reader to "check the tab above" for Zed,
-- which has no tab: Zed is an editor and is not in CODING_CLIS. It now points
-- at the AGENTS.md row, which carries all four caveats including Zed's.
--
-- Content only. Nothing here is a new block kind, so unlike the VIB-221
-- migrations this is safe to apply whenever.
update content
set
  blocks = (
    select jsonb_agg(
      case
        when block->>'kind' = 'cli_config'
          then block || jsonb_build_object(
            'clis',
            jsonb_build_array('claude-code', 'codex', 'gemini-cli', 'opencode', 'qwen-code', 'aider')
          )
        when block->>'kind' = 'callout'
         and block->>'body' like 'This is the part that catches people out.%'
          then jsonb_build_object(
            'kind', 'callout',
            'tone', 'warning',
            'body', 'This is the part that catches people out. Writing an AGENTS.md does not mean your tool reads it.

Claude Code reads it only where there is no CLAUDE.md. Gemini CLI reads GEMINI.md until you name AGENTS.md in its settings. Aider reads nothing at all unless you pass it. Zed reads whichever of nine files it finds first, and AGENTS.md is seventh.

If you share a repo with people using different tools, check each one before assuming a single file covers everyone. The AGENTS.md entry in the directory lists who reads it and who only looks like they do.'
          )
        else block
      end
      order by position
    )
    from jsonb_array_elements(blocks) with ordinality as element(block, position)
  ),
  updated_at = now()
where slug = 'global-or-project-config';

do $$
begin
  if not exists (
    select 1 from content
    where slug = 'global-or-project-config'
      and blocks @> '[{"kind": "cli_config", "clis": ["claude-code"]}]'::jsonb
  ) then
    raise exception 'scope guide cli_config block did not get its client order';
  end if;
end $$;
