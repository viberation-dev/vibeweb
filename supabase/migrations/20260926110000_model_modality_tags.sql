-- Modality and coding tags for the model families (VIB-211).
--
-- VIB-206 added fourteen model families and VIB-207 two more, and neither
-- migration inserted a single tool_tags row. Claude, Gemini and GPT carry
-- five tags each, so the sixteen newer rows sat next to them showing nothing
-- but a pricing tier. The cards were not wrong, they were empty.
--
-- What a reader actually wants off a model card is two things: is this one
-- good at code, and what can I feed it. So three input tags join the two
-- output ones that already exist:
--
--   vision       Reads images     image-generation   makes them
--   audio        Reads audio      video-generation   makes them
--   video-input  Reads video
--
-- Naming: the existing pair are named for what the model produces, so the new
-- three are named for what it takes. "Reads images" rather than "Multimodal",
-- which tells a beginner nothing about whether their screenshots will work.
--
-- code-generation is the "specialised in programming" tag and is applied
-- narrowly — only where the family's own description in VIB-206/207 claims a
-- coding focus or a coder variant. Nearly every model writes some code; the
-- tag is worthless the moment it goes on all of them.
--
-- Every fact below is read off the description already in the tools row, not
-- from memory and not from a benchmark. If a family's row does not claim a
-- modality, it does not get the tag — Nemotron ends up with none, which is
-- honest: what distinguishes it is throughput, and there is no tag for that.
--
-- open-weights is only added where the pricing tier does not already say
-- "Open source" — on Mistral (Freemium) and Muse (Paid) it is news, on Qwen
-- it is the same sentence twice on one card.
insert into tags (slug, name, kind) values
  ('vision', 'Reads images', 'facet'),
  ('audio', 'Reads audio', 'facet'),
  ('video-input', 'Reads video', 'facet')
on conflict (slug) do nothing;

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  -- The sixteen untagged families.
  ('qwen',              array['code-generation', 'vision', 'video-input']),
  ('deepseek-models',   array['code-generation']),
  ('kimi-models',       array['code-generation', 'vision']),
  ('grok-models',       array['code-generation', 'vision']),
  ('glm',               array['code-generation', 'vision', 'video-input']),
  ('ling',              array['vision']),
  ('mimo',              array['vision', 'video-input', 'audio']),
  ('minimax',           array['code-generation', 'vision', 'video-input']),
  ('gemma',             array['vision']),
  ('llama',             array['vision']),
  ('hy',                array['code-generation']),
  ('voxtral',           array['audio']),
  ('space-bunny-alpha', array['vision', 'free-tier']),
  ('mistral',           array['code-generation', 'open-weights']),
  ('muse',              array['vision', 'video-input', 'audio', 'multi-agent', 'open-weights']),
  -- Nemotron claims no modality and no coding focus of its own, so it gets
  -- nothing rather than a tag that is nearly true.
  --
  -- Jev gets nothing deliberately: its row says in as many words that it
  -- writes no code and reads no images or audio.
  --
  -- The three original families were tagged before these tags existed, so
  -- they are brought level here. Without this, Gemini would be the only
  -- model in the directory that does not "read images", which is the kind of
  -- gap a reader reasonably reads as a fact.
  ('claude',            array['vision']),
  ('gpt',               array['vision', 'audio']),
  ('gemini',            array['vision', 'audio', 'video-input'])
) as m(slug, tag_slugs)
join tools t on t.slug = m.slug
join tags g on g.slug = any(m.tag_slugs)
on conflict (tool_id, tag_id) do nothing;
