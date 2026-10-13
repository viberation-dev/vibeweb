-- Second round from Ali's own run of "Build an agency website", 2026-10-13.
--
-- What he hit, and what changes here (rules: docs/walkthrough-rules.md):
--
--   1. The replies were not Markdown he could save. Asked for a .md file,
--      free ChatGPT tried to build a download and ran out of quota. Every
--      prompt whose answer gets saved now asks for Markdown in one code
--      block and says not to create a file. (Rule 4.1)
--
--   2. Step 2's "After the AI answers" promised weak points and questions.
--      The blueprint prompt asks for neither, so there were none. The section
--      was one generic text stamped on six steps; it is now written per
--      step and says what that step's reply actually contains. (Rule 3.3)
--
--   3. After he answered the brief's questions, ChatGPT returned only the
--      changed sections, twice, and he had to ask for "the final copy". The
--      follow-up prompts now demand the complete file every time, and there
--      is a fourth, "Change one thing", for a single correction. (Rule 3.4)
--
--   4. The follow-up prompts carried "open in ChatGPT" links, which start a
--      new chat that has never seen the reply being answered. They are now
--      marked followUp, which the page shows as "paste into the same chat".
--
--   5. Two checklist lines in step 2 were unclear: "Every page has one job I
--      can say in a sentence" and "Made a list of everything marked NEEDED".
--      Checklist tasks can now carry a line of help, and every task that
--      states a judgement rather than an action has one, in all three
--      walkthroughs. (Rule 5.1)
--
-- The section now also says how to save a .md file and to start each step in
-- a new chat, since nothing did.
--
-- Safe to run twice: the old section is removed before the new one goes in,
-- and a prompt that already has the format line is left alone.

-- 1. The format line, on prompts whose answer is saved as a file. -------------
create function pg_temp.format_text(t text) returns text language sql immutable as $$
  select case
    when t is null or position('Do not create a file to download' in t) > 0 then t
    else replace(
      t,
      E'\n\nStop there. Do not suggest',
      E'\n\nPut the whole answer in Markdown inside a single code block I can copy, fenced with four backticks so any code inside it survives. Do not create a file to download.\n\nStop there. Do not suggest'
    )
  end
$$;

create function pg_temp.format_block(block jsonb) returns jsonb language plpgsql as $$
declare
  -- The versions that produce what goes in the file. "Challenge my brief",
  -- "Check my contrast" and "Do I need a CMS?" give advice, not a file.
  saved text[] := array[
    'Write the brief', 'Draw the blueprint', 'Cut it down', 'Write the copy',
    'Write a case study', 'Tighten it', 'Build it from a brand',
    'Build it from scratch', 'Plan the back end'
  ];
begin
  if block->>'kind' <> 'prompt' or block->>'label' = 'After the AI answers' then
    return block;
  end if;

  if block ? 'prompts' then
    if block->'prompts'->0->>'title' = any(saved) then
      block := jsonb_set(block, '{prompt}', to_jsonb(pg_temp.format_text(block->>'prompt')));
    end if;
    return jsonb_set(block, '{prompts}', (
      select jsonb_agg(
        case when version.val->>'title' = any(saved)
          then jsonb_set(version.val, '{prompt}', to_jsonb(pg_temp.format_text(version.val->>'prompt')))
          else version.val
        end
        order by version.ord)
      from jsonb_array_elements(block->'prompts') with ordinality as version(val, ord)
    ));
  end if;

  -- A block with one prompt and no versions: step 5's three.
  return jsonb_set(block, '{prompt}', to_jsonb(pg_temp.format_text(block->>'prompt')));
end;
$$;

