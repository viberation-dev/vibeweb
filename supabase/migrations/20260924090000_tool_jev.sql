-- Jev, TypeSafe AI's "System One" model (VIB-203).
--
-- A models row rather than a category of its own: Jev is a model you call, it
-- just does not answer in prose. You hand it state and a question whose
-- answers you have already defined, and it returns one of them typed —
-- Choice, Score or Boolean — with a probability your own code branches on.
--
-- Written for the reader who will otherwise assume "a new AI model" means
-- another Claude: the description leads with what it does not do, because the
-- mistake to prevent is someone reaching for it to write code.
--
-- What is deliberately not here: TypeSafe's own benchmark numbers. Both
-- sources for this row (typesafe.ai and vercel.com/i/what-is-jev) are the
-- vendor's, there is no independent coverage, and one of the figures — a
-- price per billion input tokens — is wrong by orders of magnitude on its
-- face. A directory that repeats those becomes the citation for them. The
-- facts below are limited to what the product is and how you reach it.
insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url, best_for, badge)
values
  ('Jev', 'jev', 'models',
   'Returns a typed decision and a confidence, not a paragraph.',
   'Jev is TypeSafe AI''s first "System One" model. You give it some state and a question whose possible answers you have already defined, and it returns one of them as a type your code can use — a choice, a score or a true/false — along with how confident it is. It does not write prose or code, and it cannot read images or audio, so it sits alongside a model like Claude rather than replacing one. TypeSafe are clear about the catch, and it is worth repeating: a typed answer is guaranteed to be the right shape, not the right decision, so check it against real outcomes before you let it route anything that matters.',
   'Paid', 'https://typesafe.ai', 'expert', 'new')
on conflict (slug) do nothing;

update tools set key_facts = '[
  {"label": "Made by", "value": "TypeSafe AI"},
  {"label": "Answers with", "value": "A choice, a score or a true/false, plus a probability"},
  {"label": "Takes", "value": "Text, JSON and arrays"},
  {"label": "Reach it through", "value": "Vercel AI Gateway, using the AI SDK''s experimental eval API"},
  {"label": "Availability", "value": "Early access"},
  {"label": "Not for", "value": "Writing prose or code, or reading images and audio"}
]'::jsonb, updated_at = now()
where slug = 'jev';

-- Vercel is how you actually call it, so the link carries the note. Nothing
-- in the directory is an AI Gateway row yet; when one exists, this moves to it.
insert into tool_links (tool_id, linked_tool_id, kind, note, sort_order)
select j.id, v.id, 'pairs_with', 'via AI Gateway', 0
from tools j, tools v
where j.slug = 'jev' and v.slug = 'vercel'
on conflict (tool_id, linked_tool_id) do nothing;

-- Unpublished: the two verdicts are an editorial call and Ali has not read
-- them yet. This page, not the directory row, is the part that earns search
-- traffic — "do I need a typed decision or just a model" has no good answer
-- online, and the row on its own only links away from us.
--
-- No models_a/models_b: Jev is not on OpenRouter, and three Claude models
-- against an empty column is a worse table than no table.
insert into tool_comparisons (slug, tool_a_id, tool_b_id, intro, pick_a, pick_b, published)
select 'jev-vs-claude', a.id, b.id,
  'Jev and Claude are both models, but they answer different kinds of question. Ask Claude something and you get language back — an explanation, a plan, some code — which your app then has to interpret. Ask Jev and you get one of the answers you defined, typed, with a probability attached. Most projects want Claude. You want Jev when your code has to branch on the answer and "usually the right shape" is not good enough.',
  'Your app makes the same small decision over and over — route this, flag that, score this — and you need the answer as a value with a confidence, not a sentence to parse.',
  'You want the model to explain, plan, write or code. That is nearly every vibe-coding job, and Jev does none of it.',
  false
from tools a, tools b
where a.slug = 'jev' and b.slug = 'claude'
on conflict (slug) do nothing;
