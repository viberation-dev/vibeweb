-- Per-tool key facts (VIB-141).
--
-- The detail page's Key info had four fixed rows (pricing, platform,
-- category, best for), which say nothing about what a reader picks a host by:
-- the free plan, a trial, frameworks, databases, email. A column per fact
-- would be a schema change per category, so the extra rows are an ordered
-- list of {label, value} pairs, written editorially like the seed rows.
alter table tools add column key_facts jsonb not null default '[]';

alter table tools add constraint tools_key_facts_is_array
  check (jsonb_typeof(key_facts) = 'array');

comment on column tools.key_facts is
  'Extra Key info rows on the tool page, in display order: [{"label": "...", "value": "..."}] (VIB-141).';