-- 2 to 4. The section, written per step. --------------------------------------
-- {D} what the step makes, {F} its file, {WHAT} what the reply contains,
-- {NOTE} what to make of it. WHAT and NOTE go inside a JSON string, so they
-- hold no double quotes or line breaks.
create function pg_temp.after_file(d text, f text, what text, note text)
returns jsonb language sql immutable as $$
  select replace(replace(replace(replace(replace($json$[
    {
      "kind": "text",
      "body": "After the AI answers\n\nWhat you should have now: {WHAT}.\n\n{NOTE}\n\nTo save it: use the copy button on the code block, paste into a new plain text file, and save that in your spec folder as {F}. Notepad on Windows works. So does TextEdit on a Mac, once you choose Format, then Make Plain Text. So does any code editor. A .md file is ordinary text; the name is all that makes it one.\n\nIf the reply is not in a code block, or your AI tool offers a file to download and then says you have run out of something, use Wrap it up below. It asks for the same thing as plain text.\n\nTo change anything, use the prompts below, in the same chat. Three rules keep that short:\n\n1. One round of fixes. Say everything you want changed in one message, and take the rewrite.\n2. If a gap needs a real decision from you, such as your packages or your prices, make it once with Decide one thing, then come back.\n3. Whatever you still do not know stays in the file as [NEEDED: what]. The marker stays visible in every later step, so nothing is lost by moving on.\n\nA {D} with honest gaps marked is finished. Save it and go to the next step. Start the next step in a new chat: its prompt carries your files with it, and a short chat gives better answers than a long one."
    },
    {
      "kind": "prompt",
      "label": "After the AI answers",
      "followUp": true,
      "prompt": "Here is what I can add or correct. Where I wrote not yet, I do not know and cannot find out today.\n\n[your answers, one line each]\n\nRewrite the {D} once with this in it. Where I wrote not yet, keep or add [NEEDED: what] in the place it belongs and do not fill it in. Where I corrected something marked [ASSUMED], use my version. Remove the [ASSUMED] marks I did not correct.\n\n{COMPLETE}",
      "prompts": [
        {
          "title": "Fix the gaps once",
          "prompt": "Here is what I can add or correct. Where I wrote not yet, I do not know and cannot find out today.\n\n[your answers, one line each]\n\nRewrite the {D} once with this in it. Where I wrote not yet, keep or add [NEEDED: what] in the place it belongs and do not fill it in. Where I corrected something marked [ASSUMED], use my version. Remove the [ASSUMED] marks I did not correct.\n\n{COMPLETE}"
        },
        {
          "title": "Change one thing",
          "prompt": "One correction to the {D}: [what to change]\n\nApply it everywhere it matters, not only in one section.\n\n{COMPLETE}"
        },
        {
          "title": "Decide one thing",
          "prompt": "Before I finish the {D} I need to decide one thing: [the decision]\n\nWhat I know: [anything that limits the choice]\n\nGive me three options in a short table. Say which one you would pick for my situation and why, in two sentences, and stop. Do not write anything else for the site yet. I will tell you my choice, and then you will update the {D}."
        },
        {
          "title": "Wrap it up",
          "prompt": "We have gone far enough for now. Give me the final {D}, with everything we agreed in it.\n\nAnything still undecided goes in as [NEEDED: what].\n\n{COMPLETE}"
        }
      ],
      "placeholders": [
        {
          "token": "[your answers, one line each]",
          "tip": "Number them the way the AI numbered its questions or gaps. One sentence each is enough, and not yet is a real answer.",
          "options": [
            "1. Brand identity takes six weeks and includes two rounds of changes.\n2. Not yet. I will ask Holme Valley Dairy whether we can publish their numbers.\n3. We have launched eleven food and drink brands, so we already know what a supermarket buyer asks for.",
            "1. Yes, keep it.\n2. Not yet.\n3. Use the Fettle Coffee project."
          ]
        },
        {
          "token": "[what to change]",
          "tip": "Say what is wrong and what you want instead, in a sentence or two.",
          "options": [
            "We are based in Leeds but work with clients across the UK. Do not describe us as a Leeds-only studio.",
            "Drop the Pricing page. Prices go on the Services page."
          ]
        },
        {
          "token": "[the decision]",
          "tip": "One decision only: the one that is holding everything else up.",
          "options": [
            "What my three packages are and what each one costs.",
            "Whether each case study gets its own page.",
            "Which of two typefaces to use for headings."
          ]
        },
        {
          "token": "[anything that limits the choice]",
          "label": "What I know",
          "tip": "The facts every option has to respect: what you already sell, your prices so far, your time.",
          "options": [
            "Most projects so far cost 6,000 to 12,000 pounds and took about ten weeks.",
            "Nothing yet."
          ]
        }
      ]
    }
  ]$json$,
    '{COMPLETE}', 'Give me the complete {D}, every heading, not only the parts that changed. Put it in Markdown inside a single code block I can copy into {F}, fenced with four backticks so any code inside it survives. Do not create a file to download. Do not list new weaknesses, ask questions or suggest next steps.'),
    '{WHAT}', what), '{NOTE}', note), '{D}', d), '{F}', f)::jsonb
$$;

