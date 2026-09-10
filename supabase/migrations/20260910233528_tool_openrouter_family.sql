-- Model families (VIB-107). A directory entry like "Claude" is a family, not a
-- model: OpenRouter lists 15 Claude models, 21 Gemini and 52 GPT. The family
-- page lists them live, so a new release appears without anyone adding a row.
alter table tools add column openrouter_family text;

-- Rows that already point at a model get that model's family, derived rather
-- than hardcoded: anthropic/claude-fable-5.1 → anthropic/claude. It has to
-- happen before the in-family CHECK below, which those rows would fail.
update tools
set openrouter_family =
  split_part(openrouter_id, '/', 1) || '/' || split_part(split_part(openrouter_id, '/', 2), '-', 1)
where openrouter_id is not null;

-- vendor/name, matched as a prefix of OpenRouter model ids
-- (OPENROUTER_FAMILY and familyMembers in lib/model-facts.ts).
alter table tools add constraint tools_openrouter_family_shape check (
  openrouter_family ~ '^[a-z0-9][a-z0-9._-]*/[a-z0-9][a-z0-9._-]*$'
);

-- openrouter_id is now the family's featured model: optional, and only
-- meaningful inside a family — so it must belong to the one set here.
alter table tools add constraint tools_openrouter_id_in_family check (
  openrouter_id is null
  or (openrouter_family is not null and starts_with(openrouter_id, openrouter_family))
);

comment on column tools.openrouter_family is
  'OpenRouter id prefix naming this model family, e.g. anthropic/claude. Its models are listed live on the tool page (VIB-107).';
comment on column tools.openrouter_id is
  'Featured model within openrouter_family, shown first on the family page. Null means the newest (VIB-107).';
