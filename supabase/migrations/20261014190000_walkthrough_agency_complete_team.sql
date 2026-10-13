-- Team extras for the two Complete steps of "Build an agency website".
--
-- Research and Review arrived with Complete, a day after Team, and so had
-- nothing for a team in them. Rules: docs/walkthrough-rules.md 7.3.
--
--   Research  who makes which call, one person to write it up, and the
--             decider reads research.md before the brief is written from it.
--             In Complete this is the first step, so it also says to agree
--             who has the final say now; the Brief step, next, is where that
--             gets written down.
--   Review    an owner for each of the four jobs, fresh eyes for the two
--             checks that need them, and an analytics account the business
--             owns rather than one person.
--
-- Tagged team only, like every other team block. The steps themselves are
-- Complete only, so these show for a team working at Complete.
--
-- Safe to run twice: a step that already has a team block is left alone.

create temporary table _team (
  step_key text not null,
  anchor text not null check (anchor in ('after-first', 'before-checklist', 'after-checklist')),
  block jsonb not null
);

insert into _team (step_key, anchor, block) values
('research', 'after-first', $json${
  "kind": "text",
  "body": "Working as a team\n\nBefore you start, agree who has the final say on this project: one person, not a committee. The next step, Brief, is where you write that down, along with who supplies what.\n\nThen split this step up. One person collects the competitors' home pages. Each past client is called by whoever knows them best, because people are franker with someone they have worked with. Everyone writes down what was said in the client's own words and sends it to one person, who runs Sum it up."
}$json$),
('research', 'before-checklist', $json${
  "kind": "callout",
  "tone": "info",
  "body": "Sign-off. The person with the final say reads research.md before the brief is written from it. If they disagree with a finding, now is the time: once the brief is built on it, the argument costs a week."
}$json$),
('research', 'after-checklist', $json${
  "kind": "checklist",
  "tasks": [
    {"id": "agency-team-research-callers", "label": "Each past client was called by the person who knows them best", "help": "A name beside each call before anyone picks up the phone. Notes come back in the client's own words, not a summary of them."},
    {"id": "agency-team-research-yes", "label": "The person with the final say has read research.md", "help": "Read, not skimmed, and before the brief is started. A yes in writing, or their objections in writing."}
  ]
}$json$),

('review', 'before-checklist', $json${
  "kind": "callout",
  "tone": "info",
  "body": "Give each of the four jobs a name. Legal pages: the person with the final say sends them to whoever is qualified, and owns getting an answer. Measurement: one person sets it up, on an account the business owns. The accessibility pass: someone who did not build the pages. The proofread: someone who has not read the copy before. The last two only work with fresh eyes."
}$json$),
('review', 'after-checklist', $json${
  "kind": "checklist",
  "tasks": [
    {"id": "agency-team-review-owners", "label": "Each of the four jobs has a name beside it", "help": "Legal pages, measurement, the accessibility pass and the proofread. Four jobs, and no job with two names."},
    {"id": "agency-team-review-fresh", "label": "The accessibility pass and the proofread were done by someone new to the pages", "help": "Not the person who built them and not the person who wrote them. You cannot see your own mistakes on a page you have looked at for a month."},
    {"id": "agency-team-review-account", "label": "The analytics account belongs to the business, not to one person", "help": "Set up under a shared company login, with at least two people able to get in. An account tied to one person's email leaves with them."}
  ]
}$json$);

do $$
declare
  w_steps jsonb;
  step jsonb;
  n int;
  first_checklist int;
  last_checklist int;
  new_blocks jsonb;
  new_steps jsonb := '[]'::jsonb;
  team constant jsonb := '{"team": ["team"]}'::jsonb;
begin
  select steps into w_steps from wizards where slug = 'build-an-agency-website';
  if w_steps is null then
    return;
  end if;

  for step in
    select s.val from jsonb_array_elements(w_steps) with ordinality as s(val, ord) order by s.ord
  loop
    if not exists (select 1 from _team t where t.step_key = step->>'key')
       or exists (
         select 1 from jsonb_array_elements(step->'blocks') as b(val) where b.val->'when' ? 'team'
       ) then
      new_steps := new_steps || jsonb_build_array(step);
      continue;
    end if;

    select
      min(b.ord) filter (where b.val->>'kind' = 'checklist'),
      max(b.ord) filter (where b.val->>'kind' = 'checklist'),
      count(*)
    into first_checklist, last_checklist, n
    from jsonb_array_elements(step->'blocks') with ordinality as b(val, ord);

    select jsonb_agg(q.val order by q.at, q.side, q.seq)
    into new_blocks
    from (
      select b.val, b.ord::numeric as at, 0 as side, 0 as seq
      from jsonb_array_elements(step->'blocks') with ordinality as b(val, ord)
      union all
      select
        jsonb_set(t.block, '{when}', team),
        case t.anchor
          when 'after-first' then 1
          when 'before-checklist' then first_checklist
          else last_checklist
        end::numeric,
        case t.anchor when 'before-checklist' then -1 else 1 end,
        (row_number() over ())::int
      from _team t
      where t.step_key = step->>'key'
    ) q;

    if first_checklist is null
       or jsonb_array_length(new_blocks) <> n + (select count(*) from _team t where t.step_key = step->>'key') then
      raise exception 'Step % lost a block, or a team block had nowhere to go', step->>'key';
    end if;

    new_steps := new_steps || jsonb_build_array(jsonb_set(step, '{blocks}', new_blocks));
  end loop;

  update wizards set steps = new_steps, updated_at = now() where slug = 'build-an-agency-website';
end;
$$;

do $$
declare
  problem text;
  placed int;
begin
  select count(*) into placed
  from wizards w,
    jsonb_array_elements(w.steps) as step(val),
    jsonb_array_elements(step.val->'blocks') as block(val)
  where w.slug = 'build-an-agency-website'
    and step.val->>'key' in ('research', 'review')
    and block.val->'when'->'team' ? 'team';
  if placed <> (select count(*) from _team) then
    raise exception 'Placed % team blocks, expected %', placed, (select count(*) from _team);
  end if;

  select string_agg(id, '; ')
  into problem
  from (
    select task.val->>'id' as id
    from wizards w,
      jsonb_array_elements(w.steps) as step(val),
      jsonb_array_elements(step.val->'blocks') as block(val),
      jsonb_array_elements(coalesce(block.val->'tasks', '[]'::jsonb)) as task(val)
    where w.slug = 'build-an-agency-website'
    group by 1 having count(*) > 1
  ) duplicates;
  if problem is not null then
    raise exception 'Task ids used twice: %', problem;
  end if;
end;
$$;

drop table _team;
