-- Section headings for the two published MCP guides (VIB-198).
--
-- The reading work adds a `heading` block kind and builds the "On this page"
-- rail from it. Without this migration the feature ships switched off: every
-- guide in the table is a flat run of text blocks, so every outline is empty
-- and no reader ever sees a rail.
--
-- Headings only — no prose is rewritten, no block is moved or removed. The
-- sections were already there in the writing; they just had nothing to name
-- them.
--
-- Apply this with the deploy, not before it. A build from before VIB-198
-- does not know the `heading` kind, so guideBlocksSchema rejects the whole
-- array and the page falls back to `body` — degraded rather than broken,
-- but it is still the published guide, so the window should be the length of
-- a deploy and not longer.
--
-- jsonb_insert inserts *before* the given index, so the inserts run in
-- descending order: an insert at 3 would otherwise shift every index after
-- it and the next heading would land a block late.

update content
set blocks = jsonb_insert(
  jsonb_insert(
    jsonb_insert(
      jsonb_insert(
        jsonb_insert(
          jsonb_insert(
            jsonb_insert(
              jsonb_insert(
                blocks,
                '{15}', '{"kind":"heading","level":2,"title":"Where to go next"}'::jsonb
              ),
              '{14}', '{"kind":"heading","level":2,"title":"When it goes wrong"}'::jsonb
            ),
            '{13}', '{"kind":"heading","level":2,"title":"It is really your browser"}'::jsonb
          ),
          '{10}', '{"kind":"heading","level":2,"title":"Flags worth knowing"}'::jsonb
        ),
        '{8}', '{"kind":"heading","level":2,"title":"Keeping it out of your context window"}'::jsonb
      ),
      '{5}', '{"kind":"heading","level":2,"title":"Check it works"}'::jsonb
    ),
    '{3}', '{"kind":"heading","level":2,"title":"Install it"}'::jsonb
  ),
  '{1}', '{"kind":"heading","level":2,"title":"When it earns its place"}'::jsonb
)
where slug = 'playwright-mcp-guide';

update content
set blocks = jsonb_insert(
  jsonb_insert(
    jsonb_insert(
      jsonb_insert(
        jsonb_insert(
          jsonb_insert(
            jsonb_insert(
              jsonb_insert(
                jsonb_insert(
                  blocks,
                  '{14}', '{"kind":"heading","level":2,"title":"Where to go next"}'::jsonb
                ),
                '{13}', '{"kind":"heading","level":2,"title":"When it goes wrong"}'::jsonb
              ),
              '{11}', '{"kind":"heading","level":2,"title":"Keeping it cheap"}'::jsonb
            ),
            '{10}', '{"kind":"heading","level":2,"title":"When you do need writes"}'::jsonb
          ),
          '{9}', '{"kind":"heading","level":2,"title":"The risk worth understanding"}'::jsonb
        ),
        '{6}', '{"kind":"heading","level":2,"title":"Check it works"}'::jsonb
      ),
      '{4}', '{"kind":"heading","level":2,"title":"Connect it"}'::jsonb
    ),
    '{2}', '{"kind":"heading","level":2,"title":"The two settings that matter"}'::jsonb
  ),
  '{1}', '{"kind":"heading","level":2,"title":"Read this before you install it"}'::jsonb
)
where slug = 'supabase-mcp-guide';
