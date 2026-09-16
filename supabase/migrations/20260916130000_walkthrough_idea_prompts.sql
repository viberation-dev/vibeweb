-- Walkthrough step 1 rewrite (VIB-160).
--
-- "Ship your first web project", step Idea: plainer copy, and three prompt
-- versions to pick from instead of one. `prompt` stays set to the first
-- version so builds from before VIB-160, which only read `prompt`, keep
-- rendering: previews and production share this database.
--
-- Content only. Task ids are unchanged, so nobody's saved ticks move.
update wizards
set steps = jsonb_set(steps, '{0}', '{
  "key": "idea",
  "title": "Idea",
  "intro": "Your first project should be small enough to finish. Then make it a bit smaller.",
  "blocks": [
    {
      "kind": "text",
      "body": "Pick something with one screen and one job. A page of your favourite recipes. A countdown to a date that matters. A form that emails you.\n\nHere is the test: can you describe it in one sentence without the word \"and\"? If you need an \"and\", you have two projects. You will finish neither, and both will live forever in a folder called final-v2."
    },
    {
      "kind": "callout",
      "tone": "warning",
      "body": "Do not start with your dream app. Build the boring version first, put it online, then make it clever. Right now you are practising shipping, not design."
    },
    {
      "kind": "prompt",
      "label": "Pick a prompt, copy it, and paste it into your AI tool",
      "prompt": "I want to build this as my first web project: [describe it in one sentence].\n\nBefore we write any code, answer three questions:\n1. Is this one screen or several? If several, what is the smallest one-screen version?\n2. Does it need to save any data? If so, what?\n3. What one thing would turn this from an evening job into a week-long job?\n\nBe honest. I would rather cut it down now than give up on Thursday.",
      "prompts": [
        {
          "title": "Check my idea",
          "prompt": "I want to build this as my first web project: [describe it in one sentence].\n\nBefore we write any code, answer three questions:\n1. Is this one screen or several? If several, what is the smallest one-screen version?\n2. Does it need to save any data? If so, what?\n3. What one thing would turn this from an evening job into a week-long job?\n\nBe honest. I would rather cut it down now than give up on Thursday."
        },
        {
          "title": "Shrink my idea",
          "prompt": "Here is my idea for a first web project: [describe it, as long or messy as you like].\n\nIt is probably too big. Help me shrink it:\n1. Rewrite it as one sentence with no \"and\" in it.\n2. List what I should leave out of the first version.\n3. Describe the finished single screen in plain words.\n\nKeep it simple. I am a beginner and I want to finish something this week."
        },
        {
          "title": "I have no idea yet",
          "prompt": "I want to build my first web project, but I do not have an idea yet.\n\nThings I care about: [a hobby, your job, something that annoys you].\n\nSuggest five tiny project ideas based on those. Each one must:\n- fit on one screen\n- be describable in one sentence without the word \"and\"\n- be buildable by a beginner with AI in one evening\n\nThen tell me which one you would pick, and why."
        }
      ]
    },
    {
      "kind": "checklist",
      "tasks": [
        {
          "id": "idea-sentence",
          "label": "Wrote my idea as one sentence, with no \"and\" in it"
        },
        {
          "id": "idea-scope",
          "label": "Cut it down to one screen"
        },
        {
          "id": "idea-done",
          "label": "Decided what done looks like, so I know when to stop"
        }
      ]
    }
  ]
}'::jsonb)
where slug = 'ship-your-first-web-project'
  and steps->0->>'key' = 'idea';
