-- Credit a contributor on a piece of content (VIB-235).
--
-- Sarah R. and Emir Ayan shape ideas, draft material and edit. They are
-- credited as contributors beside the author, not bylined as sole authors.
--
-- A text key into the `PEOPLE` map in lib/byline.ts, not a reference to
-- `profiles`: being credited is not the same as having an account, and
-- neither of them signs in. The app validates the key against that map
-- (zod, server-side); a key that no longer resolves renders as no
-- contributor rather than breaking the page.
--
-- No per-post role column. "with" is honest whether a given piece was their
-- idea, their draft or their edit, and a three-value taxonomy on every row
-- is one nobody keeps current.
--
-- APPLIED 2026-10-04 ahead of the deploy. Additive and nullable, so it
-- cannot break the running build, and the filename carries the version the
-- remote recorded (the apply time) so `supabase db push` sees it as done
-- rather than running it again into "column already exists".
--
-- Additive and nullable. Every existing row keeps rendering exactly as it
-- does now, and nothing reads this column until the deploy that ships with
-- it, so applying it ahead of that deploy cannot break the running build.
--
-- Grants: none needed. This is a column on an existing table, so it
-- inherits what migration 03 already granted on `content` — the migration-20
-- rule is about newly created tables.

alter table content add column contributor_key text;

comment on column content.contributor_key is
  'Contributor credited beside the author (VIB-235). A key into PEOPLE in lib/byline.ts, validated in the app; null means author only.';
