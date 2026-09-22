-- Publish the Supabase MCP guide (VIB-197, following VIB-196).
--
-- The row went in as a draft to buy a review window: one Supabase project
-- serves production and every preview, so a published row is live the moment
-- the migration is applied, with no chance to read it first.
--
-- No deploy dependency this time, unlike VIB-195. VIB-196's merge commit
-- (92076fb) contains only a SQL file, and the renderer shipped with VIB-192
-- and is already on production.
update content set status = 'published', updated_at = now()
where slug = 'supabase-mcp-guide';
