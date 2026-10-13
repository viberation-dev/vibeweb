-- Basic, for "Build an agency website".
--
-- Ali, 2026-10-13: the walkthrough at full detail asks more than one person
-- can supply, and should come at three depths. This is the first: Basic, the
-- shortest route to a live site. Rules: docs/walkthrough-rules.md section 7.
--
-- What Basic is:
--
--   Steps   six, not eight. Behaviour and Forms and content drop out; the two
--           things from them a small site cannot do without (a form that
--           sends an email, a page that works on a phone) move into Build.
--   Site    four pages or fewer: Home, Services, Work, Contact. Projects are
--           short entries on the Work page, not a page each.
--   Brief   five answers, not nine. The AI chooses the rest and marks it
--           [ASSUMED].
--   Gaps    at most three block launch.
--
-- How it is done: every block that differs is written twice. The existing
-- one is tagged for Standard and a Basic one goes in straight after it.
-- Everything untagged is shared, which is most of the walkthrough.
--
-- The Basic prompts reuse the hints of the Standard prompt they replace, for
-- the blanks they share, so the two cannot drift. A hint written on a Basic
-- block wins over the inherited one.
--
-- Also fixed here: step 1 told readers to keep everything in "one long chat",
-- which contradicts the advice, added on 2026-10-13, to start each step in a
-- new one.
--
-- Needs the build that understands `when` to be live first: an older build
-- ignores the tag and would show both versions of each block.
--
-- Safe to run twice: a step that already has a Basic block is left alone.

create temporary table _basic (
  step int not null,
  kind text not null,
  -- Matched against the block's label, or its body where it has no label.
  pattern text not null,
  basic jsonb not null
);

insert into _basic (step, kind, pattern, basic) values

-- Step 1: Brief ---------------------------------------------------------------
(1, 'prompt', 'Pick a prompt%', $json${
  "kind": "prompt",
  "label": "Paste this into your AI tool",
  "prompt": "Help me write a short brief for a small agency website. Ask me nothing. Work from what is below, and where I have not told you something, choose a sensible answer and mark it [ASSUMED] so I can correct it.\n\nThe agency: [name, what it does, where it is based]\nBest-fit client: [who buys, their size, what is going wrong for them when they come looking]\nServices and rough prices: [list them]\nReal proof we can show: [finished projects, results with numbers, testimonials we have permission to use]\nThe one action a visitor should take: [book a call, send an enquiry, ask for a quote]\n\nWrite the brief with these headings: Audience, Offer, Primary action, Proof, Positioning in one sentence, Tone, Out of scope for version one. Plan for a site of four pages or fewer.\n\nKeep it under 250 words. Finish with the one question whose answer would improve this brief most, and nothing else.\n\nBefore you write anything, check my answers above. If one reads like a stock example, or does not fit the business I described, list it first under the heading Check these and say why in a few words. Then carry on, and mark anything you build on those answers [ASSUMED].\n\nPut the whole answer in Markdown inside a single code block I can copy, fenced with four backticks so any code inside it survives. Do not create a file to download.\n\nStop there. Do not suggest next steps or offer to do more. I am following a set process and the next step has its own prompt."
}$json$),

(1, 'text', 'After the AI answers%', $json${
  "kind": "text",
  "body": "After the AI answers\n\nWhat you should have now: a short brief under seven headings, followed by one question. If any of your answers looked borrowed or vague, the reply opens with a Check these list.\n\nRead the lines marked [ASSUMED]. Those are the AI's guesses about your tone, what makes you different and what to leave out. If a guess is wrong, say so. Answer the one question, and anything under Check these, in one message with Fix the gaps once. If you cannot answer, write not yet and move on.\n\nTo save it: use the copy button on the code block, paste into a new plain text file, and save that in your spec folder as brief.md. Notepad on Windows works. So does TextEdit on a Mac, once you choose Format, then Make Plain Text. So does any code editor. A .md file is ordinary text; the name is all that makes it one.\n\nIf the reply is not in a code block, or your AI tool offers a file to download and then says you have run out of something, use Wrap it up below. It asks for the same thing as plain text.\n\nTo change anything, use one of the four prompts below, in the same chat. Most people need one, and often none.\n\nA brief with a guess or two left in it is finished. Save it and go to the next step. Start the next step in a new chat: its prompt carries your files with it, and a short chat gives better answers than a long one."
}$json$),

