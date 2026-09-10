-- Live model specs (VIB-107). One pointer, not a copy: price, context,
-- providers and uptime change daily on OpenRouter, and a snapshot stored here
-- would be stale by the next deploy. lib/integrations/openrouter.ts reads the
-- rest at request time, cached for an hour.
alter table tools add column openrouter_id text;

-- The same shape lib/model-facts.ts checks (OPENROUTER_ID). It also means the
-- value can only ever address a path under openrouter.ai/api/v1/models/ — the
-- adapter puts it in a URL. `~` prefixes OpenRouter's always-latest aliases.
alter table tools add constraint tools_openrouter_id_shape check (
  openrouter_id ~ '^~?[a-z0-9][a-z0-9._-]*/[a-z0-9][a-z0-9._:-]*$'
);

comment on column tools.openrouter_id is
  'OpenRouter model id (vendor/model) for live specs on model pages. Null for everything that is not a model (VIB-107).';
