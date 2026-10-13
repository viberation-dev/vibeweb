-- Complete, for "Build an agency website".
--
-- The third depth from Ali's 2026-10-13 request (he named it Complete on
-- 2026-10-14; the stored value is `full`). Rules: docs/walkthrough-rules.md 7.
--
-- Complete is Standard plus two steps and two changed prompts:
--
--   Research  a new first step. Compare the agencies you lose work to, from
--             text the reader pastes in (an AI tool will invent what is on a
--             competitor's site if asked), talk to three past clients, and
--             write both up as research.md.
--   Brief     the same prompt, now written from research.md, with one more
--             answer: what the site has to achieve in six months.
--   Copy      the same prompt, but every gap is listed. Standard caps the
--             Before launch list at eight and lets the AI's defaults stand;
--             Complete asks the reader to confirm those too.
--   Review    a new step before Launch: draft legal pages, a measurement
--             plan, an accessibility pass by hand, and a proofread of the
--             built pages.
--
-- Everything else Complete shares with Standard, so every block tagged
-- Standard becomes Standard and Complete. The two changed prompts are derived
-- from the Standard ones by text replacement, not retyped, so a later fix to
-- the Standard wording is one edit away from both.
--
-- With a step added at the front, "step 1" no longer means the same thing at
-- every depth. The few places that named a step by number now name it.
--
-- Safe to run twice: it does nothing if the Research step is already there.

create function pg_temp.fill(t text) returns text language sql immutable as $$
  select replace(replace(replace(t,
    '{STOP}', 'Stop there. Do not suggest next steps or offer to do more. I am following a set process and the next step has its own prompt.'),
    '{FORMAT}', 'Put the whole answer in Markdown inside a single code block I can copy, fenced with four backticks so any code inside it survives. Do not create a file to download.'),
    '{CHECK}', 'Before you write anything, check my answers above. If one reads like a stock example, or does not fit the business I described, list it first under the heading Check these and say why in a few words. Then carry on, and mark anything you build on those answers [ASSUMED].')
$$;

create temporary table _new_steps (key text primary key, step jsonb not null);

insert into _new_steps (key, step) values
('research', pg_temp.fill($json${
  "key": "research",
  "title": "Research",
  "intro": "Look at who you are up against, and listen to how buyers talk, before you write a word about yourself.",
  "when": {"depth": ["full"]},
  "blocks": [
    {
      "kind": "text",
      "body": "Most agency sites are written from the inside: what the agency wants to say. The ones that win work are written from the outside: what a buyer is comparing, and the words they use for their own problem.\n\nThis step gets you both. You look at the two or three agencies you actually lose work to, and you ask a few past clients a handful of questions. The result is one file, research.md, and the brief in the next step is written from it."
    },
    {
      "kind": "callout",
      "tone": "warning",
      "body": "Paste the competitors' words in yourself. An AI tool asked what is on another company's website will often answer from memory, and get it wrong with complete confidence. The first prompt tells it to work only from what you paste."
    },
    {
      "kind": "prompt",
      "label": "Pick a prompt and paste it into your AI tool",
      "prompt": "I run an agency and I am about to rebuild its website. Compare us with the agencies we lose work to. Work only from the text I paste below. Do not use anything you think you know about these companies, and if something is not in the text, say it is not there.\n\nUs: [name, what it does, where it is based]\n\nCompetitor one, the text of their home page:\n[paste the text from their home page]\n\nCompetitor two, the text of their home page:\n[paste the text from their home page]\n\nCompetitor three, if there is one:\n[paste the text, or write none]\n\nFor each competitor tell me: who they say they are for, what they promise, what proof they show, what they ask a visitor to do, and the three words or phrases they lean on most.\n\nThen tell me what all of them say that a buyer will have stopped noticing, and two or three things none of them says that we could honestly claim. Beside each of those, say what I would need to be able to prove.\n\n{CHECK}\n\n{STOP}",
      "prompts": [
        {
          "title": "Compare the competition",
          "description": "Start here. Open each competitor's home page, copy the words and paste them in. It returns a comparison and the gaps you could own. Keep the reply: you paste it into Sum it up.",
          "prompt": "I run an agency and I am about to rebuild its website. Compare us with the agencies we lose work to. Work only from the text I paste below. Do not use anything you think you know about these companies, and if something is not in the text, say it is not there.\n\nUs: [name, what it does, where it is based]\n\nCompetitor one, the text of their home page:\n[paste the text from their home page]\n\nCompetitor two, the text of their home page:\n[paste the text from their home page]\n\nCompetitor three, if there is one:\n[paste the text, or write none]\n\nFor each competitor tell me: who they say they are for, what they promise, what proof they show, what they ask a visitor to do, and the three words or phrases they lean on most.\n\nThen tell me what all of them say that a buyer will have stopped noticing, and two or three things none of them says that we could honestly claim. Beside each of those, say what I would need to be able to prove.\n\n{CHECK}\n\n{STOP}"
        },
        {
          "title": "Plan the client conversations",
          "description": "Run this next. It returns a short message to send to past clients and six questions to ask them. The conversations are yours to have: fifteen minutes each, by phone.",
          "prompt": "I want to talk to a few past clients before I rebuild my agency's website, to learn how buyers choose.\n\nWhat we do: [name, what it does, where it is based]\nWho I can ask: [three past clients, and what we did for each]\n\nWrite two things.\n\n1. A short message asking for fifteen minutes by phone. Plain and friendly. Make it clear I am not selling anything.\n\n2. Six questions to ask, in order. I want to find out: what was going wrong when they started looking, where they looked, who else they considered, what nearly stopped them choosing us, what they would tell a friend we are good at, and the words they would type into a search to find someone like us. Ask about what they did, not what they think in general.\n\n{STOP}"
        },
        {
          "title": "Sum it up",
          "description": "Run this last, with the comparison and your notes from the calls. It returns research.md, which the brief in the next step is written from.",
          "prompt": "Turn my research into one page I can write a website brief from.\n\nThe comparison of competitors:\n[paste the comparison]\n\nMy notes from talking to past clients:\n[paste your notes, as rough as they are]\n\nWrite it under these headings: Who we are really compared with, What buyers were stuck on, The words buyers use, What every competitor says, What we could own, What I still do not know.\n\nQuote the clients' own words where I gave them to you, and do not tidy them into marketing language. Do not add a finding that is not in what I pasted. If I pasted no notes from calls, say so under What I still do not know and carry on.\n\n{FORMAT}\n\n{STOP}"
        }
      ],
      "placeholders": [
        {
          "token": "[name, what it does, where it is based]",
          "tip": "Three facts in one line: the name, what it sells and to whom, and where it is.",
          "options": ["Northlight Studio. Brand and web design for independent food and drink businesses. Leeds, UK.", "Kiln and Co. Paid social and email for outdoor clothing brands. Remote, mostly Manchester.", "Rahman Digital. Websites and booking systems for private dental clinics. Karachi."]
        },
        {
          "token": "[paste the text from their home page]",
          "tip": "Open their home page, select everything, copy and paste. Menus and footers can stay in; the AI ignores them.",
          "options": ["(everything on their home page, copied from your browser)"]
        },
        {
          "token": "[paste the text, or write none]",
          "tip": "A third competitor's home page, if you have a third. Two is enough: write none.",
          "options": ["none", "(everything on their home page, copied from your browser)"]
        },
        {
          "token": "[three past clients, and what we did for each]",
          "label": "Who I can ask",
          "tip": "Clients who would take your call, and a few words on the work, so the questions can fit them.",
          "options": ["Fettle Coffee: identity, packaging and online shop. Holme Valley Dairy: rebrand. Brook Street Bakery: website only.", "Only two so far: a dental clinic and a physio practice, both websites with booking."]
        },
        {
          "token": "[paste the comparison]",
          "tip": "The whole reply you got from Compare the competition.",
          "options": ["(the full reply from the first prompt)"]
        },
        {
          "token": "[paste your notes, as rough as they are]",
          "tip": "What each client said, in their words where you caught them. Half sentences are fine. If you have not made the calls yet, write none yet.",
          "options": ["Asha, Fettle: \"we looked like a hobby\". Found us through a friend. Nearly went with a cheaper freelancer. Would search for a coffee brand designer.", "None yet."]
        }
      ]
    },
    {
      "kind": "text",
      "body": "After the AI answers\n\nWhat you should have now: research.md, one page under six headings, from Sum it up. The first two prompts give you working material, not a file to keep.\n\nThe heading that matters most is the last one, What I still do not know. It is allowed to be long. A short honest page is worth more to the brief than a long confident one, and you can come back to this step when the calls are done.\n\nTo save it: use the copy button on the code block, paste into a new plain text file, and save that in your spec folder as research.md. Notepad on Windows works. So does TextEdit on a Mac, once you choose Format, then Make Plain Text. So does any code editor.\n\nIf the reply is not in a code block, or your AI tool offers a file to download and then says you have run out of something, use Wrap it up below.\n\nTo change anything, use one of the four prompts below, in the same chat. Most people need one, and often none.\n\nSave it and go to the next step, in a new chat."
    },
    {"kind": "followups"},
    {
      "kind": "checklist",
      "tasks": [
        {"id": "agency-research-competitors", "label": "Pasted in the home pages of the agencies I lose work to", "help": "Two is enough, three is better. Copy the words from each page yourself. Do not ask the AI what the page says."},
        {"id": "agency-research-calls", "label": "Spoke to at least two past clients", "help": "Fifteen minutes each, by phone or in person. Write down what they say in their own words, including the parts that are uncomfortable to hear."},
        {"id": "agency-research-saved", "label": "Saved the summary as research.md"}
      ]
    }
  ]
}$json$)::jsonb),

('review', pg_temp.fill($json${
  "key": "review",
  "title": "Review",
  "intro": "The pages a site needs and nobody enjoys writing, and a way to know whether the site is working.",
  "when": {"depth": ["full"]},
  "blocks": [
    {
      "kind": "text",
      "body": "The audit in the next step checks that the site works. This step makes sure nothing is missing for it to find: the legal pages, a way to count enquiries, a pass through every page as someone who cannot use a mouse, and a last read of the words as they were actually built.\n\nNone of this shows on launch day. All of it is the difference between a site that looks finished and one that is."
    },
    {
      "kind": "callout",
      "tone": "warning",
      "body": "The legal pages this step produces are drafts. An AI tool does not know the law where you trade, or how your business really handles people's data. Have someone qualified read them before they go live."
    },
    {
      "kind": "prompt",
      "label": "Pick a prompt and paste it into your AI tool",
      "prompt": "Draft the legal pages for an agency website. These are drafts for a qualified person to check. Where the law of my country decides something, do not guess: write [NEEDED: what] and say what to ask.\n\nThe business: [legal name, what kind of company, country]\nWhat the site collects, and where it goes:\n[paste data.md]\nOther tools the site loads: [analytics, fonts, video, chat, or none]\nHow we work with clients: [how a project is agreed, paid for and cancelled]\n\nWrite three things: a privacy policy, terms of service for our website projects, and a cookie notice only if the tools above need one. Say plainly if they do not.\n\nUse plain words and short sentences. After each page, list what a qualified person must confirm before it is published.\n\n{FORMAT}\n\n{STOP}",
      "prompts": [
        {
          "title": "Draft the legal pages",
          "description": "Start here. It returns drafts of the privacy policy, the terms and, if you need one, a cookie notice. Save the result as legal.md, then send it to someone qualified to check.",
          "prompt": "Draft the legal pages for an agency website. These are drafts for a qualified person to check. Where the law of my country decides something, do not guess: write [NEEDED: what] and say what to ask.\n\nThe business: [legal name, what kind of company, country]\nWhat the site collects, and where it goes:\n[paste data.md]\nOther tools the site loads: [analytics, fonts, video, chat, or none]\nHow we work with clients: [how a project is agreed, paid for and cancelled]\n\nWrite three things: a privacy policy, terms of service for our website projects, and a cookie notice only if the tools above need one. Say plainly if they do not.\n\nUse plain words and short sentences. After each page, list what a qualified person must confirm before it is published.\n\n{FORMAT}\n\n{STOP}"
        },
        {
          "title": "Plan the measurement",
          "description": "Run this to decide what the site should count, and how. It returns a short plan with the exact steps for your tools. Save the result as measurement.md.",
          "prompt": "Plan how I will know whether my agency's new website is working. Keep it small enough that I will actually look at it.\n\nWhat the site is for:\n[paste brief.md]\nHow it is built and hosted: [tool or framework, and host]\nWhat I use for analytics today: [a tool, or nothing]\n\nGive me: the one number that matters most and why, up to three others worth a glance each month, how to count a sent enquiry as a goal in my setup with the exact steps, how to register the site with Google Search Console, and what to check one week and one month after launch.\n\nIf what I use for analytics sets cookies that need consent where my visitors are, say so, and name one option that does not.\n\n{FORMAT}\n\n{STOP}"
        },
        {
          "title": "Run an accessibility pass",
          "description": "Run this with the site on a preview link. It returns checks to do by hand, page by page, not a file. Do them, then take whatever failed to Fix a finding in the Launch step.",
          "prompt": "Give me an accessibility check I can do by hand on my agency's website, without special software. I will do the checking. You tell me exactly what to do and what counts as a pass.\n\nThe pages:\n[paste the site map from blueprint.md]\nHow it is built: [tool or framework]\n\nFor each page, give me a short list of checks: with the keyboard only, with the page zoomed to 200 percent, with a screen reader for two minutes, and with the phone held sideways. For each check say what to press or do, what should happen, and what a failure looks like.\n\nThen give me a table I can fill in: page, check, pass or fail, note.\n\n{STOP}"
        },
        {
          "title": "Proofread like a stranger",
          "description": "Run this last, on the words as they appear on the built site. It returns a list of errors and inconsistencies, not a rewrite. Fix them in the build, and in copy.md too.",
          "prompt": "Proofread my agency's website as a careful stranger would. Do not rewrite it and do not improve the style.\n\nThe words, copied from the built pages:\n[paste the text of each page]\n\nList: spelling and grammar errors; names, prices, dates or numbers that differ from one page to another; anything still marked [NEEDED] or [ASSUMED]; links or buttons whose words do not say where they go; and sentences a first-time visitor would not understand. For each one, quote the words and say which page.\n\n{STOP}"
        }
      ],
      "placeholders": [
        {
          "token": "[legal name, what kind of company, country]",
          "label": "The business",
          "tip": "The name on your invoices, the kind of company it is, and the country it is registered in.",
          "options": ["Northlight Studio Ltd, a private limited company, England.", "I trade under my own name as a sole trader, in Pakistan."]
        },
        {
          "token": "[paste data.md]",
          "tip": "Your latest saved data.md, pasted in full. Not a summary, and not an earlier draft.",
          "options": ["(everything in your data.md, first line to last)"]
        },
        {
          "token": "[analytics, fonts, video, chat, or none]",
          "label": "Other tools the site loads",
          "tip": "Anything on the site that comes from another company. These are what decide whether you need a cookie notice.",
          "options": ["Plausible for analytics, fonts from Google, one YouTube video.", "None."]
        },
        {
          "token": "[how a project is agreed, paid for and cancelled]",
          "label": "How we work with clients",
          "tip": "What actually happens today, in a sentence or two. The terms should describe your real practice, not an ideal one.",
          "options": ["A signed proposal, half paid up front and half on launch. Either side can cancel with two weeks' notice, and work already done is paid for.", "Nothing formal yet. We agree by email and invoice at the end."]
        },
        {
          "token": "[paste brief.md]",
          "tip": "Your latest saved brief.md, pasted in full. Not a summary, and not an earlier draft.",
          "options": ["(everything in your brief.md, first line to last)"]
        },
        {
          "token": "[tool or framework, and host]",
          "label": "How it is built and hosted",
          "tip": "What the site is built with, and where it is hosted.",
          "options": ["Next.js with Claude Code, hosted on Vercel", "Built and hosted on Framer"]
        },
        {
          "token": "[a tool, or nothing]",
          "label": "What I use for analytics today",
          "tip": "The analytics tool on your current site, if there is one.",
          "options": ["Nothing", "Google Analytics", "Plausible"]
        },
        {
          "token": "[paste the site map from blueprint.md]",
          "tip": "Only the site map part of your latest blueprint.md: the list of pages and their addresses.",
          "options": ["(the site map section of blueprint.md)"]
        },
        {
          "token": "[tool or framework]",
          "tip": "What you are building the site with. Name the app builder, or the framework and the AI tool.",
          "options": ["Next.js, with Claude Code", "Lovable", "Framer"]
        },
        {
          "token": "[paste the text of each page]",
          "tip": "Open each page of the built site, select all, copy and paste, with the page's name on a line above it.",
          "options": ["(the visible text of every page, each under its page name)"]
        }
      ]
    },
    {
      "kind": "callout",
      "tone": "tip",
      "body": "After the AI answers\n\nFix what this step finds before you run the audit in the next one. The audit is quicker, and worth more, when it is checking a site you believe is finished. The legal pages are the exception: they are finished when a qualified person has read them, not when the draft looks right to you."
    },
    {
      "kind": "checklist",
      "tasks": [
        {"id": "agency-review-legal", "label": "Legal pages drafted, and read by someone qualified", "help": "Saved as legal.md, then sent to a lawyer or an adviser who knows the law where you trade. Write down who read them and when."},
        {"id": "agency-review-measure", "label": "A sent enquiry is counted as a goal", "help": "Send a test enquiry and watch it appear in your analytics tool. If it does not appear there, it is not being counted."},
        {"id": "agency-review-keyboard", "label": "Went through every page with the keyboard only", "help": "Tab, Shift and Tab, Enter and Escape. You can reach everything, you can always see where you are, and nothing traps you."},
        {"id": "agency-review-proof", "label": "Proofread the built pages, not the copy file", "help": "The words on the built pages, copied from the browser. They drift away from copy.md during the build."}
      ]
    }
  ]
}$json$)::jsonb);

do $$
declare
  w_steps jsonb;
  step jsonb;
  block jsonb;
  variant jsonb;
  followups jsonb;
  new_blocks jsonb;
  new_steps jsonb := '[]'::jsonb;
  research jsonb;
  standard constant jsonb := '{"depth": ["standard"]}'::jsonb;
  complete constant jsonb := '{"depth": ["full"]}'::jsonb;
begin
  select steps into w_steps from wizards where slug = 'build-an-agency-website';
  if w_steps is null
     or exists (select 1 from jsonb_array_elements(w_steps) as s(val) where s.val->>'key' = 'research') then
    return;
  end if;

  for step in
    select s.val from jsonb_array_elements(w_steps) with ordinality as s(val, ord) order by s.ord
  loop
    -- Everything Standard has, Complete has too. The two prompts that differ
    -- are put back to Standard only, just below.
    step := replace(step::text, '"depth": ["standard"]', '"depth": ["standard", "full"]')::jsonb;

    -- Wording that named a step by number, which now depends on the depth.
    step := replace(replace(step::text,
      'a brief changed in step 4 means doing steps 2 and 3 again',
      'a brief changed after the design is done means doing the blueprint and the copy again'),
      'The one person the team agreed on in step 1.',
      'The one person the team agreed on at the start.'
    )::jsonb;

    if step->>'key' = 'brief' then
      -- The research step's follow-ups are the brief's, with the file renamed.
      select replace(replace(b.val::text, 'brief.md', 'research.md'), ' brief', ' research summary')::jsonb
      into followups
      from jsonb_array_elements(step->'blocks') as b(val)
      where b.val->>'label' = 'After the AI answers'
      limit 1;
    end if;

    if step->>'key' in ('brief', 'copy') then
      new_blocks := '[]'::jsonb;
      for block in
        select b.val from jsonb_array_elements(step->'blocks') with ordinality as b(val, ord) order by b.ord
      loop
        if block->>'kind' = 'prompt'
           and block->>'label' like 'Pick a prompt%'
           and block->'when'->'depth' ? 'standard' then

          if step->>'key' = 'brief' then
            variant := replace(replace(replace(replace(block::text,
              'mark anything you had to assume with [ASSUMED] so I can correct it.\n\n',
              'mark anything you had to assume with [ASSUMED] so I can correct it.\n\nHere is what I learned from looking at competitors and talking to past clients:\n\n[paste research.md]\n\n'),
              'Deadline and anything fixed: [existing logo, colours, domain, platform]',
              'Deadline and anything fixed: [existing logo, colours, domain, platform]\nWhat the site has to achieve in six months: [a result you could count]'),
              'Constraints, Out of scope for version one.',
              'Constraints, Success measure, Out of scope for version one.'),
              'Keep it under 400 words.',
              'Keep it under 500 words. Where my answers disagree with the research, say so.'
            )::jsonb;
            variant := jsonb_set(variant, '{placeholders}', variant->'placeholders' || $json$[
              {
                "token": "[paste research.md]",
                "tip": "Your latest saved research.md, pasted in full. Not a summary, and not an earlier draft.",
                "options": ["(everything in your research.md, first line to last)"]
              },
              {
                "token": "[a result you could count]",
                "label": "What the site has to achieve in six months",
                "tip": "One outcome you could check on a given date. It decides what the site is measured against later.",
                "options": ["Ten enquiries a month from food and drink brands.", "Two new clients we would not have met otherwise.", "Not sure yet."]
              }
            ]$json$::jsonb);
            if position('[paste research.md]' in variant->>'prompt') = 0
               or position('Success measure' in variant->>'prompt') = 0
               or position('[a result you could count]' in variant->>'prompt') = 0 then
              raise exception 'The Complete brief prompt did not take every edit';
            end if;
          else
            variant := replace(replace(block::text,
              'choose a sensible default, write it, and mark it [ASSUMED] so I can change it.',
              'write your best version, mark it [ASSUMED], and add it to the lists at the end so I can confirm it.'),
              'Put no more than eight items in Before launch, most important first, and say in a few words who could supply each one.',
              'List every item, most important first in each list, and say in a few words who could supply each one.'
            )::jsonb;
            if position('List every item' in variant->'prompts'->0->>'prompt') = 0
               or position('add it to the lists at the end' in variant->'prompts'->0->>'prompt') = 0 then
              raise exception 'The Complete copy prompt did not take every edit';
            end if;
          end if;

          new_blocks := new_blocks
            || jsonb_build_array(jsonb_set(block, '{when}', standard))
            || jsonb_build_array(jsonb_set(variant, '{when}', complete));
        else
          new_blocks := new_blocks || jsonb_build_array(block);
        end if;
      end loop;
      step := jsonb_set(step, '{blocks}', new_blocks);
    end if;

    if step->>'key' = 'launch' then
      new_steps := new_steps || jsonb_build_array((select n.step from _new_steps n where n.key = 'review'));
    end if;
    new_steps := new_steps || jsonb_build_array(step);
  end loop;

  if followups is null then
    raise exception 'Could not find the follow-up prompts to reuse for Research';
  end if;

  -- Drop the follow-ups into the Research step where its placeholder sits.
  select jsonb_set(n.step, '{blocks}', (
    select jsonb_agg(case when b.val->>'kind' = 'followups' then followups else b.val end order by b.ord)
    from jsonb_array_elements(n.step->'blocks') with ordinality as b(val, ord)
  ))
  into research
  from _new_steps n where n.key = 'research';

  update wizards
  set steps = jsonb_build_array(research) || new_steps, updated_at = now()
  where slug = 'build-an-agency-website';
end;
$$;

-- Ten steps, in order; no Standard-only block left by accident; every blank
-- in a Complete prompt hinted; every version described; no id used twice.
do $$
declare
  problem text;
begin
  select string_agg(step.val->>'key', ',' order by step.ord)
  into problem
  from wizards w, jsonb_array_elements(w.steps) with ordinality as step(val, ord)
  where w.slug = 'build-an-agency-website';
  if problem <> 'research,brief,blueprint,copy,design,behaviour,data,build,review,launch' then
    raise exception 'Unexpected steps: %', problem;
  end if;

  -- Exactly two blocks are Standard without Complete: the brief and copy prompts.
  select count(*)::text
  into problem
  from wizards w,
    jsonb_array_elements(w.steps) as step(val),
    jsonb_array_elements(step.val->'blocks') as block(val)
  where w.slug = 'build-an-agency-website'
    and block.val->'when'->'depth' ? 'standard'
    and not block.val->'when'->'depth' ? 'full';
  if problem <> '2' then
    raise exception '% blocks are Standard but not Complete; expected 2', problem;
  end if;

  with complete_prompts as (
    select block.val as block
    from wizards w,
      jsonb_array_elements(w.steps) as step(val),
      jsonb_array_elements(step.val->'blocks') as block(val)
    where w.slug = 'build-an-agency-website'
      and block.val->>'kind' = 'prompt'
      and (step.val->'when'->'depth' ? 'full' or block.val->'when'->'depth' ? 'full')
  ), versions as (
    select block, block->>'prompt' as txt from complete_prompts
    union all
    select block, option->>'prompt'
    from complete_prompts, jsonb_array_elements(coalesce(block->'prompts', '[]'::jsonb)) as option
  ), blanks as (
    select distinct block, hit[1] as token
    from versions, regexp_matches(txt, '(\[[^\[\]\n]+\])', 'g') as hit
  )
  select string_agg(distinct token, '; ')
  into problem
  from blanks
  where token !~ '^\[(NEEDED|NEEDED: what|ASSUMED)\]$'
    and not exists (
      select 1 from jsonb_array_elements(coalesce(block->'placeholders', '[]'::jsonb)) as hint
      where hint->>'token' = token
    );
  if problem is not null then
    raise exception 'Complete blanks with no hint: %', problem;
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

  if exists (
    select 1 from wizards w where w.slug = 'build-an-agency-website'
      and (w.steps::text like '%{STOP}%' or w.steps::text like '%{FORMAT}%'
           or w.steps::text like '%{CHECK}%' or w.steps::text like '%"followups"%')
  ) then
    raise exception 'A template marker was left in the content';
  end if;
end;
$$;

drop table _new_steps;
drop function pg_temp.fill(text);
