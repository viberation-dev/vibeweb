-- Platform and "Best for" on tools (VIB-87) — the two rows mockup screen 4's
-- key-info table asks for that had no column behind them.
--
-- Real columns, not a metafields layer. That decision and its reasoning live
-- in VIB-87: Shopify needs EAV because it is multi-tenant on a schema its
-- merchants cannot migrate; this is single-tenant with one operator holding
-- full migration access, and an EAV layer would cost the generated types, the
-- RLS surface and the typed query layer the repo is built on.

-- Many values per tool, from a controlled vocabulary, and meant to be
-- filterable later ("CLIs that run on Windows") — so text[] with a CHECK,
-- per the routing rule in the issue. A join table buys nothing until a
-- platform needs its own page.
alter table tools add column platform text[] not null default '{}';

-- The CHECK is what keeps this a vocabulary rather than free text: without it
-- "OSX", "Mac" and "macOS" all arrive and the filter silently splits.
alter table tools add constraint tools_platform_values check (
  platform <@ array['macos','windows','linux','web','ios','android']::text[]
);

-- GIN, because the filter this is for is `platform && array['windows']`,
-- which a btree cannot answer.
create index tools_platform_idx on tools using gin (platform);

-- One value per row from a fixed set → enum column. Reuses role_level rather
-- than minting a parallel enum: "who is this for" is the same question the
-- reader already answered about themselves, and a second three-value enum
-- would drift from the first.
alter table tools add column best_for role_level;

comment on column tools.platform is
  'Where the tool runs. Controlled vocabulary, empty array means unstated (VIB-87).';
comment on column tools.best_for is
  'Audience tier this tool suits. Supersedes the beginner-friendly tag for audience (VIB-87).';
