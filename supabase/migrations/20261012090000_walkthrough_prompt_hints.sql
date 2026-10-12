-- A hint for every blank in every walkthrough prompt.
--
-- Ali, 2026-10-12: a reader who meets "Tone of voice: [three words]" and does
-- not know what to put has nothing to go on. Each blank now carries a tip
-- (the tooltip) and one or more example answers (the filled-in example), in
-- the `placeholders` array on its prompt block. The rules these follow are in
-- docs/walkthrough-rules.md.
--
-- Written as a glossary and stamped on, rather than as an edit to each of the
-- 21 prompt blocks: the same blank recurs across steps and versions, and the
-- hint for it should not be typed, or drift, twenty times.
--
--   step   null means the hint holds anywhere in the walkthrough
--   label  the words before the blank on its line, set where a reader needs
--          the blank named, or where one token means two things
--
-- One made-up project runs through each walkthrough's first options, so the
-- filled-in examples read as one person's build: a running club's route
-- picker for the two beginner walkthroughs, Northlight Studio for the agency
-- one. Where the honest answer is a long paste, the example says what to
-- paste and where it comes from rather than inventing a file.
--
-- [NEEDED], [NEEDED: what] and [ASSUMED] are not blanks. They are markers
-- the prompts tell the AI to write, so they get no hint and render as text.
--
-- The migration fails if any other blank is left without a hint.

create temporary table _hints (
  ord serial,
  slug text not null,
  step int,
  token text not null,
  label text,
  tip text not null,
  options jsonb not null
);

-- Ship your first web project ------------------------------------------------
insert into _hints (slug, step, token, label, tip, options)
select 'ship-your-first-web-project', v.* from (values
  (null::int, '[Windows, Mac or Linux]', null,
   'The system your computer runs. A PC is usually Windows; an Apple computer is a Mac.',
   '["Windows", "Mac", "Linux"]'::jsonb),
  (null, '[your one-sentence idea]', null,
   'What you decided to build in step 1, in one plain sentence: who it is for and the one thing it does.',
   '["A page where my running club votes on next Sunday''s route.", "A calculator that splits a restaurant bill between friends.", "A one-page site for my sister''s cake business."]'),
  (null, '[Vercel, Netlify or Cloudflare]', null,
   'The host you chose. Name whichever one you signed up to.',
   '["Vercel", "Netlify", "Cloudflare"]'),

  (1, '[a hobby, your job, something that annoys you]', 'Things I care about',
   'Two or three things from your own life. Ordinary is good: the best first projects fix a small problem you actually have.',
   '["Running with my local club, and how long it takes us to agree on a route.", "I work in a cafe and we still write the rota on paper.", "Houseplants. I never remember which ones I have watered."]'),
  (1, '[describe it in one sentence]', null,
   'One sentence: who it is for and the one thing it does.',
   '["A page where my running club votes on next Sunday''s route.", "A calculator that splits a restaurant bill between friends.", "A one-page site for my sister''s cake business."]'),
  (1, '[describe it, as long or messy as you like]', null,
   'Write it the way you would say it to a friend. Do not tidy it up; shrinking it is the prompt''s job.',
   '["My running club argues every week about where to run. I want something where I put in three routes, people tap the one they want, and it shows the winner. Maybe a map later, maybe sign-ups, maybe the weather too."]'),

  (2, '[Node.js or Git]', 'What I was installing',
   'Whichever of the two you were installing when it went wrong.',
   '["Node.js", "Git"]'),
  (2, '[paste it]', 'The command I ran',
   'The exact line you typed into the terminal, copied rather than retyped.',
   '["node -v", "winget install OpenJS.NodeJS.LTS"]'),
  (2, '[paste the full message]', 'What I saw',
   'Everything the terminal printed after your command, first line to last. Do not trim it; the useful part is often in the middle.',
   '["''node'' is not recognized as an internal or external command,\noperable program or batch file.", "zsh: command not found: node"]'),
  (2, '[paste]', 'node -v',
   'Type node -v, press Enter, and paste the line it prints.',
   '["v22.11.0", "command not found: node"]'),
  (2, '[paste]', 'npm -v',
   'Type npm -v, press Enter, and paste the line it prints.',
   '["10.9.0"]'),
  (2, '[paste]', 'git --version',
   'Type git --version, press Enter, and paste the line it prints.',
   '["git version 2.47.0"]'),

  (3, '[paste the command]', 'The command I ran',
   'The exact line you typed, copied from the terminal.',
   '["npx create-next-app@latest route-picker"]'),
  (3, '[paste the full error message]', 'What I saw',
   'Everything it printed, top to bottom. Error text looks like noise, but it is what the AI needs most.',
   '["npm error code EACCES\nnpm error syscall mkdir\nnpm error path /usr/local/lib/node_modules\nnpm error errno -13"]'),

  (4, '[describe it]', 'What I did',
   'The steps you took, in order, in your own words.',
   '["I made a new repository on GitHub called route-picker, then ran the commands GitHub showed me.", "I pressed Publish in GitHub Desktop and picked my account."]'),
  (4, '[paste the commands]', 'What I ran',
   'The commands you typed, in the order you ran them.',
   '["git remote add origin https://github.com/sam-okafor/route-picker.git\ngit push -u origin main"]'),
  (4, '[paste the full message]', 'What I saw',
   'Everything the terminal printed back, first line to last.',
   '["remote: Permission to sam-okafor/route-picker.git denied.\nfatal: unable to access ''https://github.com/sam-okafor/route-picker.git/'': The requested URL returned error: 403"]'),
  (4, '[paste the output of git status]', 'What git status shows',
   'Type git status, press Enter, and paste everything it prints.',
   '["On branch main\nYour branch is up to date with ''origin/main''.\n\nnothing to commit, working tree clean"]'),

  (5, '[paste the red part of the log]', 'Here is the build log',
   'On your host''s failed build page, copy the lines in red plus a few lines above them.',
   '["./app/page.tsx:12:7\nType error: Property ''routes'' does not exist on type ''{}''.\n\nError: Command \"npm run build\" exited with 1"]'),
  (5, '[yes or no]', 'Could it ever make money',
   'Answer honestly. Some hosts do not allow commercial projects on their free plan, so it changes the advice.',
   '["no", "yes"]'),

  (6, '[paste your link]', null,
   'The live address your host gave you, starting with https://.',
   '["https://route-picker.vercel.app"]')
) as v(step, token, label, tip, options);

