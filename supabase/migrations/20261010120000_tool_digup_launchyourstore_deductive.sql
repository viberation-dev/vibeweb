-- DigUp AI, Launch Your Store and Deductive (VIB-244).
--
-- The three rows the VIB-242 batch left out. Ali asked for them anyway, so
-- they are here, and each description says the thing that made it a doubt
-- rather than hiding it:
--
--   DigUp AI           publishes no pricing and names no maker. The row says
--                      what the dashboard offers and nothing about cost
--                      beyond "free to sign up".
--   Launch Your Store  a free pre-built Shopify store, not an AI builder. The
--                      row says so, and that Shopify is the bill you pay.
--   Deductive          bought by Elastic (announced 2026-07-22, closed
--                      2026-08-24) and being folded into Elastic
--                      Observability. Filed under agents because that is what
--                      it is; the description leads with the acquisition.
--
-- Read off each site on 2026-10-10, plus Elastic's own announcement.
insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url, platform, best_for, badge)
values
  ('DigUp AI', 'digup-ai', 'tools',
   'Images, video, voiceover, decks and websites from one prompt box.',
   'DigUp AI puts several kinds of AI generation behind one workspace: an image studio, a video studio, a voiceover studio, a slide-deck maker and a website builder, with one library for what you make. The pitch is one login in place of a subscription for each. You can try a few prompts without an account and sign up free to keep your work. It is a young product that does not publish its pricing or say who is behind it, so try it on something small before you depend on it.',
   'Freemium', 'https://digupai.io', array['web'], 'beginner', null),

  ('Launch Your Store', 'launch-your-store', 'app_builders',
   'A ready-made Shopify store, set up for you for free.',
   'Launch Your Store sets up a finished Shopify store for you. You create a Shopify account through its link, connect its app, and it installs a pre-built, customisable store design in a few minutes. It can also copy an existing store''s layout and make product mockups. The service itself is free, and there is no AI building anything to your description: what you get is a good-looking starting theme. Shopify''s own subscription still applies once your store is live.',
   'Free', 'https://launchyour.store', array['web'], 'beginner', null),

  ('Deductive', 'deductive', 'agents',
   'An AI site-reliability engineer that finds why production broke.',
   'Deductive is an AI agent for production incidents, now part of Elastic, which bought the company in August 2026 and is building it into Elastic Observability. It connects to your code, logs, metrics and team discussions, builds a map of how the system fits together, and when something breaks it tests hypotheses against the evidence until it has a root cause and a suggested fix. It is sold to engineering teams by demo, with no self-serve plan, so it is one to know about rather than one to sign up for on a weekend project.',
   'Paid', 'https://www.deductive.ai', array['web'], 'expert', null)
on conflict (slug) do nothing;

update tools set key_facts = f.facts, updated_at = now()
from (values
  ('digup-ai', '[
    {"label": "Costs", "value": "Free to sign up; paid plans are not published"},
    {"label": "Makes", "value": "Images, video, voiceovers, slide decks and websites"},
    {"label": "Try it", "value": "A few prompts without an account"},
    {"label": "Worth knowing", "value": "No named maker or pricing page yet"}
  ]'::jsonb),
  ('launch-your-store', '[
    {"label": "Cost", "value": "Free; Shopify''s subscription is separate"},
    {"label": "Gives you", "value": "A pre-built, customisable Shopify store"},
    {"label": "Needs", "value": "A Shopify account, created through its link"},
    {"label": "Also does", "value": "Copies a store''s layout and makes product mockups"},
    {"label": "AI", "value": "None; it installs a ready-made design"}
  ]'::jsonb),
  ('deductive', '[
    {"label": "Made by", "value": "Deductive AI, part of Elastic since August 2026"},
    {"label": "Costs", "value": "By demo and contract; no self-serve plan"},
    {"label": "Does", "value": "Investigates production incidents to a root cause"},
    {"label": "Connects to", "value": "GitHub, Datadog, Elastic, Grafana, PagerDuty, Slack and more"},
    {"label": "Runs", "value": "Hosted, or in your own infrastructure"},
    {"label": "Worth knowing", "value": "Being built into Elastic Observability"}
  ]'::jsonb)
) as f(slug, facts)
where tools.slug = f.slug;

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('digup-ai', array['image-generation','video-generation','audio','websites','free-tier']),
  ('launch-your-store', array['websites','no-code','beginner-friendly']),
  ('deductive', array['multi-agent','self-hosted','automation'])
) as m(slug, tag_slugs)
join tools t on t.slug = m.slug
join tags g on g.slug = any(m.tag_slugs)
on conflict (tool_id, tag_id) do nothing;

insert into tool_links (tool_id, linked_tool_id, kind, note, sort_order)
select a.id, b.id, 'pairs_with', n.note, n.sort_order
from (values
  ('digup-ai', 'higgsfield', 'the specialist, for video and images only', 0),
  ('launch-your-store', 'instant', 'for designing pages once the store exists', 0)
) as n(slug, linked_slug, note, sort_order)
join tools a on a.slug = n.slug
join tools b on b.slug = n.linked_slug
on conflict (tool_id, linked_tool_id) do nothing;
