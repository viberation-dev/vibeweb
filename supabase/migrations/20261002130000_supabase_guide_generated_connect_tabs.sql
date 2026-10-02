-- Supabase MCP guide: connect tabs from MCP_CLIENTS (VIB-218).
--
-- The remote half of VIB-217. Swaps this guide's hand-authored `tabs` block
-- for an `mcp_connect` block, which BlockView expands from
-- lib/mcp-clients.ts at render time.
--
-- The guide goes from three clients to ten. That is not padding: a remote
-- server genuinely works everywhere, including Claude.ai and ChatGPT, which
-- cannot run a local server at all. Three tabs implied a limit that was never
-- there.
--
-- ORDER OF OPERATIONS, as in the VIB-217 migration. `mcp_connect` is a block
-- kind the deployed renderer does not know, an unknown kind makes
-- toGuideBlocks return null, and the page then falls back to plain `body`.
-- Apply this after the PR merges and Vercel has deployed.
--
-- The placeholder stays a placeholder. `url` is authored exactly as it is
-- rendered, so YOUR_PROJECT_REF reaches the reader rather than a project ref
-- that looks real and is not. The warning that used to live inside each tab's
-- prose is lifted out beside the tabs, since the generated tabs have no prose
-- to carry it.
--
-- One statement: each block maps to one or two blocks and the result is
-- aggregated once. Re-running is a no-op, because after the first run there
-- is no `tabs` block left to match.
update content
set
  blocks = (
    select jsonb_agg(replacement order by position, sub)
    from jsonb_array_elements(blocks) with ordinality as element(block, position)
    cross join lateral unnest(
      case
        when block->>'kind' = 'tabs' and block->>'label' = 'Connect it in'
          then array[
            jsonb_build_object(
              'kind', 'callout',
              'tone', 'warning',
              'body', 'Replace YOUR_PROJECT_REF with your own project ref before you run any of this. It is in your Supabase dashboard URL. read_only=true is doing real work here: it stops the server writing to your database, and you can drop it once you trust what it does.'
            ),
            jsonb_build_object(
              'kind', 'mcp_connect',
              'server', 'supabase',
              'url', 'https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF&read_only=true'
            )
          ]
        else array[block]
      end
    ) with ordinality as expanded(replacement, sub)
  ),
  updated_at = now()
where slug = 'supabase-mcp-guide'
  and blocks @> '[{"kind": "tabs", "label": "Connect it in"}]'::jsonb;

-- Fails loudly rather than leaving a guide that silently kept the old copy.
do $$
begin
  if not exists (
    select 1 from content
    where slug = 'supabase-mcp-guide'
      and blocks @> '[{"kind": "mcp_connect"}]'::jsonb
  ) then
    raise exception 'supabase-mcp-guide has no mcp_connect block: the connect tabs were not swapped';
  end if;
end $$;
