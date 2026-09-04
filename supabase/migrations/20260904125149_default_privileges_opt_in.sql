-- Close the Data API to tables created from here on (VIB-60, first half).
--
-- Today every table in `public` is reachable through the Data API because of
-- Supabase's automatic default privileges: anon and authenticated hold all
-- seven privileges on all 16 tables, none of it written by us. RLS is what
-- actually protects them, and it is correctly applied everywhere.
--
-- The risk the issue names is not those 16 tables, it is the 17th: under
-- automatic grants a new table is exposed the moment it is created, and is
-- protected only if whoever wrote the migration remembered to enable RLS.
-- One forgotten line away from a public table.
--
-- This statement changes nothing about existing access. It only stops future
-- tables from inheriting it, so exposure becomes a decision rather than a
-- default. Revoking the blanket grants already held on the current 16 is the
-- other half of VIB-60 and is deliberately not here: that one can take the
-- site down if a single grant is missed, so it wants its own change with its
-- own verification pass.
--
-- Consequence for anyone adding a table after this: it will be invisible to
-- the app until the migration also grants what its policies assume. That is
-- the point. See CLAUDE.md.

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;

-- Default privileges are recorded per creating role, so the same revoke has
-- to be spelled for `postgres` — the role migrations actually run as — or a
-- table created by it still arrives fully granted.
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated;