-- Add a database with Supabase ------------------------------------------------
insert into _hints (slug, step, token, label, tip, options)
select 'add-a-database-with-supabase', v.* from (values
  (null::int, '[your one-sentence idea]', null,
   'What your project is, in one plain sentence: who it is for and the one thing it does.',
   '["A page where my running club votes on next Sunday''s route.", "A calculator that splits a restaurant bill between friends.", "A one-page site for my sister''s cake business."]'::jsonb),
  (null, '[Vercel, Netlify or Cloudflare]', null,
   'Where your site is hosted. Name whichever one you deployed to.',
   '["Vercel", "Netlify", "Cloudflare"]'),

  (1, '[describe it]', 'What it does',
   'What your project does today, in a sentence or two.',
   '["It shows three running routes and lets my club vote on one.", "It is a one-page site for my sister''s cake business, with photos and prices."]'),
  (1, '[for example messages, scores, nothing]', 'What it needs to remember',
   'Anything that should still be there after the page is closed and opened again. If you cannot think of anything, say so; that is a real answer.',
   '["Each person''s vote, so the total survives a refresh.", "Messages people leave in a guestbook.", "Nothing that I can think of."]'),

  (2, '[country or city]', 'Where most of my visitors are',
   'Roughly where the people using your site live. It decides which region to pick, and closer is faster.',
   '["Leeds, UK", "Lahore, Pakistan", "Mostly the United States"]'),
  (2, '[describe it]', 'What I clicked',
   'The buttons you pressed, in order.',
   '["New project, then I typed a name and a database password and pressed Create new project."]'),
  (2, '[paste the message or describe the screen]', 'What I saw',
   'Copy the message if there is one. If there is not, say what the screen shows.',
   '["A red box that says I have reached the limit of free projects.", "The page has said Setting up project for ten minutes."]'),

  (3, '[paste it]', 'The script',
   'The whole SQL script you ran, copied from the SQL Editor.',
   '["create table notes (\n  id bigint generated always as identity primary key,\n  body text not null,\n  created_at timestamptz default now()\n);"]'),
  (3, '[paste the full message]', 'The error',
   'The whole error from the bottom of the SQL Editor, including the code at the start.',
   '["ERROR: 42P07: relation \"notes\" already exists"]'),
  (3, '[paste the SQL script from this step]', null,
   'The script this step gave you, copied in full.',
   '["(the whole script from this step, from create table to the last policy)"]'),
  (3, '[paste the SQL script]', null,
   'The script you just ran, copied in full from the SQL Editor.',
   '["(the whole script from this step, from create table to the last policy)"]'),

  (4, '[for example my notes showing on /guestbook]', 'What I expected',
   'What you thought would happen when you opened the page.',
   '["My notes showing on /guestbook.", "A new note appearing in the list after I press Add."]'),
  (4, '[paste the error from the page or the terminal]', 'What happened',
   'The error text from the browser page, or from the terminal running your project. If there is no error at all, say that.',
   '["The page says: permission denied for table notes", "Nothing. The list is empty and there is no error anywhere."]'),
  (4, '[paste it]', null,
   'Open app/guestbook/page.tsx in your editor, select everything, and paste the whole file.',
   '["(the whole file, from the first import line to the last closing bracket)"]'),
  (4, '[paste app/guestbook/page.tsx]', null,
   'Open app/guestbook/page.tsx in your editor, select everything, and paste the whole file.',
   '["(the whole file, from the first import line to the last closing bracket)"]'),
  (4, '[paste your create table SQL]', null,
   'The create table statement you ran in step 3. It is still in the SQL Editor''s history.',
   '["create table notes (\n  id bigint generated always as identity primary key,\n  body text not null,\n  created_at timestamptz default now()\n);"]'),

  (5, '[describe it or paste the error]', 'What I see on the live site',
   'What the live site shows now, or the error text if there is one.',
   '["The guestbook loads but the list is empty, although it works on my computer.", "Application error: a server-side exception has occurred."]'),
  (5, '[paste the red part]', 'The build log, if it failed',
   'On your host''s failed build page, copy the lines in red. If the build passed, say so.',
   '["Error: supabaseUrl is required.", "It did not fail."]'),
  (5, '[paste your table script, grants and policies]', null,
   'Everything you ran in the SQL Editor for this table: the create table, every grant, and every create policy.',
   '["(your create table script, then each grant line and each create policy statement)"]'),
  (5, '[paste your table script]', null,
   'The SQL you ran to create the table and its security rules.',
   '["(your create table script, then each grant line and each create policy statement)"]')
) as v(step, token, label, tip, options);

