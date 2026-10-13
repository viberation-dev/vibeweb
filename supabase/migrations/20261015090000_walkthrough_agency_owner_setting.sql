-- "Whose site is it?" becomes a setting on "Build an agency website".
--
-- The question sat inside three steps as a pair of tabs (Brief, Copy,
-- Launch), so a reader answered it three times, or missed that the second
-- tab existed. It now lives in the "How are you doing this?" panel with the
-- other two settings and is answered once. Ali asked for this on 2026-10-14;
-- rule 6.2 in docs/walkthrough-rules.md.
--
-- Each tab's blocks are lifted out to the top level of the step, in place,
-- and tagged with the owner they were for. Nothing is rewritten, apart from
-- three openings that leaned on the tab's title to make sense:
--
--   Copy     "Send them copy.md" named nobody once the "A client's agency"
--            tab was gone.
--   Launch   both lists began at "1." with no word on what they were lists of.
--
-- Needs the build that understands `when.owner` to be live first: an older
-- build ignores the tag and would show both versions one after the other.
--
-- Safe to run twice: with the tabs gone, a second run finds nothing to lift.

do $$
declare
  w_steps jsonb;
  step jsonb;
  new_blocks jsonb;
  new_steps jsonb := '[]'::jsonb;
begin
  select steps into w_steps from wizards where slug = 'build-an-agency-website';
  if w_steps is null then
    return;
  end if;

  for step in
    select s.val from jsonb_array_elements(w_steps) with ordinality as s(val, ord) order by s.ord
  loop
    step := replace(replace(replace(step::text,
      'Send them copy.md and get it approved before you design anything.',
      'Send the client copy.md and get it approved before you design anything.'),
      '"1. Point your domain at the site',
      '"Going live:\n\n1. Point your domain at the site'),
      '"1. The domain, the hosting, the email service and the analytics should be',
      '"Going live, and handing over:\n\n1. The domain, the hosting, the email service and the analytics should be'
    )::jsonb;

    select jsonb_agg(q.val order by q.at, q.tab_at, q.inner_at)
    into new_blocks
    from (
      select b.val, b.ord as at, 0::bigint as tab_at, 0::bigint as inner_at
      from jsonb_array_elements(step->'blocks') with ordinality as b(val, ord)
      where not (b.val->>'kind' = 'tabs' and b.val->>'label' = 'Whose site is it?')
      union all
      -- Keeps whatever the tabs block was already tagged with, and adds the owner.
      select
        jsonb_set(inner_block.val, '{when}',
          coalesce(b.val->'when', '{}'::jsonb) || jsonb_build_object('owner', jsonb_build_array(tab.val->>'key'))),
        b.ord, tab.ord, inner_block.ord
      from jsonb_array_elements(step->'blocks') with ordinality as b(val, ord),
        jsonb_array_elements(b.val->'tabs') with ordinality as tab(val, ord),
        jsonb_array_elements(tab.val->'blocks') with ordinality as inner_block(val, ord)
      where b.val->>'kind' = 'tabs' and b.val->>'label' = 'Whose site is it?'
    ) q;

    new_steps := new_steps || jsonb_build_array(jsonb_set(step, '{blocks}', new_blocks));
  end loop;

  update wizards set steps = new_steps, updated_at = now() where slug = 'build-an-agency-website';
end;
$$;

-- The tabs are gone, every lifted block has an owner the panel knows, and
-- both owners have something in each of the three steps.
do $$
declare
  problem text;
begin
  if exists (
    select 1
    from wizards w,
      jsonb_array_elements(w.steps) as step(val),
      jsonb_array_elements(step.val->'blocks') as block(val)
    where w.slug = 'build-an-agency-website'
      and block.val->>'kind' = 'tabs' and block.val->>'label' = 'Whose site is it?'
  ) then
    raise exception 'A "Whose site is it?" tabs block is still there';
  end if;

  select string_agg(step.val->>'key', ', ')
  into problem
  from wizards w, jsonb_array_elements(w.steps) as step(val)
  where w.slug = 'build-an-agency-website'
    and step.val->>'key' in ('brief', 'copy', 'launch')
    and (
      not exists (select 1 from jsonb_array_elements(step.val->'blocks') as b(val) where b.val->'when'->'owner' ? 'mine')
      or not exists (select 1 from jsonb_array_elements(step.val->'blocks') as b(val) where b.val->'when'->'owner' ? 'client')
    );
  if problem is not null then
    raise exception 'Steps missing a block for one owner: %', problem;
  end if;

  select string_agg(distinct owner, ', ')
  into problem
  from wizards w,
    jsonb_array_elements(w.steps) as step(val),
    jsonb_array_elements(step.val->'blocks') as block(val),
    jsonb_array_elements_text(coalesce(block.val->'when'->'owner', '[]'::jsonb)) as owner
  where w.slug = 'build-an-agency-website' and owner not in ('mine', 'client');
  if problem is not null then
    raise exception 'Unknown owner on a block: %', problem;
  end if;
end;
$$;
