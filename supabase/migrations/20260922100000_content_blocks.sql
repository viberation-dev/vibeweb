-- Structured guide bodies (VIB-192).
--
-- A guide is mostly commands, config and a fork in the road (install
-- globally or per project?). Those want a copy button, a visible expected
-- result and tabs, none of which survive being flattened into `body`, which
-- renders as preformatted text with no Markdown parser by design.
--
-- Nullable and additive: null means render `body` exactly as before, which
-- is every row that exists today. The shape is validated in
-- lib/validation/guide.ts, not here -- jsonb checks nothing beyond "is this
-- JSON", the same arrangement as wizards.steps.
--
-- No new grant. Migration 20 made Data API exposure opt-in for new *tables*;
-- `content` already has its grants and they cover new columns.
alter table public.content add column blocks jsonb;

comment on column public.content.blocks is
  'Authored blocks (lib/validation/guide.ts). Null means render `body` instead.';
