-- Hosting category (VIB-140).
--
-- Deployment platforms (Vercel, Netlify, Render and the like) had no home:
-- Vercel sat in the catch-all `tools`, and everything else was missing.
-- Placed after `app_builders` to match the display order in
-- lib/tool-categories.ts: build it, then put it online.
alter type tool_category add value if not exists 'hosting' after 'app_builders';
