-- VIB-86: content had no popularity signal, so the home feed's "Top" tab
-- had nothing to rank by and shipped dimmed.
--
-- Mirrors tools.view_count + increment_tool_views (migration 07) rather than
-- inventing a second shape for the same idea. `content` is public-read /
-- staff-write under migration 03, so a signed-out reader cannot update the
-- row; this is the one narrow hole that lets a view register.

alter table content add column view_count integer not null default 0;

comment on column content.view_count is
  'Times the detail page has been rendered. Written only by increment_content_views. Includes prefetches and crawlers — a popularity signal, not analytics.';

create or replace function increment_content_views(content_slug text)
returns void
language sql
security definer
-- Pinning search_path is what stops a caller-controlled schema from
-- shadowing `content` inside a definer function.
set search_path = public
as $$
  update content
     set view_count = view_count + 1
   where slug = content_slug
     -- A draft is not publicly readable, so it must not accrue views either;
     -- otherwise an unpublished slug becomes a way to poke the table.
     and status = 'published';
$$;

comment on function increment_content_views(text) is
  'Adds 1 to content.view_count for one published slug. The only write path to content available to non-staff; cannot touch any other column, row or table.';

revoke all on function increment_content_views(text) from public;
grant execute on function increment_content_views(text) to anon, authenticated;
