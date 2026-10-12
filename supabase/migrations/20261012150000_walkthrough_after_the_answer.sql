-- What to do after the AI answers.
--
-- Ali ran step 1 of "Build an agency website" himself on 2026-10-12. The
-- prompt ended by asking for the three weakest parts of the brief, ChatGPT
-- added a "recommended next step" of its own, and following that turned one
-- step into an open-ended conversation about packages. Nothing in the
-- walkthrough said what to do with the extra advice, or when to stop.
--
-- Three changes, following docs/walkthrough-rules.md section 3:
--
--   1. Every prompt in the agency walkthrough now ends by telling the AI to
--      stop: no next steps, no offers of more work. The brief prompt's
--      "weakest parts" line asks for one answerable question per gap, so the
--      loop it opens can be closed in one reply.
--   2. Steps 1 to 6, the ones that end in a saved file, gain an "After the AI
--      answers" section: what to keep, three rules for not wandering, and
--      three follow-up prompts (fix the gaps once, decide one thing, wrap it
--      up). Steps 7 and 8 are iterative by nature and get a short rule each.
--   3. The planning step of each beginner walkthrough gets the same guidance
--      as a short note. Their "Stuck?" prompts are left alone: a
--      troubleshooting prompt is a conversation on purpose.
--
-- The new prompts' blanks carry hints, per rule 1.1, and their first options
-- stay with Northlight Studio, the walkthrough's made-up project.
--
-- Safe to run twice: a prompt that already has the stop line is left alone,
-- and a step that already has the section is not given a second one.

-- Also here, from the same test run: two of Ali's answers were this
-- walkthrough's example answers with the nouns swapped, and ChatGPT wrote
-- them into his brief as facts. The two prompts where the reader describes a
-- business in their own words (the brief, and a case study) now ask the AI to
-- call out any answer that reads like a stock example before it uses it.
create function pg_temp.stop_text(t text) returns text language sql immutable as $$
  select case
    when r is null then null
    when position('I am following a set process' in r) > 0 then r
    else r
      || case
           when position('The agency: [' in r) > 0 or position('Client and what they do: [' in r) > 0
             then E'\n\n' || 'Before you write anything, check my answers above. If one reads like a stock example, or does not fit the business I described, list it first under the heading Check these and say why in a few words. Then carry on, and mark anything you build on those answers [ASSUMED].'
           else ''
         end
      || E'\n\n' || 'Stop there. Do not suggest next steps or offer to do more. I am following a set process and the next step has its own prompt.'
  end
  from (
    select replace(
      t,
      'Finish with the three weakest parts of the brief and what I would need to find out to fix each.',
      'Finish with the three weakest parts of the brief. For each one, ask me a single question I can answer in a sentence.'
    ) as r
  ) x
$$;

create function pg_temp.stop_block(block jsonb) returns jsonb language plpgsql as $$
begin
  if block->>'kind' = 'tabs' then
    return jsonb_set(block, '{tabs}', (
      select jsonb_agg(
        jsonb_set(tab.val, '{blocks}', (
          select jsonb_agg(pg_temp.stop_block(inner_block.val) order by inner_block.ord)
          from jsonb_array_elements(tab.val->'blocks') with ordinality as inner_block(val, ord)
        ))
        order by tab.ord)
      from jsonb_array_elements(block->'tabs') with ordinality as tab(val, ord)
    ));
  end if;

  if block->>'kind' <> 'prompt' or block->>'label' = 'After the AI answers' then
    return block;
  end if;

  block := jsonb_set(block, '{prompt}', to_jsonb(pg_temp.stop_text(block->>'prompt')));
  if block ? 'prompts' then
    block := jsonb_set(block, '{prompts}', (
      select jsonb_agg(
        jsonb_set(version.val, '{prompt}', to_jsonb(pg_temp.stop_text(version.val->>'prompt')))
        order by version.ord)
      from jsonb_array_elements(block->'prompts') with ordinality as version(val, ord)
    ));
  end if;
  return block;
end;
$$;

