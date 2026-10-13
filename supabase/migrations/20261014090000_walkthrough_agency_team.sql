-- Team, for "Build an agency website".
--
-- The second setting from Ali's 2026-10-13 request: the same walkthrough for
-- someone working with other people. Rules: docs/walkthrough-rules.md 7.3.
--
-- Team adds, and never replaces. Every block here is tagged team only, with
-- no depth, so it shows in Basic and in Standard alike and sits only in the
-- six steps both depths have. A reader working alone sees none of it.
--
-- What it adds:
--
--   Roles      step 1: who has the final say, who supplies what, where the
--              files live. One decider, because two is a negotiation.
--   Asking     a prompt that turns the [NEEDED] list into one ready-to-send
--              message per person. This is the point of Team: the gaps that
--              overwhelmed one person are other people's to fill.
--   Comments   a prompt that turns a pile of feedback into one list of
--              changes, with disagreements left for the decider.
--   Sign-off   brief, copy, design system and the preview link each wait for
--              a yes from the decider, and the checklists say so.
--
-- Safe to run twice: a step that already has a team block is left alone.

create temporary table _team (
  step int not null,
  -- Where it goes: after the "How it works" text, after the follow-up
  -- prompts, before the first checklist, or after the last one.
  anchor text not null check (anchor in ('after-how', 'after-followups', 'before-checklist', 'after-checklist')),
  block jsonb not null
);

-- The two team prompts, the same in steps 1 to 4 but for the file's name.
create function pg_temp.team_prompts(f text) returns jsonb language sql immutable as $$
  select replace($json${
    "kind": "prompt",
    "label": "Working with your team",
    "prompt": "I am building our agency's website with my team, and some things are still missing. Here is the list:\n\n[paste the NEEDED items]\n\nWho can supply what: [names, and what each person knows]\nWhen I need it by: [a date]\n\nSort the items by the person who can supply them. For each person, write one short message I can send as it is: what I need from them as a numbered list, why the site needs it, and the date. Ask for the thing itself, not for a meeting. If an item has no obvious person, list it at the end under Nobody yet.\n\nStop there. Do not suggest next steps or offer to do more. I am following a set process and the next step has its own prompt.",
    "prompts": [
      {
        "title": "Ask for what is missing",
        "description": "Use this when the reply left [NEEDED] items that someone else on the team can supply. It returns one message per person, ready to send. Start it in a new chat: it carries the list with it.",
        "prompt": "I am building our agency's website with my team, and some things are still missing. Here is the list:\n\n[paste the NEEDED items]\n\nWho can supply what: [names, and what each person knows]\nWhen I need it by: [a date]\n\nSort the items by the person who can supply them. For each person, write one short message I can send as it is: what I need from them as a numbered list, why the site needs it, and the date. Ask for the thing itself, not for a meeting. If an item has no obvious person, list it at the end under Nobody yet.\n\nStop there. Do not suggest next steps or offer to do more. I am following a set process and the next step has its own prompt."
      },
      {
        "title": "Combine the team's comments",
        "description": "Use this once the team has read {F} and sent comments. It returns one list of changes, not a new file. Give that list to Fix the gaps once, in the chat that wrote {F}.",
        "prompt": "My team has read {F} for our agency's website. Here are their comments, as they sent them:\n\n[paste the comments]\n\nWho has the final say: [name]\n\nTurn the comments into one numbered list of changes, most important first. Merge comments that ask for the same thing. Where two comments disagree, show both and mark the item for the person with the final say to decide. Leave out anything that is a matter of taste and changes no fact, and list those separately at the end under Taste, for the same person to accept or drop.\n\nDo not make the changes. Give me the list only.\n\nStop there. Do not suggest next steps or offer to do more. I am following a set process and the next step has its own prompt."
      }
    ],
    "placeholders": [
      {
        "token": "[paste the NEEDED items]",
        "tip": "The list of [NEEDED] items from the end of the AI's reply. If there is no list, search your file for NEEDED and copy each one.",
        "options": ["1. The exact quote from Fettle Coffee's founder, and permission to publish it.\n2. What the Brand identity package includes.\n3. Our registered company name and number."]
      },
      {
        "token": "[names, and what each person knows]",
        "label": "Who can supply what",
        "tip": "Each person on the team and what they are the one to ask about. A line each is enough.",
        "options": ["Priya looks after clients, so quotes and permissions. Tom knows the prices and what each package includes. I have the brand files.", "It is only me and Sam. Sam knows the numbers; everything else is mine."]
      },
      {
        "token": "[a date]",
        "label": "When I need it by",
        "tip": "A real date, a little before you actually need it.",
        "options": ["Friday 14 March", "Two weeks from today"]
      },
      {
        "token": "[paste the comments]",
        "tip": "Every comment as it was sent, with the name of who sent it. Do not tidy them up or leave out the awkward ones.",
        "options": ["Priya: the home page headline sounds like every other agency. Tom: the prices on Services are last year's. Priya: can we lead with the Fettle project?"]
      },
      {
        "token": "[name]",
        "label": "Who has the final say",
        "tip": "The one person the team agreed on in step 1.",
        "options": ["Priya"]
      }
    ]
  }$json$, '{F}', f)::jsonb