create function pg_temp.after_blocks(w_step int) returns jsonb language sql immutable as $$
  select case w_step
    when 1 then pg_temp.after_file('brief', 'brief.md',
      'a one-page brief under eight headings, followed by three questions about its weakest parts. If any of your answers looked borrowed or vague, the reply opens with a Check these list',
      'Answer the three questions, and anything under Check these, in one message with Fix the gaps once. That is your one round. You do not need a perfect answer to each: not yet is allowed, and it becomes a [NEEDED] marker.')
    when 2 then pg_temp.after_file('blueprint', 'blueprint.md',
      'a blueprint in four parts: the site map, the visitor journeys, the sections on each page, and the search basics',
      'This prompt does not ask for weak points or questions, so a good reply has none. What it does contain is [NEEDED: ...] markers, wherever a section needs something you have not supplied, such as a screenshot, an exact quote or what a package includes. Each marker is a job for you, not for the AI. You do not have to clear them now: list them, and collect them while you write the copy in the next step.')
    when 3 then pg_temp.after_file('copy', 'copy.md',
      'the words for every page in your blueprint, ending with a list of every [NEEDED] item',
      'That closing list is your to-do list: things only you can supply. Anything you can supply now, give in one message with Fix the gaps once. The case studies are written one at a time with the Write a case study prompt, and added to the same file.')
    when 4 then pg_temp.after_file('design system', 'design-system.md',
      'colours, type sizes, spacing, the components your pages use, and motion values, given twice: once as CSS custom properties and once in plain words',
      'There are no questions to answer here. Read the plain-words half. If a colour or a typeface is wrong for the brand, say so with Change one thing. If you are not sure, leave it: this is cheap to change later.')
    when 5 then pg_temp.after_file('set of behaviour notes', 'behaviour.md',
      'three replies, one from each prompt: the interactive parts, the motion, and how the site changes on a phone, a tablet and a desktop',
      'Paste all three, one after another, into the one file. Expect no questions back. If a reply describes something your blueprint does not have, such as a filter or a sign-in, it has invented it: use Change one thing to take it out.')
    when 6 then pg_temp.after_file('back-end plan', 'data.md',
      'a plan that says where an enquiry goes when someone presses send, where the case studies live, and what the privacy page has to say',
      'Expect no questions back. Check one thing yourself: you can name the inbox or the tool where an enquiry will arrive. If the plan adds sign-in, accounts or search, and the blueprint did not ask for them, use Change one thing to take them out.')
  end
$$;

-- 5. Help for the checklist lines that state a judgement. ----------------------
create temporary table _task_help (label text primary key, help text not null);
insert into _task_help (label, help) values
  -- Build an agency website
  ('Made a spec folder for this project',
   'An ordinary folder anywhere on your computer, named spec. Every file from this walkthrough goes in it.'),
  ('Saved the brief as brief.md',
   'The final brief, copied from the AI''s reply into a plain text file named brief.md, in your spec folder.'),
  ('Listed the real projects and testimonials I can publish',
   'A short list in your own notes: each project you may name, each number you can prove, each quote you have permission to use. Later steps may only use what is on it.'),
  ('Answered the gaps once, and marked the rest NEEDED',
   'You answered the AI''s three questions in one message. Anything you could not answer shows in brief.md as [NEEDED: ...].'),
  ('Every page has one job I can say in a sentence',
   'Look at the site map in your blueprint. Each page has one sentence saying what it is for, such as: Services, help a visitor see what we do and what it costs. If you need the word and to describe a page, it is doing two jobs: split it, or cut one.'),
  ('Made a list of everything marked NEEDED',
   'Search blueprint.md for the word NEEDED. Each one is something only you can supply: a screenshot, an exact quote, what a package includes. Copy them into one list in your notes. This is not the four parts of the blueprint. It is the gaps inside them, and you collect them during the next step.'),
  ('Wrote at least two case studies from real projects',
   'Run the Write a case study prompt once for each project. Two is the fewest that lets a buyer see a pattern.'),
  ('No NEEDED markers left, or a date to get each one',
   'Search copy.md for NEEDED. For each one still there, write down what you are waiting for, from whom, and by when.'),
  ('Have the tokens as CSS custom properties',
   'Your file has a block of lines that look like --color-ink: #101820; Those are the tokens. Your build tool reads them directly.'),
  ('Every text and background pair passes AA',
   'Run the Check my contrast prompt. Every pair should say pass for body text. AA is the accessibility standard most sites are held to.'),
  ('Saved all three answers as behaviour.md',
   'The three replies from this step, pasted one after another into a single file.'),
  ('The enquiry form has words for every error',
   'In behaviour.md, the form section gives the exact message for each thing that can go wrong: an empty field, a mistyped email address, a send that fails.'),
  ('Reduced motion is covered',
   'The motion section says what happens for someone whose device is set to reduce motion. The answer should be that content simply appears.'),
  ('Know exactly where an enquiry ends up',
   'You can name the inbox or the tool where a new enquiry arrives, and the person who reads it.'),
  ('Decided who adds case studies, and how',
   'You have a name and a method: editing a file in the project, or logging in to a content system.'),
  ('Built the home page and checked it against the spec',
   'Run the Check a page against the spec prompt on the finished home page before you start another page.'),
  ('Built every other page in the blueprint',
   'Every page in your site map exists and has been through the same check.'),
  ('Checked every page on a real phone',
   'On your own phone, not a narrow browser window. Look for text that is too small, buttons too close together, and anything that runs off the side.'),
  ('Ran the audit and fixed everything critical and high',
   'The audit marks each finding critical, high, medium or low. Critical and high are fixed before launch. Medium and low go on a list for afterwards.'),
  ('Handed over, or set a reminder to add the next case study',
   'For a client: they have the handover document and own every account. For your own site: a date in your calendar to add the next project.'),
  -- Ship your first web project
  ('Cut it down to one screen',
   'Everything your idea does happens on a single page, with no menu and no second page to click through to.'),
  ('Decided what done looks like, so I know when to stop',
   'One sentence you can check, such as: three routes show, I can tap one, and the count goes up. When that is true, you are finished.'),
  -- Add a database with Supabase
  ('Understood what a table, a row and a column are',
   'You can say it in your own words: a table is like one sheet in a spreadsheet, a row is one entry, a column is one kind of detail about each entry.'),
  ('Know why Row Level Security matters before I start',
   'You can say what goes wrong without it: anyone who has your site''s public key could read or change every row.');