-- Build an agency website -----------------------------------------------------
insert into _hints (slug, step, token, label, tip, options)
select 'build-an-agency-website', v.* from (values
  (null::int, '[paste brief.md]', null,
   'The brief.md file you saved earlier in this walkthrough. Paste all of it, not a summary.',
   '["(everything in your brief.md, first line to last)"]'::jsonb),
  (null, '[paste blueprint.md]', null,
   'The blueprint.md file you saved earlier in this walkthrough. Paste all of it.',
   '["(everything in your blueprint.md, first line to last)"]'),
  (null, '[paste copy.md]', null,
   'The copy.md file you saved earlier in this walkthrough. Paste all of it.',
   '["(everything in your copy.md, first line to last)"]'),
  (null, '[paste design-system.md]', null,
   'The design-system.md file you saved earlier in this walkthrough. Paste all of it.',
   '["(everything in your design-system.md, first line to last)"]'),
  (null, '[paste behaviour.md]', null,
   'The behaviour.md file you saved earlier in this walkthrough. Paste all of it.',
   '["(everything in your behaviour.md, first line to last)"]'),
  (null, '[paste data.md]', null,
   'The data.md file you saved earlier in this walkthrough. Paste all of it.',
   '["(everything in your data.md, first line to last)"]'),
  (null, '[tool or framework]', null,
   'What you are building the site with. Name the app builder, or the framework and the AI tool.',
   '["Next.js, with Claude Code", "Lovable", "Framer"]'),

  (1, '[paste their email, their current site address, anything else]', 'What I know so far',
   'Everything the client has sent so far, pasted as it is. A thin answer is fine; the prompt turns it into questions for the call.',
   '["Their email: \"We are Northlight Studio, six people in Leeds doing brand and web design for food and drink companies. Our site is four years old and we are embarrassed to send it to anyone.\" Current site: northlightstudio.example"]'),
  (1, '[name, what it does, where it is based]', 'The agency',
   'Three facts in one line: the name, what it sells and to whom, and where it is.',
   '["Northlight Studio. Brand and web design for independent food and drink businesses. Leeds, UK.", "Kiln and Co. Paid social and email for outdoor clothing brands. Remote, mostly Manchester.", "Rahman Digital. Websites and booking systems for private dental clinics. Karachi."]'),
  (1, '[my own agency, or a client''s]', 'Whose site this is',
   'It changes who has to approve things, so the plan differs.',
   '["My own agency", "A client''s"]'),
  (1, '[who buys, their size, what is going wrong for them when they come looking]', 'Best-fit client',
   'Describe one real client you would happily have ten more of: who they are, how big, and what pushed them to look for help.',
   '["Founders of food and drink brands with 5 to 30 staff. They have outgrown the logo a friend made and are about to pitch a supermarket.", "Marketing managers at outdoor brands turning over 1 to 5 million pounds, whose ad costs have doubled in a year."]'),
  (1, '[list them]', 'Services and rough prices',
   'Each service with a starting price or a range. Rough is fine.',
   '["Brand identity, from 6,000 pounds. Website design and build, from 9,000 pounds. Packaging design, from 4,000 pounds.", "Paid social retainer, 2,500 pounds a month. One-off account audit, 900 pounds."]'),
  (1, '[finished projects, results with numbers, testimonials we have permission to use]', 'Real proof we can show',
   'Only things that are true and that you are allowed to show. If you have little, say so; the prompt plans around it.',
   '["Rebrand for Holme Valley Dairy: stocked in 40 more shops within six months. New shop for Fettle Coffee: online orders up 62 percent. A written quote from Fettle''s founder, cleared to use.", "Three finished projects but no numbers yet. One client has agreed to give a quote."]'),
  (1, '[be honest]', null,
   'The real reason clients pick you, even if it sounds small. A plain true answer beats a grand vague one.',
   '["We only work with food and drink, so we already know packaging rules and how buyers think. We are slower and dearer than a freelancer.", "Not much yet. We answer the phone and we hit deadlines."]'),
  (1, '[three words]', 'Tone of voice',
   'Three adjectives for how the site would sound if it were a person talking.',
   '["Plain, warm, confident", "Dry, precise, expert", "Playful, bold, quick"]'),
  (1, '[book a call, send an enquiry, ask for a quote]', 'The one action a visitor should take',
   'Pick one. Every page will point at it.',
   '["Book a 20-minute call", "Send an enquiry", "Ask for a quote"]'),
  (1, '[existing logo, colours, domain, platform]', 'Deadline and anything fixed',
   'The launch date if there is one, plus anything that has to stay as it is.',
   '["Live by 1 March. Keeping the logo and the domain northlightstudio.example. Everything else can change.", "No deadline. Nothing is fixed."]'),

  (3, '[who]', 'Client and what they do',
   'The client''s name and what they do, in one line.',
   '["Fettle Coffee, a speciality roaster in Sheffield selling online and to cafes."]'),
  (3, '[the problem, in their words if you have them]', 'What they were stuck on',
   'Why they came to you. A sentence the client actually said is worth more than your summary of it.',
   '["\"People loved the coffee at markets but nobody could find us online, and the old site made us look like a hobby.\"", "Their packaging looked the same as two competitors on the shelf."]'),
  (3, '[the work, and how long it took]', 'What we did',
   'What you delivered, and roughly how long it took.',
   '["New identity, packaging for six coffees and a new online shop. Ten weeks."]'),
  (3, '[results, with real numbers only]', 'What changed',
   'Numbers you can stand behind. If you have none yet, say so and do not guess.',
   '["Online orders up 62 percent in the first three months. Two new wholesale accounts.", "Too early for numbers. The site launched last month."]'),
  (3, '[the exact quote, and whether I have permission to use it]', 'What the client said',
   'Their words exactly as they said or wrote them, who said it, and whether they have agreed to it being published.',
   '["\"It finally looks like the coffee tastes.\" Asha Verma, founder. Permission given by email.", "No quote yet."]'),

  (4, '[logo description, colour codes, typefaces, anything from brand guidelines]', 'What the brand already has',
   'Whatever already exists and has to be kept. Colour codes and font names if you know them; a plain description if you do not.',
   '["A black wordmark. Colours #101820 and #F2A900. Headings in Recoleta, body text in Inter.", "Only a logo. No set colours or typefaces."]'),
  (4, '[paste the colours]', null,
   'The colour section of your design-system.md, copied as it is.',
   '["Ink #101820, Paper #FAF7F2, Amber #F2A900, Muted #6B7280"]'),

  (6, '[for example Next.js on Vercel, or an app builder, or not decided]', 'How I am building it',
   'What you are building with and where it will be hosted. Not decided is a fine answer here.',
   '["Next.js on Vercel", "Lovable", "Not decided"]'),
  (6, '[me, the client, both]', 'Who updates the site after launch',
   'Whoever will actually change text and add pages once the site is live.',
   '["Me", "The client", "Both"]'),
  (6, '[me, or the client]', 'Who will add case studies after launch',
   'Whoever will add the next case study once the site is live.',
   '["Me", "The client"]'),
  (6, '[a case study a month, a blog post a week, almost never]', 'How often',
   'A realistic guess at how often the content will change. Almost never is common, and worth saying.',
   '["A case study a month", "A blog post a week", "Almost never"]'),
  (6, '[describe]', 'How comfortable they are with tools',
   'What the person updating the site already uses without help.',
   '["Happy in Google Docs and Instagram. Has never seen code.", "Used WordPress for years and is comfortable with a dashboard."]'),

  (7, '[name the tool]', null,
   'The tool you are building with, by name.',
   '["Claude Code", "Lovable", "Cursor"]'),
  (7, '[name it]', 'The page',
   'The one page you have just built.',
   '["The home page", "The Fettle Coffee case study"]'),
  (7, '[paste the relevant parts of blueprint.md, copy.md, design-system.md and behaviour.md]', null,
   'Only the sections of each file that describe this page. Pasting all four whole files buries the part that matters.',
   '["(the sections of each file that are about this page)"]'),
  (7, '[paste the code, or attach screenshots at phone and desktop width]', 'What I built',
   'The page''s code if you can see it. If your tool hides the code, attach two screenshots instead.',
   '["(the page''s code)", "(two screenshots: one at phone width, one at desktop width)"]'),
  (7, '[for example the case study cards on the Work page]', 'The part',
   'Name the one part that looks wrong, and the page it is on.',
   '["The case study cards on the Work page", "The header on a phone"]'),
  (7, '[describe it, or attach a screenshot]', 'What I see',
   'What looks wrong, as plainly as you can put it. A screenshot helps if your AI tool takes images.',
   '["The cards are different heights and the photos look squashed.", "The menu covers the logo when I open it."]'),

  (8, '[paste it]', 'The preview link',
   'The address of the preview version of the site, starting with https://.',
   '["https://northlight-preview.vercel.app"]'),
  (8, '[paste them]', null,
   'Run both pages through pagespeed.web.dev and paste the four scores for each, phone results first.',
   '["Home, phone: Performance 71, Accessibility 96, Best Practices 100, SEO 92. Case study, phone: Performance 64, Accessibility 94, Best Practices 100, SEO 92."]'),
  (8, '[paste the finding]', null,
   'One finding from your audit, copied as the audit worded it.',
   '["Images on the Work page have no alt text.", "The enquiry form can be submitted empty."]'),
  (8, '[paste it or describe it]', 'The part of the code or page involved',
   'The piece of the site the finding is about. Paste its code if you have it, or name it.',
   '["The case study cards on the Work page.", "The enquiry form on the Contact page."]'),
  (8, '[paste the main files, or say the tool hides it]', 'The code, if I have it',
   'The files that make up the page. If your app builder does not show code, say so.',
   '["The tool hides it.", "(the page file and the components it uses)"]'),
  (8, '[describe it]', 'What happened when I tested the form',
   'Send yourself a real test enquiry, then say exactly what happened.',
   '["The page said thank you, but no email arrived.", "It works. The email arrived within a minute."]'),
  (8, '[tool or framework, and host]', 'How it is built and hosted',
   'What the site is built with, and where it is hosted.',
   '["Next.js with Claude Code, hosted on Vercel", "Built and hosted on Framer"]'),
  (8, '[details]', 'How it is built and hosted',
   'What the site is built with, and where it is hosted.',
   '["Next.js with Claude Code, hosted on Vercel", "Built and hosted on Framer"]'),
  (8, '[domain, hosting, email service, content system, analytics]', 'The accounts involved',
   'Every account the site depends on, and who it is with. These are what the client must own after handover.',
   '["Domain at Namecheap, hosting on Vercel, enquiry emails through Resend, case studies in Sanity, Plausible for analytics."]'),
  (8, '[for example add case studies]', 'What the client will do themselves',
   'The jobs the client will do without you after launch.',
   '["Add case studies and change team photos.", "Nothing. I do all updates."]'),
  (8, '[for example monthly updates]', 'What I will keep doing, if anything',
   'Any work you have agreed to carry on with after handover.',
   '["Monthly updates and fixes, two hours a month.", "Nothing after handover."]')
) as v(step, token, label, tip, options);

