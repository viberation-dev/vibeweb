-- Third round from Ali's own run of "Build an agency website", 2026-10-13,
-- this time step 3 (Copy). Rules: docs/walkthrough-rules.md.
--
--   1. "Write the copy" came back with 36 [NEEDED] items. All valid, and far
--      more than one person can supply in a sitting, so the step felt like a
--      wall. The prompt now reserves [NEEDED] for facts that must not be
--      invented, tells the AI to pick a default marked [ASSUMED] for
--      everything else, and sorts what is left into three lists, with at
--      most eight in the one that blocks launch. (Rule 3.8)
--
--   2. The block offers three prompts (Write the copy, Write a case study,
--      Tighten it) and said nothing about which to use when, or where a case
--      study goes once written. Every version of every prompt, in all three
--      walkthroughs, now carries a line saying when to use it and where its
--      answer goes. The four follow-ups get the same, since "why are there
--      four?" was the next question. (Rule 6.1)
--
--   3. "[paste copy.md]" did not say which copy.md: the first reply, or the
--      one with the case studies in it. Every paste-a-file blank now says the
--      latest saved version. (Rule 1.4)
--
--   4. "A client's site? Send them copy.md..." sat in front of a reader who
--      had said in step 1 that the site was their own. It moves into the same
--      "Whose site is it?" choice steps 1 and 8 use, which the page now
--      remembers from one step to the next. (Rule 6.2)
--
-- Safe to run twice: every edit is a replace of text that is gone afterwards,
-- or a set of a value to the same value.

