-- The "Whose site this is" blank fills itself in from the setting.
--
-- "Whose site is it?" moved into the setup panel on 2026-10-15, but the brief
-- prompt still asked the same thing as a blank, so the reader answered it
-- twice. Ali, 2026-10-15: have the page fill it in. Rule 1.8 in
-- docs/walkthrough-rules.md.
--
-- The hint for that blank gains the answer for each value of the setting.
-- The page puts it into the prompt the reader sees and copies; the options
-- stay, for anywhere the prompt is shown without a setup.
--
-- An older build ignores the new key and shows the blank as before, so this
-- is safe to apply before or after the code is live.
--
-- Safe to run twice: it sets the same value.

do $$
declare
  w_steps jsonb;
  touched int;
begin
  select steps into w_steps from wizards where slug = 'build-an-agency-website';
  if w_steps is null then
    return;
  end if;

  update wizards w
  set steps = (
        select jsonb_agg(
          jsonb_set(step.val, '{blocks}', (
            select jsonb_agg(
              case when block.val->>'kind' = 'prompt' and block.val ? 'placeholders' then
                jsonb_set(block.val, '{placeholders}', (
                  select jsonb_agg(
                    case when hint.val->>'token' = '[my own agency, or a client''s]' then
                      jsonb_set(hint.val, '{setting}',
                        '{"owner": {"mine": "My own agency", "client": "A client''s agency"}}'::jsonb)
                    else hint.val end
                    order by hint.ord)
                  from jsonb_array_elements(block.val->'placeholders') with ordinality as hint(val, ord)
                ))
              else block.val end
              order by block.ord)
            from jsonb_array_elements(step.val->'blocks') with ordinality as block(val, ord)
          ))
          order by step.ord)
        from jsonb_array_elements(w.steps) with ordinality as step(val, ord)
      ),
      updated_at = now()
  where w.slug = 'build-an-agency-website';

  -- The Standard brief and the Complete brief both carry the blank.
  select count(*) into touched
  from wizards w,
    jsonb_array_elements(w.steps) as step(val),
    jsonb_array_elements(step.val->'blocks') as block(val),
    jsonb_array_elements(coalesce(block.val->'placeholders', '[]'::jsonb)) as hint(val)
  where w.slug = 'build-an-agency-website'
    and hint.val->'setting'->'owner' ? 'mine'
    and hint.val->'setting'->'owner' ? 'client';
  if touched <> 2 then
    raise exception 'Expected the owner answer on 2 hints, found %', touched;
  end if;
end;
$$;