-- Step 2: Blueprint -----------------------------------------------------------
(2, 'callout', 'Smaller is better%', $json${
  "kind": "callout",
  "tone": "tip",
  "body": "Four pages is enough to launch: Home, Services, Work and Contact. Your projects go on the Work page as short entries. A page for each project is worth having later, and switching this walkthrough to Standard adds it."
}$json$),

(2, 'prompt', 'Pick a prompt%', $json${
  "kind": "prompt",
  "label": "Paste this into your AI tool",
  "prompt": "Plan the structure of a small agency website from this brief:\n\n[paste brief.md]\n\nUse at most four pages: Home, Services, Work and Contact. Show each project as a short entry on the Work page, not on a page of its own. Leave out any of the four the brief does not need.\n\nGive me three things.\n\n1. Site map. Each page, its address, and its one job in a single sentence.\n\n2. Sections per page. For each page, the sections from top to bottom, five at most. For each section, say what question in the visitor's head it answers. If a section answers no question, remove it.\n\n3. Search basics. For each page: the page title (under 60 characters), the meta description (under 155 characters) and the single h1.\n\nUse only the proof listed in the brief. Write [NEEDED: what] only for a fact you must not invent: a name, a number, a quote or a price. For anything else, choose a sensible default and mark it [ASSUMED].\n\nPut the whole answer in Markdown inside a single code block I can copy, fenced with four backticks so any code inside it survives. Do not create a file to download.\n\nStop there. Do not suggest next steps or offer to do more. I am following a set process and the next step has its own prompt."
}$json$),

(2, 'text', 'After the AI answers%', $json${
  "kind": "text",
  "body": "After the AI answers\n\nWhat you should have now: a blueprint in three parts: the site map, the sections on each page, and the search basics.\n\nThis prompt does not ask for weak points or questions, so a good reply has none. It may contain a few [NEEDED: ...] markers, for facts only you can supply, such as an exact quote or a price. Each one is a job for you, not for the AI. You do not have to clear them now: note them, and deal with them while you write the copy in the next step.\n\nTo save it: use the copy button on the code block, paste into a new plain text file, and save that in your spec folder as blueprint.md.\n\nIf the reply is not in a code block, or your AI tool offers a file to download and then says you have run out of something, use Wrap it up below.\n\nTo change anything, use one of the four prompts below, in the same chat. Most people need one, and often none.\n\nSave it and go to the next step, in a new chat."
}$json$),

-- Step 3: Copy ----------------------------------------------------------------
(3, 'prompt', 'Pick a prompt%', $json${
  "kind": "prompt",
  "label": "Paste this into your AI tool",
  "prompt": "Write the copy for a small agency website. Here is the brief and the blueprint:\n\n[paste brief.md]\n\n[paste blueprint.md]\n\nGo page by page, section by section, in the order the blueprint gives. For each section write the final words, not a description of them.\n\nRules:\n- Headlines say what the visitor gets, in eight words or fewer. No headline that would fit any other agency.\n- One supporting sentence under each headline, 20 words or fewer.\n- One primary button label, used the same way on every page, that names the action in the brief.\n- Write in the tone the brief asks for. Plain words. No \"we are passionate about\", no \"solutions\", no \"elevate\".\n- Use only the projects, numbers and testimonials in the brief. Do not invent clients, statistics or quotes.\n- For each project on the Work page write a title, two sentences on what was done and one on what changed, using only what the brief says.\n- For the contact page, write the form labels, the button, the message shown after sending, and the message shown if sending fails.\n- Write three questions and answers a buyer really asks before hiring, including price and timescale.\n- For the footer, list the links, and tell me which legal pages I must get written properly.\n- Write [NEEDED: what] only for a fact you must not invent: a name, a number, a quote, a price or a legal detail. For anything else, choose a sensible default, write it, and mark it [ASSUMED] so I can change it.\n\nFinish with the [NEEDED] items in two short lists. Before launch: the site would be wrong or misleading without it. Later: everything else. Put no more than three items in Before launch, most important first, and say in a few words who could supply each one.\n\nPut the whole answer in Markdown inside a single code block I can copy, fenced with four backticks so any code inside it survives. Do not create a file to download.\n\nStop there. Do not suggest next steps or offer to do more. I am following a set process and the next step has its own prompt."
}$json$),