create temporary table _descriptions (title text primary key, description text not null);
insert into _descriptions (title, description) values
  -- Build an agency website
  ('Write the brief', 'Start here. Fill in the blanks about the agency and it returns the brief. Save the result as brief.md.'),
  ('Challenge my brief', 'Optional, once brief.md is saved. It reads the brief as a buyer would and says what is vague. It returns advice and three sharper positioning lines, not a new file: copy any line you like into brief.md yourself.'),
  ('Draw the blueprint', 'Start here. It turns brief.md into the list of pages and what sits on each one. Save the result as blueprint.md.'),
  ('Cut it down', 'Optional, once blueprint.md is saved, if the site looks like more than you can build. It returns a smaller blueprint: save it over blueprint.md.'),
  ('Write the copy', 'Start here. It writes the words for every page in your blueprint. Save the result as copy.md.'),
  ('Write a case study', 'Run this once for each real project, after Write the copy. It returns one case study. Open copy.md, find that project''s page, and paste the case study over the rough version there.'),
  ('Tighten it', 'Run this last, on your latest copy.md, once the case studies and your own corrections are in it. It returns a shorter version: save it over copy.md.'),
  ('Build it from a brand', 'Use this if a logo, colours or typefaces already exist and have to be kept. Save the result as design-system.md.'),
  ('Build it from scratch', 'Use this if there is no brand yet. Run one of these two, not both. Save the result as design-system.md.'),
  ('Check my contrast', 'Optional, once design-system.md is saved. It checks that text can be read on its background. It returns a list of passes and failures, not a file: change any failing colour in design-system.md yourself.'),
  ('Plan the back end', 'Start here. It returns the plan for enquiries and content. Save the result as data.md.'),
  ('Do I need a CMS?', 'Optional, if you cannot decide where the case studies should live. It returns advice, not a file: add what you decide to data.md yourself.'),
  ('Write my build prompts', 'Start here. It turns your six spec files into a set of prompts, one for each page, written for the tool you are building with. Keep them in a file and use them one at a time.'),
  ('Check a page against the spec', 'Run this each time you finish a page. It returns the differences from your spec and how to fix each one.'),
  ('Fix something that looks off', 'Use this when part of a page looks wrong and you cannot say why. It returns the exact change to make.'),
  ('Audit before launch', 'Start here, with the site on a preview link. It returns a list of findings, in the order to fix them.'),
  ('Fix a finding', 'Run this once for each finding you decide to fix, critical and high first.'),
  ('Write the handover', 'Run this last. For a client, it returns the document you hand over with the site. For your own agency it is still worth having: it is the page you will want in a year.'),
  -- The four follow-ups
  ('Fix the gaps once', 'Use this when the AI asked you questions or left gaps, and you have several things to tell it.'),
  ('Change one thing', 'Use this when the reply is right except for one thing.'),
  ('Decide one thing', 'Use this when you cannot answer because you have not decided yet. It gives you options to choose from, not a rewrite.'),
  ('Wrap it up', 'Use this when the chat has gone on too long, or the reply was not something you could copy. It asks for the finished file and nothing else.'),
  -- Ship your first web project
  ('Check my idea', 'Use this if you already have an idea. It tells you whether it is small enough for a first project.'),
  ('Shrink my idea', 'Use this if your idea feels big, or you cannot say it in one sentence. It returns a smaller version.'),
  ('I have no idea yet', 'Use this if you have nothing in mind. It suggests ideas from the things you care about.'),
  ('Fix an install', 'Use this when Node.js or Git will not install, or will not run afterwards.'),
  ('Explain the terminal', 'Optional. Use this if the terminal is new to you and you want to know what you are looking at.'),
  ('Check my setup', 'Use this at the end of the step, to confirm everything is installed before you go on.'),
  ('Fix an error', 'Use this when a command or a page shows an error. Paste the message exactly: the AI needs it word for word.'),
  ('Explain the files', 'Optional. Use this if you want to know what the files in your new project are for.'),
  ('Build my first screen', 'Use this once the starter page is running, to replace it with the first version of your own idea.'),
  ('Fix a GitHub error', 'Use this when a git command fails or GitHub refuses your push.'),
  ('Undo a mistake', 'Use this when you think you have lost or broken something with git. Run it before you try anything else.'),
  ('Explain git', 'Optional. Use this once your code is on GitHub, if you want to understand what the commands did.'),
  ('Fix a failed deploy', 'Use this when your host says the build failed.'),
  ('Help me choose a host', 'Use this before you deploy, if you cannot choose between the three hosts.'),
  ('Explain what just happened', 'Optional. Use this once your site is live, if you want to understand how it got there.'),
  ('Review it like a stranger', 'Start here. It looks at your live site the way a first-time visitor would and names the one fix worth making.'),
  ('Pre-launch checklist', 'Use this for a list of small things to check before you share the link.'),
  ('Write my share message', 'Run this last, when you are ready to send the link to someone.'),
  -- Add a database with Supabase
  ('Design my tables', 'Use this if you know your project needs a database. It returns the tables to create.'),
  ('Do I need a database?', 'Use this first if you are not sure. It may tell you that you do not need one.'),
  ('Explain Row Level Security', 'Optional, but worth five minutes. It explains the one idea that keeps your data safe.'),
  ('Which region?', 'Use this if you do not know which region to pick when creating the project.'),
  ('Fix a problem', 'Use this when creating the project goes wrong.'),
  ('Make it my own table', 'Use this once the example works, to change the table to fit your own idea.'),
  ('Explain this SQL', 'Optional. Use this if you want the script explained line by line.'),
  ('Fix an SQL error', 'Use this when the SQL Editor shows an error. Paste the script and the message exactly.'),
  ('Adapt it to my idea', 'Use this once the guestbook works, to turn the page into your own.'),
  ('Explain the code', 'Optional. Use this if you want the page explained section by section.'),
  ('Fix the live site', 'Use this when it works on your computer but not on your live site.'),
  ('Add sign-in next', 'Optional, for afterwards. It explains what would change if only signed-in people could post.'),
  ('Check my security', 'Run this before you share the link. It reviews your table''s security rules.');

