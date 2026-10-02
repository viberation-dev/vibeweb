-- Publish the scope guide once the renderer is on production (VIB-221).
--
-- The row went in as a draft because one Supabase project serves production
-- and every preview, and the guide uses `cli_config`, a block kind only the
-- renderer in this PR understands. An unknown kind makes toGuideBlocks return
-- null and the page falls back to plain `body`, so a published row would have
-- shown visitors one paragraph where the guide should be.
--
-- Apply this after the PR merges and Vercel has deployed, not with the insert.
update content set status = 'published', updated_at = now()
where slug = 'global-or-project-config';