(3, 'text', 'After the AI answers%', $json${
  "kind": "text",
  "body": "After the AI answers\n\nWhat you should have now: the words for every page in your blueprint, ending with two short lists of [NEEDED] items.\n\nOnly the first list, Before launch, has to be dealt with, and it holds three items at most. It says who could supply each one. You do not have to have them today: they are what you collect before the site goes live. Anything marked [ASSUMED] is a default the AI chose for you. Read those, change the wrong ones with Fix the gaps once, and leave the rest.\n\nThen read the whole thing aloud once. Anything you stumble over, or would not say to a client's face, change with Change one thing.\n\nTo save it: use the copy button on the code block, paste into a new plain text file, and save that in your spec folder as copy.md.\n\nIf the reply is not in a code block, or your AI tool offers a file to download and then says you have run out of something, use Wrap it up below.\n\nSave it and go to the next step, in a new chat."
}$json$),

(3, 'checklist', '%', $json${
  "kind": "checklist",
  "tasks": [
    {"id": "agency-copy-saved-basic", "label": "Saved the copy as copy.md"},
    {"id": "agency-copy-aloud-basic", "label": "Read it aloud once and fixed what I stumbled on", "help": "Out loud, not in your head. A sentence you trip over when speaking is one a visitor will skip when reading."},
    {"id": "agency-copy-launch-basic", "label": "Nothing left on the Before launch list, or a date for each item", "help": "Look at the Before launch list at the end of copy.md. For each item still open, write down who you are waiting for and by when. The Later list can wait until the site is live."}
  ]
}$json$),

-- Step 7: Build ---------------------------------------------------------------
(7, 'text', 'You now have six files%', $json${
  "kind": "text",
  "body": "You now have four files that describe the whole site: brief.md, blueprint.md, copy.md and design-system.md. The build is mostly feeding them to a tool in the right order.\n\nThe mistake to avoid is pasting everything in and asking for the whole site at once. You get something that looks finished and is wrong in forty small ways. Build the home page first, get it right, and let every later page copy it.\n\nBasic skips the separate steps on behaviour and on forms, so the two things from them that a small site cannot do without are built in here: an enquiry form that reaches your inbox, and pages that work on a phone."
}$json$),