-- The section for a step that ends in a saved file. {D} is what the step
-- makes ("brief"), {F} the file it is saved as ("brief.md").
create function pg_temp.after_file(d text, f text) returns jsonb language sql immutable as $$
  select replace(replace($json$[
    {
      "kind": "text",
      "body": "After the AI answers\n\nYou need one thing from this step: a {D} you can save as {F}. Your AI tool will usually hand you more than that: weak points, questions, a recommended next step. They are often good, but each one you follow is a new conversation, and it is easy to lose an evening there.\n\nThree rules keep you moving:\n\n1. One round of fixes. Answer what you can in a sentence each with the first prompt below, and take the rewrite.\n2. If a gap needs a real decision from you, such as your packages or your prices, make it once with the second prompt, then come back.\n3. Whatever you still do not know goes into the file as [NEEDED: what]. The marker stays visible in every later step, so nothing is lost by moving on.\n\nA {D} with two honest gaps in it is finished. Save it and go to the next step."
    },
    {
      "kind": "prompt",
      "label": "After the AI answers",
      "prompt": "Thanks. Here are my answers to the gaps you found. Where I wrote not yet, I do not know and cannot find out today.\n\n[your answers, one line each]\n\nRewrite the {D} once with these answers in it. For every not yet, write [NEEDED: what] in the place it belongs and do not fill it in. Keep the same headings and the same length.\n\nGive me only the finished {D}, ready to save as {F}. Do not list new weaknesses, ask questions or suggest next steps.",
      "prompts": [
        {
          "title": "Fix the gaps once",
          "prompt": "Thanks. Here are my answers to the gaps you found. Where I wrote not yet, I do not know and cannot find out today.\n\n[your answers, one line each]\n\nRewrite the {D} once with these answers in it. For every not yet, write [NEEDED: what] in the place it belongs and do not fill it in. Keep the same headings and the same length.\n\nGive me only the finished {D}, ready to save as {F}. Do not list new weaknesses, ask questions or suggest next steps."
        },
        {
          "title": "Decide one thing",
          "prompt": "Before I finish the {D} I need to decide one thing: [the decision]\n\nWhat I know: [anything that limits the choice]\n\nGive me three options in a short table. Say which one you would pick for my situation and why, in two sentences, and stop. Do not write anything else for the site yet. I will tell you my choice, and then you will update the {D}."
        },
        {
          "title": "Wrap it up",
          "prompt": "We have gone far enough for now. Give me the final {D}, with everything we agreed in it, ready to save as {F}.\n\nAnything still undecided goes in as [NEEDED: what]. Do not ask questions or suggest next steps."
        }
      ],
      "placeholders": [
        {
          "token": "[your answers, one line each]",
          "tip": "Number them the way the AI numbered its gaps. One sentence each is enough, and not yet is a real answer.",
          "options": [
            "1. Brand identity takes six weeks and includes two rounds of changes.\n2. Not yet. I will ask Holme Valley Dairy whether we can publish their numbers.\n3. We have launched eleven food and drink brands, so we already know what a supermarket buyer asks for.",
            "1. Yes, keep it.\n2. Not yet.\n3. Use the Fettle Coffee project."
          ]
        },
        {
          "token": "[the decision]",
          "tip": "One decision only: the one the AI said is holding everything else up.",
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
  ]$json$, '{D}', d), '{F}', f)::jsonb
$$;

-- What goes after the last prompt of a step, or null for a step left alone.
create function pg_temp.after_blocks(w_slug text, w_step int) returns jsonb language sql immutable as $$
  select case
    when w_slug = 'build-an-agency-website' then case w_step
      when 1 then pg_temp.after_file('brief', 'brief.md')
      when 2 then pg_temp.after_file('blueprint', 'blueprint.md')
      when 3 then pg_temp.after_file('copy', 'copy.md')
      when 4 then pg_temp.after_file('design system', 'design-system.md')
      when 5 then pg_temp.after_file('set of behaviour notes', 'behaviour.md')
      when 6 then pg_temp.after_file('back-end plan', 'data.md')
      when 7 then $json$[{"kind": "callout", "tone": "tip", "body": "After the AI answers\n\nOne page per conversation. When a page matches the spec, save your work and start a fresh chat for the next page. If your AI tool offers to restyle something or add a feature, say no for now: a change goes into the spec files first, then into the build. Otherwise the site and the spec drift apart, and the next page is built from the wrong one."}]$json$::jsonb
      when 8 then $json$[{"kind": "callout", "tone": "tip", "body": "After the AI answers\n\nAn audit can always find one more thing. Fix everything marked critical and high, launch, and put the medium and low findings on a list for afterwards. If you ask for a second audit, ask only whether the first one's fixes worked, not for a new list."}]$json$::jsonb
    end
    when w_slug = 'ship-your-first-web-project' and w_step = 1 then
      $json$[{"kind": "callout", "tone": "tip", "body": "After the AI answers\n\nYou need one thing from this step: your idea as a single sentence. Write it down and go to the next step. If your AI tool offers extra features, a roadmap or a list of technologies, you can leave all of it. The next steps make those choices for you."}]$json$::jsonb
    when w_slug = 'add-a-database-with-supabase' and w_step = 1 then
      $json$[{"kind": "callout", "tone": "tip", "body": "After the AI answers\n\nYou need one thing from this step: whether you need a database, and if you do, a short list of what it has to remember. Write that down and go to the next step. If your AI tool offers to write the code or a full set of tables now, leave it. Step 3 gives you the script."}]$json$::jsonb
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

      if walkthrough.slug = 'build-an-agency-website' then
        select jsonb_agg(pg_temp.stop_block(b.val) order by b.ord)
        into blocks
        from jsonb_array_elements(blocks) with ordinality as b(val, ord);
      end if;

      extra := pg_temp.after_blocks(walkthrough.slug, step_no);

      if extra is not null and not exists (
        select 1 from jsonb_array_elements(blocks) as b(val)
        where b.val->>'label' = 'After the AI answers' or b.val->>'body' like 'After the AI answers%'
      ) then
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

      -- The brief is where the loop opened, so its checklist names closing it.
      if walkthrough.slug = 'build-an-agency-website' and step_no = 1 then
        select jsonb_agg(
          case
            when b.val->>'kind' = 'checklist' and not b.val->'tasks' @> '[{"id": "brief-gaps"}]'::jsonb
              then jsonb_set(b.val, '{tasks}', b.val->'tasks'
                || '[{"id": "brief-gaps", "label": "Answered the gaps once, and marked the rest NEEDED"}]'::jsonb)
            else b.val
          end
          order by b.ord)
        into blocks
        from jsonb_array_elements(blocks) with ordinality as b(val, ord);
      end if;

      new_steps := new_steps || jsonb_build_array(jsonb_set(step, '{blocks}', blocks));
    end loop;

    update wizards set steps = new_steps, updated_at = now() where slug = walkthrough.slug;
  end loop;
end;
$$;

drop function pg_temp.after_blocks(text, int);
drop function pg_temp.after_file(text, text);
drop function pg_temp.stop_block(jsonb);
drop function pg_temp.stop_text(text);