-- Stamp the hints onto every prompt block, including the ones inside tabs.
create function pg_temp.stamp_hints(block jsonb, w_slug text, w_step int)
returns jsonb language plpgsql as $$
declare
  txt text;
  hints jsonb;
begin
  if block->>'kind' = 'tabs' then
    return jsonb_set(block, '{tabs}', (
      select jsonb_agg(
        jsonb_set(tab.val, '{blocks}', (
          select jsonb_agg(pg_temp.stamp_hints(inner_block.val, w_slug, w_step) order by inner_block.ord)
          from jsonb_array_elements(tab.val->'blocks') with ordinality as inner_block(val, ord)
        ))
        order by tab.ord)
      from jsonb_array_elements(block->'tabs') with ordinality as tab(val, ord)
    ));
  end if;

  if block->>'kind' <> 'prompt' then
    return block;
  end if;

  -- Every version of the prompt, as plain text, so one list serves them all.
  select string_agg(version, E'\n')
  into txt
  from (
    select block->>'prompt' as version
    union all
    select option->>'prompt' from jsonb_array_elements(coalesce(block->'prompts', '[]'::jsonb)) as option
  ) versions;

  select jsonb_agg(
    jsonb_strip_nulls(jsonb_build_object('token', h.token, 'label', h.label, 'tip', h.tip, 'options', h.options))
    order by h.ord)
  into hints
  from _hints h
  where h.slug = w_slug
    and (h.step is null or h.step = w_step)
    and position(h.token in txt) > 0
    and (h.label is null or position(h.label || ': ' || h.token in txt) > 0);

  if hints is null then
    return block - 'placeholders';
  end if;
  return jsonb_set(block, '{placeholders}', hints);
