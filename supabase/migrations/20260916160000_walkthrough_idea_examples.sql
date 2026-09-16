-- Example project ideas in walkthrough step 1 (VIB-160).
--
-- Beginners stall on "pick an idea" because they cannot think of one. A tip
-- with ready-made ideas goes straight after the opening text. The guard on
-- block 1 still being the warning callout makes a re-run a no-op instead of
-- a second copy.
update wizards
set steps = jsonb_insert(steps, '{0,blocks,1}', '{"kind": "callout", "tone": "tip", "body": "Stuck for an idea? Borrow one of these and make it yours:\n- A tip calculator that splits the bill between friends\n- A random dinner picker for when nobody can decide\n- A packing list for your next trip\n- A page with three things you have made or are proud of\n- A quiz about your favourite film, band or football team\n- A simple timer for workouts, studying or boiling eggs\n- A page that shows a new random compliment each time you open it\n\nStill nothing? Choose the \"I have no idea yet\" prompt below, and your AI tool will suggest ideas based on what you like."}'::jsonb)
where slug = 'ship-your-first-web-project'
  and steps->0->>'key' = 'idea'
  and steps->0->'blocks'->1->>'tone' = 'warning';