$$;

insert into _team (step, anchor, block) values

-- Step 1: Brief ---------------------------------------------------------------
(1, 'after-how', $json${
  "kind": "text",
  "body": "Working as a team\n\nAgree three things before anyone opens an AI tool, and write them at the top of brief.md:\n\n1. Who has the final say. One person, for the brief, the words and the design. With two, every step turns into a negotiation.\n2. Who supplies what. Put a name beside each of these: prices and what each service includes, project details and client quotes, the logo and brand files, the legal details.\n3. Where the files live. One shared folder called spec that everyone can open. One person edits a file at a time.\n\nOne person runs the prompts for a step. Everyone else reads the result and sends comments, once."
}$json$),
(1, 'after-followups', pg_temp.team_prompts('brief.md')),
(1, 'before-checklist', $json${
  "kind": "callout",
  "tone": "info",
  "body": "Sign-off. Send brief.md to the person with the final say and wait for a yes before you start the blueprint. Everything after this is built on it, and a brief changed in step 4 means doing steps 2 and 3 again."
}$json$),
(1, 'after-checklist', $json${
  "kind": "checklist",
  "tasks": [
    {"id": "agency-team-decider", "label": "Agreed who has the final say", "help": "One name, written at the top of brief.md. Not a committee."},
    {"id": "agency-team-suppliers", "label": "Put a name beside each kind of missing information", "help": "Prices and packages, project details and quotes, brand files, legal details. Each has one person to ask."},
    {"id": "agency-team-brief-yes", "label": "The person with the final say has approved brief.md", "help": "A yes in writing, such as a reply to the message you sent it in. Silence is not a yes."}
  ]
}$json$),

-- Step 2: Blueprint -----------------------------------------------------------
(2, 'after-followups', pg_temp.team_prompts('blueprint.md')),
(2, 'after-checklist', $json${
  "kind": "checklist",
  "tasks": [
    {"id": "agency-team-blueprint-sent", "label": "Sent each person their list of what is missing, with a date", "help": "Use Ask for what is missing. One message per person, sent today, so the answers are back by the time you write the copy."}
  ]
}$json$),

-- Step 3: Copy ----------------------------------------------------------------
(3, 'after-followups', pg_temp.team_prompts('copy.md')),
(3, 'before-checklist', $json${
  "kind": "callout",
  "tone": "info",
  "body": "Sign-off. Send copy.md to the whole team and ask for comments by a date, in one message each. Run Combine the team's comments on what comes back, then make the changes in one go. When the person with the final say approves it, the words are fixed: design starts from them."
}$json$),
(3, 'after-checklist', $json${
  "kind": "checklist",
  "tasks": [
    {"id": "agency-team-copy-comments", "label": "Collected the team's comments once, and made the changes in one go", "help": "One round. A second round of comments on the changes from the first is how copy takes a month."},
    {"id": "agency-team-copy-yes", "label": "The person with the final say has approved copy.md", "help": "A yes in writing. After this, a change to the words is a change request, not a comment."}
  ]
}$json$),

-- Step 4: Design system -------------------------------------------------------
(4, 'after-followups', pg_temp.team_prompts('design-system.md')),
(4, 'before-checklist', $json${
  "kind": "callout",
  "tone": "info",
  "body": "Sign-off. People cannot judge a list of colour codes. Ask your AI tool, or your design tool, to show the system on one sample page, send that to the person with the final say, and get a yes on the look before you build."
}$json$),
(4, 'after-checklist', $json${
  "kind": "checklist",
  "tasks": [
    {"id": "agency-team-design-yes", "label": "The person with the final say has approved the look", "help": "They have seen the colours and typefaces on a sample page, not only as a list, and said yes in writing."}
  ]
}$json$),

-- Build (step 7 of 8) ---------------------------------------------------------
(7, 'before-checklist', $json${
  "kind": "callout",
  "tone": "info",
  "body": "One person builds. Two people prompting the same tool about the same pages overwrite each other's work. Everyone else reviews: each finished page, on their own phone, with comments sent in one message."
}$json$),
(7, 'after-checklist', $json${
  "kind": "checklist",
  "tasks": [
    {"id": "agency-team-build-review", "label": "Someone other than the builder checked each page on their own phone", "help": "A second pair of eyes on a different phone finds what the builder has stopped seeing."}
  ]
}$json$),