(7, 'prompt', 'Pick a prompt%', $json${
  "kind": "prompt",
  "label": "Pick a prompt and paste it into your AI tool",
  "prompt": "Turn my website spec into prompts for a build tool. I am building with: [name the tool].\n\n[paste brief.md]\n[paste blueprint.md]\n[paste copy.md]\n[paste design-system.md]\n\nWrite one prompt per step, in the order I should run them:\n1. Foundations: the design tokens, typefaces, page shell, navigation and footer.\n2. The home page.\n3. One prompt for each remaining page in the blueprint.\n4. The enquiry form. It sends an email to the agency's inbox and shows the thank-you message from the copy. It checks every field again on the server, shows the failure message from the copy if sending fails, and has a hidden field that catches spam.\n\nEach prompt must:\n- Open with the finished result in one sentence.\n- Carry the exact colours, typefaces and spacing it needs, because the tool will not remember them from an earlier prompt.\n- Name the sections in order, with the real copy for each one.\n- Say how the page looks on a phone and on a desktop.\n- End with a short list of things I can check by looking, so I know when the step is done.\n\nKeep each prompt short enough for the tool I named. If a page is too big for one prompt, split it and say so.\n\nStop there. Do not suggest next steps or offer to do more. I am following a set process and the next step has its own prompt.",
  "prompts": [
    {
      "title": "Write my build prompts",
      "description": "Start here. It turns your four spec files into a set of prompts, one for each page, written for the tool you are building with. Keep them in a file and use them one at a time.",
      "prompt": "Turn my website spec into prompts for a build tool. I am building with: [name the tool].\n\n[paste brief.md]\n[paste blueprint.md]\n[paste copy.md]\n[paste design-system.md]\n\nWrite one prompt per step, in the order I should run them:\n1. Foundations: the design tokens, typefaces, page shell, navigation and footer.\n2. The home page.\n3. One prompt for each remaining page in the blueprint.\n4. The enquiry form. It sends an email to the agency's inbox and shows the thank-you message from the copy. It checks every field again on the server, shows the failure message from the copy if sending fails, and has a hidden field that catches spam.\n\nEach prompt must:\n- Open with the finished result in one sentence.\n- Carry the exact colours, typefaces and spacing it needs, because the tool will not remember them from an earlier prompt.\n- Name the sections in order, with the real copy for each one.\n- Say how the page looks on a phone and on a desktop.\n- End with a short list of things I can check by looking, so I know when the step is done.\n\nKeep each prompt short enough for the tool I named. If a page is too big for one prompt, split it and say so.\n\nStop there. Do not suggest next steps or offer to do more. I am following a set process and the next step has its own prompt."
    },
    {
      "title": "Check a page against the spec",
      "description": "Run this each time you finish a page. It returns the differences from your spec and how to fix each one.",
      "prompt": "I have built one page of an agency website and want it checked against the spec before I move on.\n\nThe page: [name it]\nWhat I built: [paste the code, or attach screenshots at phone and desktop width]\n\nThe spec for it:\n[paste the relevant parts of blueprint.md, copy.md and design-system.md]\n\nList every place the page differs from the spec, most noticeable first. For each one, say whether to fix the page or update the spec, and give me the prompt or the change that fixes it. Then tell me anything that matches the spec but still looks or reads wrong.\n\nStop there. Do not suggest next steps or offer to do more. I am following a set process and the next step has its own prompt."
    },
    {
      "title": "Fix something that looks off",
      "description": "Use this when part of a page looks wrong and you cannot say why. It returns the exact change to make.",
      "prompt": "One part of my agency website does not look right and I cannot say why.\n\nThe part: [for example the case study cards on the Work page]\nWhat I see: [describe it, or attach a screenshot]\nMy design system:\n[paste design-system.md]\n\nTell me what is off, in designer's terms and then in plain words: spacing, alignment, size, contrast or rhythm. Give me the exact change to make, using the tokens from my design system and no new values.\n\nStop there. Do not suggest next steps or offer to do more. I am following a set process and the next step has its own prompt."
    }
  ],
  "placeholders": [
    {
      "token": "[paste the relevant parts of blueprint.md, copy.md and design-system.md]",
      "tip": "Only the sections of each file that describe this page. Pasting all three whole files buries the part that matters.",
      "options": ["(the sections of each file that are about this page)"]
    },
    {
      "token": "[for example the case study cards on the Work page]",
      "label": "The part",
      "tip": "Name the one part that looks wrong, and the page it is on.",
      "options": ["The project entries on the Work page", "The header on a phone"]
    }
  ]
}$json$),

-- Step 8: Launch --------------------------------------------------------------
(8, 'text', 'Audit the site you built%', $json${
  "kind": "text",
  "body": "Check the site you built, not the plan for it. A spec cannot be slow, and a live page can.\n\n1. Put the site on a preview link from your host.\n2. Open pagespeed.web.dev, paste in the link, and run it for the home page. Keep the results.\n3. Send a real enquiry through the form from your phone. Then send one with a wrong email address.\n4. Go through every page using only the Tab and Enter keys."
}$json$),

