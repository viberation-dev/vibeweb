-- Mistral and Muse (VIB-207), the two families VIB-206 missed.
--
-- VIB-206 added Voxtral, which is Mistral's speech model and nothing else,
-- and Llama, which is Meta's older line. Neither row is the one a reader
-- looking for "the Mistral models" or "what Meta ships now" would want.
--
-- Prefixes read off the live OpenRouter catalogue on 2026-09-26:
--
--   mistralai/mistral  12    meta/muse  6
--
-- mistralai/mistral deliberately does not cover Devstral, Codestral,
-- Ministral, Mixtral or Voxtral. starts_with cannot reach them from any
-- sensible prefix, and they are separately named products rather than
-- versions of the same model — Voxtral already has its own row. The
-- description names them so the page does not look like it is hiding them.
--
-- pricing_tier: Mistral is Freemium, not Open source, and that is the whole
-- point of the row. Small and Nemo publish weights; Medium and Large do not.
-- Calling the family open would be wrong for its best models, and calling it
-- Paid would be wrong for the ones people self-host, so it matches Claude,
-- Gemini and GPT instead and the key fact below says which is which.
--
-- Muse is Paid: only Glimmer 30B carries a hugging_face_id, the Spark models
-- are API-only.
--
-- openrouter_id is null on both: null means "newest in the family", which
-- stays right on its own, and here the newest is the one to show in each
-- case.
--
-- badge 'new' is set here rather than left to fill in later. Badge mode is
-- 'staff', so the column is the only source — a new row without it simply
-- never shows the badge, which is what VIB-206 got wrong (see the migration
-- beside this one).
insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url, best_for, openrouter_family, openrouter_id, badge)
values
  ('Mistral', 'mistral', 'models',
   'France''s frontier lab, with the small models everyone self-hosts.',
   'Mistral is the main model family from the French lab of the same name, and it splits in a way worth knowing about: the Small models publish their weights so you can download and run them, while Medium and Large are sold through the API only. Small 4 folds several older models into one and is cheap enough to use by default; Medium 3.5 is the one to reach for on agentic and coding work. Mistral''s other lines are separate products with their own names — Devstral and Codestral for code, Ministral for tiny on-device models, and Voxtral for speech, which has its own entry here.',
   'Freemium', 'https://mistral.ai/models', 'intermediate', 'mistralai/mistral', null, 'new'),

  ('Muse', 'muse', 'models',
   'Meta''s current line, built for long multi-agent runs.',
   'Muse is what Meta Superintelligence Labs ships now, and the family to look at rather than Llama if you want Meta''s recent work. The Spark models are multimodal reasoning models for long-running agentic and multi-agent workflows — they read text, images, video, audio and files with a million-token context, and are built to hold onto what they learned early in a long task. Each Spark release also has a cheaper "Contributor" tier meant for experimenting rather than production. Glimmer 30B is the odd one out and the interesting one: open weights, distilled from Spark, small enough to run autonomous agents on ordinary hardware.',
   'Paid', 'https://ai.meta.com', 'expert', 'meta/muse', null, 'new')
on conflict (slug) do nothing;

update tools set key_facts = f.facts, updated_at = now()
from (values
  ('mistral', '[{"label": "Made by", "value": "Mistral AI, in France"}, {"label": "Weights", "value": "Open for Small and Nemo, closed for Medium and Large"}, {"label": "Good for", "value": "A cheap default model, and EU-hosted inference"}]'::jsonb),
  ('muse', '[{"label": "Made by", "value": "Meta Superintelligence Labs"}, {"label": "Weights", "value": "Closed, except Glimmer 30B"}, {"label": "Good for", "value": "Long multi-agent runs over mixed media"}]'::jsonb)
) as f(slug, facts)
where tools.slug = f.slug;