create function pg_temp.help_block(block jsonb) returns jsonb language sql as $$
  select case when block->>'kind' <> 'checklist' then block else
    jsonb_set(block, '{tasks}', (
      select jsonb_agg(
        case when h.help is null then task.val
             else jsonb_set(task.val, '{help}', to_jsonb(h.help)) end
        order by task.ord)
      from jsonb_array_elements(block->'tasks') with ordinality as task(val, ord)
      left join _task_help h on h.label = task.val->>'label'
    ))
  end
$$;

do $$
declare
  walkthrough record;
  step jsonb;
  step_no int;
  blocks jsonb;
  extra jsonb;
  last_prompt int;
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
      blocks := step->'blocks';

      extra := case when walkthrough.slug = 'build-an-agency-website' then pg_temp.after_blocks(step_no) end;

      if extra is not null then
        -- Out with the generic section, in with this step's own.
        select jsonb_agg(pg_temp.format_block(b.val) order by b.ord)
        into blocks
        from jsonb_array_elements(blocks) with ordinality as b(val, ord)
        where not (coalesce(b.val->>'label', '') = 'After the AI answers'
                   or coalesce(b.val->>'body', '') like 'After the AI answers%');

        select max(b.ord)::int
        into last_prompt
        from jsonb_array_elements(blocks) with ordinality as b(val, ord)
        where b.val->>'kind' = 'prompt';

        if last_prompt is null then
          raise exception '% step % has no prompt to follow', walkthrough.slug, step_no;
        end if;

        select jsonb_agg(q.val order by q.o1, q.o2)
        into blocks
        from (
          select b.val, b.ord as o1, 0 as o2
          from jsonb_array_elements(blocks) with ordinality as b(val, ord)
          union all
          select e.val, last_prompt, e.ord
          from jsonb_array_elements(extra) with ordinality as e(val, ord)
        ) q;
      end if;

      select jsonb_agg(pg_temp.help_block(b.val) order by b.ord)
      into blocks
      from jsonb_array_elements(blocks) with ordinality as b(val, ord);

      new_steps := new_steps || jsonb_build_array(jsonb_set(step, '{blocks}', blocks));
    end loop;

    update wizards set steps = new_steps, updated_at = now() where slug = walkthrough.slug;
  end loop;
end;
$$;

-- Every saved-file prompt got its format line, and no help text missed its task.
do $$
declare
  problem text;
begin
  select string_agg(h.label, '; ')
  into problem
  from _task_help h
  where not exists (
    select 1
    from wizards w,
      jsonb_array_elements(w.steps) as step(val),
      jsonb_array_elements(step.val->'blocks') as block(val),
      jsonb_array_elements(coalesce(block.val->'tasks', '[]'::jsonb)) as task(val)
    where task.val->>'label' = h.label and task.val->>'help' = h.help
  );
  if problem is not null then
    raise exception 'Help written for a task that does not exist: %', problem;
  end if;

  select count(*)::text
  into problem
  from wizards w,
    jsonb_array_elements(w.steps) with ordinality as step(val, ord),
    jsonb_array_elements(step.val->'blocks') as block(val)
  where w.slug = 'build-an-agency-website'
    and step.ord <= 6
    and block.val->>'kind' = 'prompt'
    and position('Do not create a file to download' in block.val->>'prompt') > 0;
  -- Six main prompts, three in step 5 counted once each (8), plus six follow-ups.
  if problem::int < 14 then
    raise exception 'Only % prompt blocks carry the format line; expected 14', problem;
  end if;
end;
$$;

drop function pg_temp.help_block(jsonb);
drop table _task_help;
drop function pg_temp.after_blocks(int);
drop function pg_temp.after_file(text, text, text, text);
drop function pg_temp.format_block(jsonb);
drop function pg_temp.format_text(text);
