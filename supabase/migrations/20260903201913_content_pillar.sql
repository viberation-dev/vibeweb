-- Editorial pillars for Learn content (VIB-90).
--
-- The Learn hub mockup (screen 10) filters by six pillars and lists them in
-- the sidebar as "PILLARS · 6". They had no representation in the schema, so
-- VIB-85 shipped without those chips rather than filtering on nothing.
--
-- A single enum column, not a join table: the mockup's card eyebrow is one
-- label per piece, and "what section of the publication is this" is a
-- one-answer question. Topics that legitimately overlap are already tags.
create type content_pillar as enum (
  'fundamentals',
  'context_engineering',
  'prompt_engineering',
  'tool_reviews',
  'walkthroughs',
  'founder_playbook'
);

-- Nullable, with no default and no backfill on purpose. Which pillar a piece
-- belongs to is an editorial judgement (VIB-90 §3), and a default would quietly
-- file all 13 published rows under whichever value was chosen here. Null reads
-- as "not filed yet", which is the truth until someone decides.
alter table content add column pillar content_pillar;

comment on column content.pillar is
  'Editorial pillar for the Learn hub (VIB-90). Null means unfiled; help_article rows are expected to stay null.';
