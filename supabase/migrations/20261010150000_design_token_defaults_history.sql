/*
 * Design settings: custom defaults and a change history (VIB-247).
 *
 * design_token_defaults has the same shape as design_tokens. It is what
 * "Reset" in /admin/settings returns a colour to, when staff have chosen a
 * default of their own. Empty means the defaults are what globals.css ships.
 */
alter table site_settings
  add column design_token_defaults jsonb not null default '{}'::jsonb;

comment on column site_settings.design_token_defaults is
  'Staff-chosen defaults for the design tokens, by mode (VIB-247). Empty = stock.';

/*
 * One row per save that changed something: the full state after it, so any
 * row can be restored on its own, plus a sentence saying what moved.
 *
 * actor_name is copied at write time rather than joined: the list is read by
 * staff who may not be able to read each other's profiles, and a history
 * should still say who after an account is gone.
 */
create table design_token_history (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  actor_name text not null,
  summary text not null,
  tokens jsonb not null,
  defaults jsonb not null
);

comment on table design_token_history is
  'Every change to the design tokens, newest read first (VIB-247). Append-only.';

create index design_token_history_created_at_idx
  on design_token_history (created_at desc);

alter table design_token_history enable row level security;

-- Staff only, both ways. No update or delete policy: history is append-only.
create policy design_token_history_read on design_token_history
  for select using (is_staff());

create policy design_token_history_insert on design_token_history
  for insert with check (is_staff());

/*
 * Grants (see migration 20, VIB-60): nothing to anon, and only the two
 * operations the policies above allow to authenticated.
 */
grant select, insert on design_token_history to authenticated;