-- Launch (step 8 of 8) --------------------------------------------------------
(8, 'before-checklist', $json${
  "kind": "callout",
  "tone": "info",
  "body": "Before it goes live, two things need a name. Who says yes: the person with the final say opens the preview link and approves it in writing. Who answers: decide whose inbox the enquiries reach and how fast they reply. A new site that takes four days to answer its first enquiry has wasted the build."
}$json$),
(8, 'after-checklist', $json${
  "kind": "checklist",
  "tasks": [
    {"id": "agency-team-launch-yes", "label": "The person with the final say has approved the preview link", "help": "They have opened it themselves, on a phone and on a computer, and said yes in writing."},
    {"id": "agency-team-enquiries", "label": "Agreed who answers enquiries, and how fast", "help": "A name and a time, such as: Priya, within one working day. Put a second name down for when the first is away."}
  ]
}$json$);

do $$
declare
  w_steps jsonb;
  step jsonb;
  step_no int := 0;
  n int;
  how_at int;
  followups_at int;
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
    step_no := step_no + 1;

    if not exists (select 1 from _team t where t.step = step_no)
       or exists (
         select 1 from jsonb_array_elements(step->'blocks') as b(val) where b.val->'when' ? 'team'
       ) then
      new_steps := new_steps || jsonb_build_array(step);
      continue;
    end if;

    select
      max(b.ord) filter (where b.val->>'body' like 'How it works:%'),
      max(b.ord) filter (where b.val->>'label' = 'After the AI answers'),
      min(b.ord) filter (where b.val->>'kind' = 'checklist'),
      max(b.ord) filter (where b.val->>'kind' = 'checklist'),
      count(*)
    into how_at, followups_at, first_checklist, last_checklist, n
    from jsonb_array_elements(step->'blocks') with ordinality as b(val, ord);

    -- Each existing block keeps its place at ord; a team block sorts just
    -- before or just after the block it is anchored to.
    select jsonb_agg(q.val order by q.at, q.side, q.seq)
    into new_blocks
    from (
      select b.val, b.ord::numeric as at, 0 as side, 0 as seq
      from jsonb_array_elements(step->'blocks') with ordinality as b(val, ord)
      union all
      select
        jsonb_set(t.block, '{when}', team),
        case t.anchor
          when 'after-how' then how_at
          when 'after-followups' then followups_at
          when 'before-checklist' then first_checklist
          else last_checklist
        end::numeric,
        case t.anchor when 'before-checklist' then -1 else 1 end,
        (row_number() over ())::int
      from _team t
      where t.step = step_no
    ) q;

    if new_blocks is null or jsonb_array_length(new_blocks) <> n + (select count(*) from _team t where t.step = step_no) then
      raise exception 'Step % lost a block, or a team block had nowhere to go', step_no;
    end if;

    new_steps := new_steps || jsonb_build_array(jsonb_set(step, '{blocks}', new_blocks));
  end loop;

  update wizards set steps = new_steps, updated_at = now() where slug = 'build-an-agency-website';
end;
$$;

-- Every team block landed, none of them carries a depth, every blank has a
-- hint, every version its line, and no task id repeats.
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
    and block.val->'when'->'team' ? 'team'
    and not block.val->'when' ? 'depth';
  if placed <> (select count(*) from _team) then
    raise exception 'Placed % team blocks, expected %', placed, (select count(*) from _team);
  end if;

  with team_prompts as (
    select block.val as block
    from wizards w,
      jsonb_array_elements(w.steps) as step(val),
      jsonb_array_elements(step.val->'blocks') as block(val)
    where w.slug = 'build-an-agency-website'
      and block.val->>'kind' = 'prompt'
      and block.val->'when' ? 'team'
  ), versions as (
    select block, option->>'prompt' as txt
    from team_prompts, jsonb_array_elements(block->'prompts') as option
  ), blanks as (
    select distinct block, hit[1] as token
    from versions, regexp_matches(txt, '(\[[^\[\]\n]+\])', 'g') as hit
  )
  select string_agg(distinct token, '; ')
  into problem
  from blanks
  where not exists (
    select 1 from jsonb_array_elements(block->'placeholders') as hint
    where hint->>'token' = token
  );
  if problem is not null then
    raise exception 'Team blanks with no hint: %', problem;
  end if;

  select string_agg(version.val->>'title', '; ')
  into problem
  from wizards w,
    jsonb_array_elements(w.steps) as step(val),
    jsonb_array_elements(step.val->'blocks') as block(val),
    jsonb_array_elements(coalesce(block.val->'prompts', '[]'::jsonb)) as version(val)
  where w.slug = 'build-an-agency-website' and not version.val ? 'description';
  if problem is not null then
    raise exception 'Prompt versions with no description: %', problem;
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

drop function pg_temp.team_prompts(text);
drop table _team;