create function pg_temp.describe_block(block jsonb) returns jsonb language plpgsql as $$
begin
  if block->>'kind' = 'tabs' then
    return jsonb_set(block, '{tabs}', (
      select jsonb_agg(
        jsonb_set(tab.val, '{blocks}', (
          select jsonb_agg(pg_temp.describe_block(inner_block.val) order by inner_block.ord)
          from jsonb_array_elements(tab.val->'blocks') with ordinality as inner_block(val, ord)
        ))
        order by tab.ord)
      from jsonb_array_elements(block->'tabs') with ordinality as tab(val, ord)
    ));
  end if;

  if block->>'kind' <> 'prompt' then
    return block;
  end if;

  -- Rule 1.4: a blank that pastes a saved file says which version of it.
  if block ? 'placeholders' then
    block := jsonb_set(block, '{placeholders}', (
      select jsonb_agg(
        case when hint.val->>'token' ~ '^\[paste [a-z-]+\.md\]$'
          then jsonb_set(hint.val, '{tip}', to_jsonb(
            'Your latest saved ' || substring(hint.val->>'token' from '^\[paste (.+)\]$')
            || ', pasted in full. Not a summary, and not an earlier draft.'))
          else hint.val
        end
        order by hint.ord)
      from jsonb_array_elements(block->'placeholders') with ordinality as hint(val, ord)
    ));
  end if;

  if not block ? 'prompts' then
    return block;
  end if;

  return jsonb_set(block, '{prompts}', (
    select jsonb_agg(
      case when d.description is null then version.val
           else jsonb_set(version.val, '{description}', to_jsonb(d.description)) end
      order by version.ord)
    from jsonb_array_elements(block->'prompts') with ordinality as version(val, ord)
    left join _descriptions d on d.title = version.val->>'title'
  ));
end;
$$;