end;
$$;

update wizards w
set steps = (
      select jsonb_agg(
        jsonb_set(step.val, '{blocks}', (
          select jsonb_agg(pg_temp.stamp_hints(block.val, w.slug, step.ord::int) order by block.ord)
          from jsonb_array_elements(step.val->'blocks') with ordinality as block(val, ord)
        ))
        order by step.ord)
      from jsonb_array_elements(w.steps) with ordinality as step(val, ord)
    ),
    updated_at = now()
where w.slug in (select distinct slug from _hints);

-- No blank left unexplained. A label that does not match its line fails here
-- too, because its hint is never attached and the blank is then uncovered.
do $$
declare
  missing text;
begin
  with blocks as (
    select w.slug, step.ord as step, block.val as block
    from wizards w,
      jsonb_array_elements(w.steps) with ordinality as step(val, ord),
      jsonb_array_elements(step.val->'blocks') as block(val)
    where w.slug in (select distinct slug from _hints)
  ), prompts as (
    select slug, step, block from blocks where block->>'kind' = 'prompt'
    union all
    select slug, step, inner_block.val
    from blocks,
      jsonb_array_elements(block->'tabs') as tab(val),
      jsonb_array_elements(tab.val->'blocks') as inner_block(val)
    where block->>'kind' = 'tabs' and inner_block.val->>'kind' = 'prompt'
  ), versions as (
    select slug, step, block, block->>'prompt' as txt from prompts
    union all
    select slug, step, block, option->>'prompt'
    from prompts, jsonb_array_elements(coalesce(block->'prompts', '[]'::jsonb)) as option
  ), blanks as (
    select distinct slug, step, block, hit[1] as token
    from versions, regexp_matches(txt, '(\[[^\[\]\n]+\])', 'g') as hit
  )
  select string_agg(distinct slug || ' step ' || step || ' ' || token, '; ')
  into missing
  from blanks
  where token !~ '^\[(NEEDED|NEEDED: what|ASSUMED)\]$'
    and not exists (
      select 1
      from jsonb_array_elements(coalesce(block->'placeholders', '[]'::jsonb)) as hint
      where hint->>'token' = token
    );

  if missing is not null then
    raise exception 'Blanks with no hint: %', missing;
  end if;
end;
$$;

drop function pg_temp.stamp_hints(jsonb, text, int);
drop table _hints;
