-- Publish the Playwright MCP guide now the renderer is on production
-- (VIB-195, following VIB-192).
--
-- The row went in as a draft because one Supabase project serves production
-- and every preview: a published row would have appeared on the live site
-- before the renderer merged, rendering as a blank page for real visitors.
-- VIB-192 merged as 545973a, so the renderer is live and this is safe.
update content set status = 'published', updated_at = now()
where slug = 'playwright-mcp-guide';