-- Step 3 of the agency walkthrough, as text edits on the stored JSON. Every
-- "old" string is one this migration removes, so a second run finds nothing.
create function pg_temp.fix_copy_step(step_text text) returns text language sql immutable as $$
  select replace(replace(replace(replace(replace(replace(step_text,
    -- 1. [NEEDED] only for facts; a default for the rest.
    $old$- Use only the projects, numbers and testimonials in the brief. Where proof is missing, write [NEEDED: what] and move on. Do not invent clients, statistics or quotes.$old$,
    $new$- Use only the projects, numbers and testimonials in the brief. Do not invent clients, statistics or quotes.\n- Write [NEEDED: what] only for a fact you must not invent: a name, a number, a quote, a price, a legal detail, or what a package includes. Group them: one [NEEDED] for a package's details, not one for each detail.\n- For anything else you would normally ask me, such as a form field, a response time or a button label, choose a sensible default, write it, and mark it [ASSUMED] so I can change it.$new$),
    -- ... and what is left, sorted.
    $old$Finish with a list of every [NEEDED] item so I can go and get them.$old$,
    $new$Finish with the [NEEDED] items in three short lists. Before launch: the site would be wrong or misleading without it. Soon after: the site would be better with it. Nice to have. Put no more than eight items in Before launch, most important first, and say in a few words who could supply each one.$new$),
    -- The section after the prompt, to match.
    $old$ending with a list of every [NEEDED] item$old$,
    $new$ending with the [NEEDED] items sorted into three lists$new$),
    $old$That closing list is your to-do list: things only you can supply. Anything you can supply now, give in one message with Fix the gaps once. The case studies are written one at a time with the Write a case study prompt, and added to the same file.$old$,
    $new$Only the first list, Before launch, has to be dealt with, and not today: it is what you collect before the site goes live. It says who could supply each item, so you do not have to find everything yourself. Anything marked [ASSUMED] is a default the AI chose for you, such as a form field or a button label. Read those, change the wrong ones with Fix the gaps once, and leave the rest.\n\nThe case studies come next. Run Write a case study once for each project, then open copy.md and paste each one over the rough version on that project's page. When they are in, run Tighten it on the whole file.$new$),
    -- The checklist line that asked for every marker to be cleared.
    $old$No NEEDED markers left, or a date to get each one$old$,
    $new$Nothing left on the Before launch list, or a date for each item$new$),
    $old$Search copy.md for NEEDED. For each one still there, write down what you are waiting for, from whom, and by when.$old$,
    $new$Look at the Before launch list at the end of copy.md. For each item still open, write down who you are waiting for and by when. The other two lists can wait until the site is live.$new$)
$$;

do $$
declare
  walkthrough record;
  step jsonb;
  step_no int;
  blocks jsonb;
  new_steps jsonb;
begin
  for walkthrough in
    select slug, steps from wizards
    where slug in ('build-an-agency-website', 'ship-your-first-web-project', 'add-a-database-with-supabase')
  loop
    new_steps := '[]'::jsonb;
    step_no := 0;

    for step in
      select s.val from jsonb_array_elements(walkthrough.steps) with ordinality as s(val, ord) order by s.ord
    loop
      step_no := step_no + 1;

      if walkthrough.slug = 'build-an-agency-website' then
        if step_no = 3 then
          step := pg_temp.fix_copy_step(step::text)::jsonb;
        end if;

        -- Why there are four follow-ups, on every step that has them.
        step := replace(step::text,
          'To change anything, use the prompts below, in the same chat. Three rules keep that short:',
          'To change anything, use one of the four prompts below, in the same chat. There are four because there are four different situations, and each one says when to use it. Most people need one, and often none. Three rules keep it short:'
        )::jsonb;
      end if;

      select jsonb_agg(
        case
          -- 4. Advice for a client's site moves inside the choice it depends on.
          when b.val->>'kind' = 'callout' and b.val->>'body' like 'A client''s site? Send them copy.md%' then
            $json${
              "kind": "tabs",
              "label": "Whose site is it?",
              "tabs": [
                {"key": "mine", "title": "My own agency", "blocks": [
                  {"kind": "text", "body": "Nobody has to approve this but you. Read copy.md aloud once before you move on, and change anything you stumble over. If you have a business partner, send it to them now: words are free to change at this point and expensive later."}
                ]},
                {"key": "client", "title": "A client's agency", "blocks": [
                  {"kind": "callout", "tone": "info", "body": "Send them copy.md and get it approved before you design anything. Changes to words are free at this point and expensive later, and a signed-off document is what you point to when the feedback starts to wander."}
                ]}
              ]
            }$json$::jsonb
          else pg_temp.describe_block(b.val)
        end
        order by b.ord)
      into blocks
      from jsonb_array_elements(step->'blocks') with ordinality as b(val, ord);

      new_steps := new_steps || jsonb_build_array(jsonb_set(step, '{blocks}', blocks));
    end loop;

    update wizards set steps = new_steps, updated_at = now() where slug = walkthrough.slug;
  end loop;
end;
$$;

-- No version of any prompt left without its line, and the step 3 edits landed.
do $$
declare
  problem text;
begin
  select string_agg(distinct w.slug || ': ' || (version.val->>'title'), '; ')
  into problem
  from wizards w,
    jsonb_array_elements(w.steps) as step(val),
    jsonb_array_elements(step.val->'blocks') as block(val),
    jsonb_array_elements(coalesce(block.val->'prompts', '[]'::jsonb)) as version(val)
  where w.slug in ('build-an-agency-website', 'ship-your-first-web-project', 'add-a-database-with-supabase')
    and not version.val ? 'description';
  if problem is not null then
    raise exception 'Prompt versions with no description: %', problem;
  end if;

  select steps->2 #>> '{}' into problem from wizards where slug = 'build-an-agency-website';
  if problem is null
     or position('three short lists' in problem) = 0
     or position('No NEEDED markers left' in problem) > 0
     or position('A client''s site? Send them copy.md' in problem) > 0
     or position('Your latest saved copy.md' in problem) = 0 then
    raise exception 'Step 3 of the agency walkthrough did not take every edit';
  end if;
end;
$$;

drop function pg_temp.fix_copy_step(text);
drop function pg_temp.describe_block(jsonb);
drop table _descriptions;
