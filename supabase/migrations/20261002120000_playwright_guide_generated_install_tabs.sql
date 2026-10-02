-- Playwright MCP guide: install tabs from MCP_CLIENTS (VIB-217).
--
-- Swaps the hand-authored `tabs` block for an `mcp_install` block, which
-- BlockView expands from lib/mcp-clients.ts at render time. Three effects:
-- the three commands stop being a copy that can drift from the matrix, the
-- guide gains the five clients it never mentioned, and a vendor moving a
-- config path becomes one edit in TypeScript rather than a migration per
-- guide.
--
-- ORDER OF OPERATIONS. `mcp_install` is a block kind the currently deployed
-- renderer does not know. guideBlocksSchema rejects an unknown kind, and
-- toGuideBlocks returns null for *any* failure, so a page whose blocks fail
-- falls back to rendering plain `body`. One Supabase project serves
-- production and every preview, so applying this before the code is deployed
-- degrades the live guide to a paragraph of summary text. Apply it after the
-- PR merges and Vercel has deployed, not before.
--
-- Rewrites only the one element rather than the whole array: the guide's
-- other eighteen blocks are not this change's business, and re-authoring them
-- here would be a second copy of them for a reviewer to diff by eye.
--
-- The Supabase MCP guide is deliberately untouched. It connects to a remote
-- HTTP server by URL, `mcp_install` covers local stdio servers only, and the
-- remote variant needs its own per-client transport facts first.
update content
set
  blocks = (
    select jsonb_agg(
      case
        when block->>'kind' = 'tabs' and block->>'label' = 'Install it in'
          then jsonb_build_object(
            'kind', 'mcp_install',
            'server', 'playwright',
            'command', 'npx @playwright/mcp@latest'
          )
        else block
      end
      order by position
    )
    from jsonb_array_elements(blocks) with ordinality as element(block, position)
  ),
  updated_at = now()
where slug = 'playwright-mcp-guide'
  and blocks @> '[{"kind": "tabs", "label": "Install it in"}]'::jsonb;

-- Fails loudly if the block was not there to replace, rather than leaving a
-- guide that silently still carries the old copy.
do $$
begin
  if not exists (
    select 1 from content
    where slug = 'playwright-mcp-guide'
      and blocks @> '[{"kind": "mcp_install"}]'::jsonb
  ) then
    raise exception 'playwright-mcp-guide has no mcp_install block: the install tabs were not swapped';
  end if;
end $$;