(8, 'prompt', 'Pick a prompt%', $json${
  "kind": "prompt",
  "label": "Pick a prompt and paste it into your AI tool",
  "prompt": "Check a small agency website before it goes live. Work from the evidence below. Where you cannot check something from what I have given you, do not guess. Add it to a list of things I must test by hand, with the steps.\n\nThe preview link: [paste it]\nPageSpeed Insights results for the home page: [paste them]\nHow it is built and hosted: [tool or framework, and host]\nWhat happened when I tested the form: [describe it]\nThe code, if I have it: [paste the main files, or say the tool hides it]\n\nCheck:\n- Speed: the PageSpeed performance score, and the one change that would raise it most.\n- Accessibility: text contrast, keyboard use, and labels and error messages on the form.\n- Search: a unique title and description on every page, one h1, and nothing blocking search engines by mistake.\n- The form: the enquiry arrives, and the fields are checked on the server.\n- Phone: tap targets, text size, no sideways scrolling.\n- Content: no placeholder text, no [NEEDED] or [ASSUMED] markers, no broken links, a real privacy page.\n\nGive me at most ten findings. For each: how serious it is (critical, high, medium or low), exactly where it is, what is wrong, and the fix. Put them in the order I should fix them. Critical means I should not launch until it is done.\n\nStop there. Do not suggest next steps or offer to do more. I am following a set process and the next step has its own prompt.",
  "prompts": [
    {
      "title": "Check before launch",
      "description": "Start here, with the site on a preview link. It returns at most ten findings, in the order to fix them.",
      "prompt": "Check a small agency website before it goes live. Work from the evidence below. Where you cannot check something from what I have given you, do not guess. Add it to a list of things I must test by hand, with the steps.\n\nThe preview link: [paste it]\nPageSpeed Insights results for the home page: [paste them]\nHow it is built and hosted: [tool or framework, and host]\nWhat happened when I tested the form: [describe it]\nThe code, if I have it: [paste the main files, or say the tool hides it]\n\nCheck:\n- Speed: the PageSpeed performance score, and the one change that would raise it most.\n- Accessibility: text contrast, keyboard use, and labels and error messages on the form.\n- Search: a unique title and description on every page, one h1, and nothing blocking search engines by mistake.\n- The form: the enquiry arrives, and the fields are checked on the server.\n- Phone: tap targets, text size, no sideways scrolling.\n- Content: no placeholder text, no [NEEDED] or [ASSUMED] markers, no broken links, a real privacy page.\n\nGive me at most ten findings. For each: how serious it is (critical, high, medium or low), exactly where it is, what is wrong, and the fix. Put them in the order I should fix them. Critical means I should not launch until it is done.\n\nStop there. Do not suggest next steps or offer to do more. I am following a set process and the next step has its own prompt."
    },
    {
      "title": "Fix a finding",
      "description": "Run this once for each finding you decide to fix, critical and high first.",
      "prompt": "My pre-launch audit found this problem on my agency website:\n\n[paste the finding]\n\nHow the site is built: [tool or framework]\nThe part of the code or page involved: [paste it or describe it]\n\nExplain what is wrong in plain words, give me the exact change, and tell me how to check that it worked.\n\nStop there. Do not suggest next steps or offer to do more. I am following a set process and the next step has its own prompt."
    }
  ],
  "placeholders": [
    {
      "token": "[paste them]",
      "tip": "Run the home page through pagespeed.web.dev and paste the four scores, phone results first.",
      "options": ["Phone: Performance 71, Accessibility 96, Best Practices 100, SEO 92. Desktop: Performance 94, Accessibility 96, Best Practices 100, SEO 92."]
    }
  ]
}$json$);

do $$
declare
  w_steps jsonb;
  step jsonb;
  step_no int := 0;
  block jsonb;
  variant jsonb;
  blanks text;
  new_blocks jsonb;
  new_steps jsonb := '[]'::jsonb;
  standard constant jsonb := '{"depth": ["standard"]}'::jsonb;
