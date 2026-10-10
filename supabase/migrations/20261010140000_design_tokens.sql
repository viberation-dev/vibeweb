/*
 * Design tokens editable from /admin/settings (VIB-246).
 *
 * One jsonb column rather than a column per colour: the list of editable
 * tokens lives in lib/design-tokens.ts and is expected to grow, and a new
 * token should not need a migration. Shape:
 *
 *   { "light": { "--background": "#fffff2" }, "dark": { ... } }
 *
 * Empty means "whatever globals.css ships", which is why it is the default.
 * The app narrows the value on read, so nothing here is trusted as CSS.
 *
 * No new policy or grant: site_settings_read / site_settings_write and the
 * table-level grants from the tool_badges migration already cover the column.
 */
alter table site_settings
  add column design_tokens jsonb not null default '{}'::jsonb;

comment on column site_settings.design_tokens is
  'Runtime overrides of globals.css custom properties, by mode (VIB-246). Empty = stock.';
