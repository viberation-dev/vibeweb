-- Guide: writing a skill worth keeping (VIB-227).
--
-- Row 4 of docs/extend-guides-plan.md. Filed under context_engineering
-- rather than fundamentals, because that is what it is: installing a skill is
-- one command, and everything hard about skills is deciding what goes in the
-- description, what goes in the body, and what should not be a skill at all.
--
-- Published on insert: no new block kind.
--
-- Does not repeat row 3's "what is a skill". It assumes you have one and it
-- is not working.
insert into content (type, title, slug, body, role_level, pillar, status, blocks) values
(
  'guide',
  'Writing a skill worth keeping',
  'writing-skills',
  'Installing a skill is one command. Writing one that fires when it should, says something your tool did not already know, and is still useful in three months is the actual work. Most first skills fail on the first of those and nobody ever finds out.',
  'intermediate',
  'context_engineering',
  'published',
  '[
    {"kind": "text", "body": "A skill that never fires produces no error. It sits in the folder, your tool does the thing badly the way it always did, and you conclude skills do not work.\n\nSo the order of difficulty is not what people expect. Getting it to trigger is the hard part. Writing good content is the easy part, and most of the advice you will read is about the easy part."},
    {"kind": "heading", "level": 2, "title": "The description is the whole trigger"},
    {"kind": "text", "body": "Your tool holds the description of every installed skill in context at all times. It does not hold the bodies. When you ask for something, it matches your request against those descriptions, and only then reads the one it picked.\n\nThat has two consequences, and they pull in opposite directions. The description has to be specific enough to match, and short enough that carrying it costs nothing. The body can be as long as it needs to be, because it is only paid for when used."},
    {"kind": "callout", "tone": "tip", "body": "Write the description as a sentence starting \"Use when…\", naming the situation in the words you would actually use.\n\n\"Use when writing or reviewing a database migration\" fires. \"Database helper\" does not, because nothing anybody types looks like that."},
    {"kind": "text", "body": "The test is mechanical. Take the last three things you typed that should have triggered the skill, and ask whether the description obviously matches them. If you have to argue for it, your tool will not make the leap either.\n\nInclude the words people get wrong on purpose. If your team says \"ship it\" and means deploy, put both in."},
    {"kind": "heading", "level": 2, "title": "What goes in the body"},
    {"kind": "text", "body": "The useful content is whatever your tool would otherwise get wrong, and only that.\n\nIt already knows how SQL works, what a migration is, and general good practice. Writing that down costs you context and earns nothing. What it does not know is that your migrations have to grant table privileges explicitly, or that this codebase puts queries in one layer and never calls the database from a component.\n\nThe heuristic: if a competent stranger would get it right without being told, cut it."},
    {"kind": "callout", "tone": "warning", "body": "Resist writing the essay. A long skill is read as context the moment it fires, and a long one that fires often is a tax on every session it touches.\n\nIf a skill is getting long, it is usually two skills with different triggers, or a skill plus a reference file it can read when it needs the detail."},
    {"kind": "heading", "level": 2, "title": "Skill, instructions file, or nothing"},
    {"kind": "text", "body": "Three places a rule can live, and the choice is about when it is relevant, not how important it is.\n\nAlways relevant → your instructions file. Build commands, project layout, the conventions that apply to everything. It loads every session, which is right for things that always apply and wasteful for things that rarely do.\n\nSometimes relevant → a skill. Release checklists, how to write a migration, the review you do before touching payments. Costs a line of description when idle.\n\nOnce → just say it. Not everything needs to be a file. A rule you wrote for a situation that happened once is a rule you will be confused by later."},
    {"kind": "heading", "level": 2, "title": "Test it like a change, not like a document"},
    {"kind": "text", "body": "Two questions, in order, and the first one is the one people skip.\n\nDoes it fire? Start a fresh session, phrase a request the way you normally would, and see whether it picks the skill up without being told to. If you have to name the skill, the description is wrong — asking for it by name proves nothing except that the file exists.\n\nDoes it change the answer? Run the same request with the skill and without. If the output is the same, the skill is telling your tool something it already knew."},
    {"kind": "prompt", "label": "Paste this into your AI tool", "prompt": "Here is a skill I wrote: [paste it]. Without being told to use it, would you have picked it for the request \"[paste a real request]\"? Answer honestly, and if not, tell me which words in the description failed to match.", "prompts": [
      {"title": "Will it actually fire", "prompt": "Here is a skill I wrote: [paste it]. Without being told to use it, would you have picked it for the request \"[paste a real request]\"? Answer honestly, and if not, tell me which words in the description failed to match."},
      {"title": "Cut what it already knew", "prompt": "Here is a skill I wrote: [paste it]. Which parts of it are things you would have done correctly anyway, without this file? Be blunt — I want to delete those lines."},
      {"title": "Turn a correction into a skill", "prompt": "Look back over this conversation at the things I corrected you on. Which of them are specific to this project and likely to come up again? For each, draft a skill with a description line starting \"Use when\"."}
    ]},
    {"kind": "text", "body": "The second prompt is uncomfortable and worth running. Most skills are twice as long as they need to be, and the extra half is the part being paid for on every use."},
    {"kind": "heading", "level": 2, "title": "Keeping them"},
    {"kind": "text", "body": "Skills rot the way documentation rots, with one difference: nobody reads them, so nobody notices.\n\nThe moment to update one is when you correct your tool on something the skill was supposed to cover. That correction is the signal. It means the skill fired and was wrong, or did not fire and should have, and both are fixable in the minute you have just spent being annoyed."},
    {"kind": "links", "links": [
      {"label": "Skills: teaching your tool your way of working", "href": "/learn/skills-explained"},
      {"label": "Browse skills", "href": "/skills"},
      {"label": "Global or project: where config lives", "href": "/learn/global-or-project-config"},
      {"label": "AGENTS.md: a README for your coding agent", "href": "/tools/agents-md"}
    ]}
  ]'::jsonb
)
on conflict (slug) do update set
  title      = excluded.title,
  body       = excluded.body,
  role_level = excluded.role_level,
  pillar     = excluded.pillar,
  status     = excluded.status,
  blocks     = excluded.blocks,
  updated_at = now();