begin
  select steps into w_steps from wizards where slug = 'build-an-agency-website';
  if w_steps is null then
    return;
  end if;

  for step in
    select s.val from jsonb_array_elements(w_steps) with ordinality as s(val, ord) order by s.ord
  loop
    step_no := step_no + 1;

    -- Steps 5 and 6, Behaviour and Forms and content, are Standard only.
    if step_no in (5, 6) then
      step := jsonb_set(step, '{when}', standard);
    end if;

    -- The step 1 advice that contradicted "start each step in a new chat".
    step := replace(step::text,
      'Keep the whole thing in one project or one long chat, in Claude or whichever AI tool you prefer.',
      'Use one AI tool all the way through, Claude or whichever you prefer, and start a new chat for each step. Each prompt carries your files with it, so nothing is lost, and short chats give better answers than one long one.'
    )::jsonb;

    if exists (
      select 1 from jsonb_array_elements(step->'blocks') as b(val)
      where b.val->'when'->'depth' ? 'basic'
    ) then
      new_steps := new_steps || jsonb_build_array(step);
      continue;
    end if;

    new_blocks := '[]'::jsonb;
    for block in
      select b.val from jsonb_array_elements(step->'blocks') with ordinality as b(val, ord) order by b.ord
    loop
      select v.basic into variant
      from _basic v
      where v.step = step_no
        and v.kind = block->>'kind'
        and coalesce(block->>'label', block->>'body', '') like v.pattern
        -- The follow-ups are a prompt block too, and are shared by every depth.
        and coalesce(block->>'label', '') <> 'After the AI answers'
      limit 1;

      if variant is null then
        new_blocks := new_blocks || jsonb_build_array(block);
        continue;
      end if;

      if variant->>'kind' = 'prompt' then
        -- Inherit the Standard block's hints for the blanks both use; a hint
        -- written on the Basic block wins.
        select string_agg(version, E'\n') into blanks from (
          select variant->>'prompt' as version
          union all
          select option->>'prompt' from jsonb_array_elements(coalesce(variant->'prompts', '[]'::jsonb)) as option
        ) versions;

        variant := jsonb_set(variant, '{placeholders}', coalesce((
          select jsonb_agg(hint order by rank, ord)
          from (
            select own.val as hint, 0 as rank, own.ord
            from jsonb_array_elements(coalesce(variant->'placeholders', '[]'::jsonb)) with ordinality as own(val, ord)
            union all
            select inherited.val, 1, inherited.ord
            from jsonb_array_elements(coalesce(block->'placeholders', '[]'::jsonb)) with ordinality as inherited(val, ord)
            where position(inherited.val->>'token' in blanks) > 0
              and (inherited.val->>'label' is null
                   or position((inherited.val->>'label') || ': ' || (inherited.val->>'token') in blanks) > 0)
              and not exists (
                select 1 from jsonb_array_elements(coalesce(variant->'placeholders', '[]'::jsonb)) as own(val)
                where own.val->>'token' = inherited.val->>'token'
                  and coalesce(own.val->>'label', '') = coalesce(inherited.val->>'label', '')
              )
          ) hints
        ), '[]'::jsonb));
      end if;

      new_blocks := new_blocks
        || jsonb_build_array(jsonb_set(block, '{when}', standard))
        || jsonb_build_array(jsonb_set(variant, '{when}', '{"depth": ["basic"]}'::jsonb));
    end loop;

    new_steps := new_steps || jsonb_build_array(jsonb_set(step, '{blocks}', new_blocks));
  end loop;

  update wizards set steps = new_steps, updated_at = now() where slug = 'build-an-agency-website';
end;
$$;

-- Every variant found its block, every Basic blank has a hint, every Basic
-- prompt version has its line, and no task id is used twice.
do $$
declare
  problem text;
  placed int;
begin
  select count(*) into placed
  from wizards w,
    jsonb_array_elements(w.steps) as step(val),
    jsonb_array_elements(step.val->'blocks') as block(val)
  where w.slug = 'build-an-agency-website' and block.val->'when'->'depth' ? 'basic';
  if placed <> (select count(*) from _basic) then
    raise exception 'Placed % Basic blocks, expected %', placed, (select count(*) from _basic);
  end if;

  with basic_prompts as (
    select block.val as block
    from wizards w,
      jsonb_array_elements(w.steps) as step(val),
      jsonb_array_elements(step.val->'blocks') as block(val)
    where w.slug = 'build-an-agency-website'
      and block.val->>'kind' = 'prompt'
      and block.val->'when'->'depth' ? 'basic'
  ), versions as (
    select block, block->>'prompt' as txt from basic_prompts
    union all
    select block, option->>'prompt'
    from basic_prompts, jsonb_array_elements(coalesce(block->'prompts', '[]'::jsonb)) as option
  ), blanks as (
    select distinct block, hit[1] as token
    from versions, regexp_matches(txt, '(\[[^\[\]\n]+\])', 'g') as hit
  )
  select string_agg(distinct token, '; ')
  into problem
  from blanks
  where token !~ '^\[(NEEDED|NEEDED: what|ASSUMED)\]$'
    and not exists (
      select 1 from jsonb_array_elements(block->'placeholders') as hint
      where hint->>'token' = token
    );
  if problem is not null then
    raise exception 'Basic blanks with no hint: %', problem;
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

drop table _basic;
