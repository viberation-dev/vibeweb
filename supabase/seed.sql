-- Viberation — seed data: tools (VIB-27) + Learn content (VIB-32, VIB-35) + collections (VIB-41) + flagship wizard (VIB-43)
--
-- Not a migration: seed rows are content, not schema, and re-running this
-- file must be safe. Every statement is idempotent on the natural key
-- (slug), so this can be applied to a fresh database or an existing one.
--
-- Apply with:  psql "$SUPABASE_DB_URL" -f supabase/seed.sql
--
-- Two real tools per category so all 13 categories have something in them
-- and the category nav is never a wall of empty states.

insert into tags (name, slug) values
  ('Web apps',          'web-apps'),
  ('Frontend',          'frontend'),
  ('Backend',           'backend'),
  ('Database',          'database'),
  ('Deployment',        'deployment'),
  ('Automation',        'automation'),
  ('Code generation',   'code-generation'),
  ('Testing',           'testing'),
  ('Design',            'design'),
  ('Open source',       'open-source'),
  ('Free tier',         'free-tier'),
  ('Beginner friendly', 'beginner-friendly')
on conflict (slug) do update set name = excluded.name;

insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url) values
  ('Claude', 'claude', 'models',
   'Anthropic''s model family, strong at long-context coding work.',
   'Claude is Anthropic''s family of large language models. For vibe coders it is the model behind Claude Code and Claude.ai, and it handles large codebases and long instructions well.',
   'Freemium', 'https://www.anthropic.com/claude'),
  ('Gemini', 'gemini', 'models',
   'Google DeepMind''s multimodal model family.',
   'Gemini is Google''s multimodal model line, available through the Gemini app and the Google AI developer APIs.',
   'Freemium', 'https://deepmind.google/technologies/gemini/'),

  ('Claude.ai', 'claude-ai', 'chats',
   'Chat with Claude in the browser, with projects and artifacts.',
   'The web and desktop chat interface for Claude. Projects keep related context together, and artifacts render code and documents beside the conversation.',
   'Freemium', 'https://claude.ai'),
  ('ChatGPT', 'chatgpt', 'chats',
   'OpenAI''s chat interface for its GPT models.',
   'The chat product most people meet AI through. Useful as a second opinion when a model gets stuck on your main tool.',
   'Freemium', 'https://chatgpt.com'),

  ('Claude Agent SDK', 'claude-agent-sdk', 'agents',
   'Build your own agents on the same harness as Claude Code.',
   'The SDK that exposes Claude Code''s agent loop — tools, permissions, subagents — so you can build a custom agent instead of scripting a chat API by hand.',
   'Paid', 'https://docs.claude.com/en/api/agent-sdk/overview'),
  ('AutoGen', 'autogen', 'agents',
   'Microsoft''s framework for multi-agent conversations.',
   'An open-source framework for orchestrating several LLM agents that talk to each other to solve a task.',
   'Open source', 'https://microsoft.github.io/autogen/'),

  ('Cursor', 'cursor', 'ides',
   'An AI-first fork of VS Code.',
   'Cursor keeps the VS Code editing experience and layers in inline edits, codebase chat and an agent mode. The usual first step up from copy-pasting between a chat window and your editor.',
   'Freemium', 'https://cursor.com'),
  ('Visual Studio Code', 'vs-code', 'ides',
   'The editor most AI coding extensions target first.',
   'Free, extensible, and the assumed baseline for nearly every AI coding plugin. A safe home base if you would rather add AI to a familiar editor than switch editors.',
   'Free', 'https://code.visualstudio.com'),

  ('Claude Code', 'claude-code', 'clis',
   'Anthropic''s agentic coding tool in your terminal.',
   'Claude Code reads, edits and runs your project from the command line, with hooks, skills, subagents and MCP servers for extending it. Also available as a desktop app and IDE extension.',
   'Paid', 'https://claude.com/claude-code'),
  ('Aider', 'aider', 'clis',
   'Pair programming with an LLM in your terminal, git-native.',
   'Aider edits files in your local git repo and commits as it goes, so every AI change is a reviewable commit.',
   'Open source', 'https://aider.chat'),

  ('Agent Skills', 'agent-skills', 'utilities', -- docs, not a skill (VIB-133)
   'Package a repeatable workflow as a folder an agent can load.',
   'A skill is a directory of instructions (and optional scripts) that an agent loads when the task matches. The cleanest way to make "how we do X here" reusable instead of re-explaining it every session.',
   'Free', 'https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview'),
  ('Superpowers', 'superpowers', 'skills',
   'A community skill collection for planning, debugging and review.',
   'An open-source bundle of process skills — brainstorming, systematic debugging, writing plans — that gives an agent a repeatable method instead of improvising each time.',
   'Open source', 'https://github.com/obra/superpowers'),

  ('Supabase MCP Server', 'supabase-mcp-server', 'mcp_servers',
   'Let your agent query and migrate your Supabase project.',
   'Exposes your Supabase project — tables, SQL, migrations, logs, advisors — to any MCP-capable agent, so schema work happens in the same session as the code.',
   'Free', 'https://supabase.com/docs/guides/getting-started/mcp'),
  ('Playwright MCP', 'playwright-mcp', 'mcp_servers',
   'Give your agent a real browser to drive.',
   'Microsoft''s MCP server for Playwright. The agent navigates, clicks and reads the accessibility tree, which makes "check that the page actually works" something it can do itself.',
   'Open source', 'https://github.com/microsoft/playwright-mcp'),

  ('GitHub Copilot', 'github-copilot', 'plugins',
   'Inline completions and chat inside your existing editor.',
   'The original editor plugin: autocomplete that finishes lines and blocks as you type, plus chat and PR review in GitHub itself.',
   'Paid', 'https://github.com/features/copilot'),
  ('Continue', 'continue', 'plugins',
   'Open-source AI assistant plugin for VS Code and JetBrains.',
   'Continue lets you point your editor assistant at whichever model you want, including local ones, instead of being tied to one vendor.',
   'Open source', 'https://continue.dev'),

  ('Next.js', 'nextjs', 'frameworks',
   'The React framework most AI tools generate best.',
   'App Router, server components and route handlers in one framework. Its popularity is a practical advantage: models have seen an enormous amount of Next.js code.',
   'Open source', 'https://nextjs.org'),
  ('LangChain', 'langchain', 'frameworks',
   'Framework for chaining LLM calls, tools and retrieval.',
   'A large ecosystem for building LLM applications — prompts, tool calling, retrieval and agents — in Python or TypeScript.',
   'Open source', 'https://www.langchain.com'),

  ('shadcn/ui', 'shadcn-ui', 'templates',
   'Copy-paste React components you own outright.',
   'Not a dependency: the CLI copies component source into your repo, so you can edit it. Pairs well with AI editing because the component code is right there in your project.',
   'Open source', 'https://ui.shadcn.com'),
  ('Create T3 App', 'create-t3-app', 'templates',
   'Typesafe Next.js starter with sensible defaults.',
   'A scaffolding CLI for a typed Next.js stack, so you skip the first afternoon of wiring and start on the actual feature.',
   'Open source', 'https://create.t3.gg'),

  ('n8n', 'n8n', 'workflows',
   'Self-hostable workflow automation with AI nodes.',
   'Visual workflow builder that can be self-hosted. Good when an automation needs to run on a schedule somewhere other than your laptop.',
   'Freemium', 'https://n8n.io'),
  ('Zapier', 'zapier', 'workflows',
   'Connect apps without writing glue code.',
   'The least-effort way to wire two SaaS products together. Worth reaching for before you write a webhook handler you will have to host and maintain.',
   'Freemium', 'https://zapier.com'),

  ('Supabase', 'supabase', 'tools',
   'Postgres, auth, storage and row-level security in one box.',
   'An open-source Firebase alternative built on real Postgres. Row-level security means your access rules live in the database rather than scattered through app code.',
   'Freemium', 'https://supabase.com'),
  ('Vercel', 'vercel', 'tools',
   'Deploy Next.js with a preview URL per pull request.',
   'Push a branch, get a live URL. The preview-per-PR workflow is what makes reviewing a change practical.',
   'Freemium', 'https://vercel.com'),

  ('Resend', 'resend', 'utilities',
   'Transactional email built for developers.',
   'A small, well-documented API for sending the email your app has to send — sign-in links, receipts, notifications.',
   'Freemium', 'https://resend.com'),
  ('Typesense', 'typesense', 'utilities',
   'Fast open-source search you can self-host.',
   'Typo-tolerant search that is simple to run. A common next step once database full-text search stops being good enough.',
   'Open source', 'https://typesense.org')
on conflict (slug) do update set
  name         = excluded.name,
  category     = excluded.category,
  tagline      = excluded.tagline,
  description  = excluded.description,
  pricing_tier = excluded.pricing_tier,
  outbound_url = excluded.outbound_url,
  updated_at   = now();

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('claude','code-generation'), ('claude','free-tier'),
  ('gemini','code-generation'), ('gemini','free-tier'),
  ('claude-ai','free-tier'),
  ('chatgpt','free-tier'),
  ('claude-agent-sdk','automation'), ('claude-agent-sdk','backend'),
  ('autogen','automation'), ('autogen','open-source'),
  ('cursor','code-generation'),
  ('vs-code','free-tier'), ('vs-code','open-source'),
  ('claude-code','code-generation'), ('claude-code','automation'),
  ('aider','open-source'), ('aider','code-generation'),
  ('agent-skills','automation'), ('agent-skills','free-tier'),
  ('superpowers','open-source'), ('superpowers','automation'),
  ('supabase-mcp-server','database'), ('supabase-mcp-server','backend'), ('supabase-mcp-server','free-tier'),
  ('playwright-mcp','testing'), ('playwright-mcp','open-source'),
  ('github-copilot','code-generation'),
  ('continue','open-source'), ('continue','code-generation'),
  ('nextjs','frontend'), ('nextjs','web-apps'), ('nextjs','open-source'),
  ('langchain','backend'), ('langchain','open-source'),
  ('shadcn-ui','frontend'), ('shadcn-ui','design'), ('shadcn-ui','open-source'),
  ('create-t3-app','web-apps'), ('create-t3-app','frontend'),
  ('n8n','automation'), ('n8n','backend'),
  ('zapier','automation'),
  ('supabase','database'), ('supabase','backend'), ('supabase','free-tier'),
  ('vercel','deployment'), ('vercel','web-apps'), ('vercel','free-tier'),
  ('resend','backend'), ('resend','free-tier'),
  ('typesense','backend'), ('typesense','open-source')
) as m(tool_slug, tag_slug)
join tools t on t.slug = m.tool_slug
join tags  g on g.slug = m.tag_slug
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Learn content (VIB-32, VIB-35)
--
-- `role_level` null means "written for everyone" and is never filtered out.
-- Help articles carry audience = 'enduser': they are visitor/member-facing
-- and belong in the Learn hub. Internal engineering docs are NOT content
-- rows — they live in the repo and the Notion Bible (§34).

-- `status` is explicit because migration 20260828172354 defaults it to
-- 'draft'. Seeded articles are meant to be live, and a seed that silently
-- produces an empty /learn on a fresh project looks like a broken seed.
insert into content (type, title, slug, body, role_level, audience, status) values
  ('guide', 'What vibe coding actually is', 'what-vibe-coding-is',
   'Vibe coding is building software by describing what you want to an AI model and steering the result, rather than typing every line yourself.

That does not mean you stop thinking. It means the bottleneck moves. Instead of "how do I write this loop", the question becomes "is this the right thing to build, and is what came back actually correct".

The three habits that separate people who ship from people who get stuck:

1. Work in small slices. Ask for one thing, check it, then ask for the next. A model given ten requirements at once will quietly drop three of them.

2. Read what you get back. You do not have to be able to write it from scratch, but you do have to be able to tell whether it does what you asked.

3. Keep a way to undo. Version control is not optional the moment you let something else edit your files.',
   'beginner', null, 'published'),

  ('guide', 'Choosing your first AI coding setup', 'choosing-your-first-setup',
   'You need three things, and you probably already have one of them.

A model. This is the thing doing the reasoning. Start with whatever is bundled into the tool you pick — swapping models is a later optimisation, not a first decision.

A place to work. Either an AI-native editor, or a CLI agent that edits files in a folder you already have. Editors are gentler if you have never used a terminal. CLI agents give you more rope.

Somewhere to put it. A git repository, and a host that deploys from it. Do this on day one, before you have anything worth losing.

The mistake to avoid is collecting tools. One editor, one model, one host, and something actually finished beats a bookmark folder of things you tried once.',
   'beginner', null, 'published'),

  ('article', 'Why your AI keeps forgetting what you told it', 'why-ai-forgets-context',
   'Models have a context window — a fixed budget of text they can consider at once. Everything competes for it: your instructions, the files you opened, the errors you pasted, and the whole conversation so far.

When a session runs long, the earliest things fall out of that budget first. That is why the rule you set at the top stops being followed an hour later.

What helps, in order of how much it helps:

Put durable rules in a file the tool reads every session, not in a message. A CLAUDE.md or equivalent survives a new session; a chat message does not.

Start a fresh session per task. A long session is not a memory, it is a liability.

Point at specific files rather than asking it to search. Every wasted read costs budget you wanted for the actual work.',
   'intermediate', null, 'published'),

  ('article', 'Reviewing code you did not write', 'reviewing-code-you-did-not-write',
   'You are going to merge a lot of code you did not type. Reviewing it is a different skill from writing it, and it is the one that actually keeps a vibe-coded project alive past week three.

Read the diff, not the summary. The summary is what the model believed it did. The diff is what it did.

Check the edges the model was never told about. Empty inputs, a user who is signed out, a list with zero items, a network call that fails. Models write the happy path unprompted and the rest only when asked.

Ask what else calls this. A change that fixes one caller and breaks two others still passes the test you were looking at.

Be suspicious of new dependencies. A package added to save five lines of work is five lines of work plus a supply chain.',
   'intermediate', null, 'published'),

  ('cheatsheet', 'Prompts that get better code back', 'prompts-for-better-code',
   'Give it the constraint, not just the goal.
  Weak:   "add search"
  Better: "add search over the tools table using Postgres full text, no new dependencies"

Name the files.
  Weak:   "fix the login bug"
  Better: "in the auth actions file, sign-in fails silently when the password is wrong"

Say what done looks like.
  "Done when a signed-out visitor hitting /bookmarks lands on /login and comes back after signing in."

Ask for the smallest version first.
  "Simplest thing that works. No abstraction for one caller."

Make it show you, not tell you.
  "Run the tests and paste the output" beats "make sure the tests pass".

When it goes wrong, give it the error text verbatim. A paraphrased error is a different error.',
   null, null, 'published'),

  ('cheatsheet', 'Git commands worth memorising', 'git-commands-worth-memorising',
   'git status                 what is actually changed right now
git diff                   what changed, line by line, unstaged
git add -p                 stage selected chunks, not whole files
git commit -m "message"    save a checkpoint
git switch -c feat/thing   new branch off where you are
git switch main            back to the trunk
git restore <file>         throw away uncommitted changes to one file
git log --oneline -10      the last ten commits, one line each

The two that save you:

git stash                  park everything, do something else, then git stash pop to get it back
git revert <commit>        undo a commit by making a new one, which is safe on shared branches

The one to be careful with:

git reset --hard           discards uncommitted work permanently. There is no undo.',
   'beginner', null, 'published'),

  ('article', 'Row level security is the security boundary', 'rls-is-the-boundary',
   'If your database rows are protected by a check in your application code, they are not protected. Anything holding a key can talk to the database directly, and your code is not in that path.

Row level security moves the rule into the database. A policy says which rows a given user can see or change, and it applies to every query from every client, including the ones you did not write.

The practical shape of it:

Public content is readable by everyone and writable only by staff.

Personal data — bookmarks, history, saved progress — is readable and writable only by the row owner.

Counters and aggregates are written by a security definer function, because the table itself is not user-writable.

Application checks are still worth having as defence in depth. They are just not the thing standing between a stranger and your data.',
   'expert', null, 'published'),

  ('course_link', 'Git and GitHub for absolute beginners', 'course-git-for-beginners',
   'A free, video-based introduction to version control that assumes no prior terminal experience.

Worth doing before you let any AI agent edit your files, because the entire safety net of vibe coding is being able to see what changed and undo it.

Covers repositories, commits, branches, pull requests, and resolving your first merge conflict.

Search for "Git and GitHub for Beginners" on freeCodeCamp — it is a full crash course and costs nothing.',
   'beginner', null, 'published'),

  ('course_link', 'Full stack fundamentals without the framework churn', 'course-fullstack-fundamentals',
   'A longer course on how web applications actually fit together: requests, responses, databases, authentication and deployment.

The value here is not the specific stack it teaches. It is that once you know what a session cookie is and why a database query can be slow, AI-generated code stops being a black box you either accept or reject on vibes.

The Odin Project and Full Stack Open are both free and both good. Pick one and finish it.',
   'intermediate', null, 'published'),

  ('help_article', 'Creating your Viberation account', 'help-creating-your-account',
   'You can browse the tool directory and everything in Learn without an account. You need one to save things.

To sign up, use Sign up in the top right. You can either use an email address and password, or continue with GitHub or Google.

If you sign up with email, we send you a confirmation link. Open it to finish creating the account — until you do, signing in will not work.

If you already signed up with Google or GitHub and later try email with the same address, sign in with the original method instead. They are the same account.',
   null, 'enduser', 'published'),

  ('help_article', 'Saving and organising bookmarks', 'help-saving-bookmarks',
   'Anything with a Save button can be bookmarked — tools in the directory, and articles and guides in Learn.

Press Save on a card or a detail page. If you are not signed in, we take you to sign in and bring you straight back to where you were.

Everything you save appears on your Bookmarks page.

Folders are just names you type. Type a new name on any bookmark to create that folder, or pick one you have used before to move it there. Bookmarks with no folder collect under Unfiled at the bottom.

Renaming a folder moves everything in it at once. To remove a bookmark, press Saved on it again.',
   null, 'enduser', 'published'),

  ('help_article', 'Setting your skill level', 'help-setting-your-level',
   'Your level tells us which guides to put in front of you. It is set on your Profile page, and you can change it whenever you like.

Beginner, intermediate and expert are about how much you want explained, not about how good you are.

On the Learn page we show content written for your level, plus everything written for all levels. Use the level chips to look at another level, or All levels to see everything at once. That choice is per-visit and does not change your profile.',
   null, 'enduser', 'published'),

  ('help_article', 'What the tool categories mean', 'help-tool-categories',
   'The directory groups tools by what a thing actually is, not by what you might use it for.

Models are the AI itself. Chats are the conversational apps built on them. Agents do multi-step work on your behalf.

IDEs are editors. CLIs are terminal tools. Skills, MCP servers and plugins all extend a tool you already use, in different ways.

Frameworks, templates and workflows are starting points for a project. Tools and utilities are everything else that helps.

If you are looking for something by subject rather than by kind — frontend, database, free tier — use the tags instead. A tool has one category and as many tags as it needs.',
   null, 'enduser', 'published')
on conflict (slug) do update set
  type       = excluded.type,
  title      = excluded.title,
  body       = excluded.body,
  role_level = excluded.role_level,
  audience   = excluded.audience,
  status     = excluded.status,
  updated_at = now();

insert into content_tags (content_id, tag_id)
select c.id, g.id
from (values
  ('what-vibe-coding-is','beginner-friendly'),
  ('choosing-your-first-setup','beginner-friendly'), ('choosing-your-first-setup','deployment'),
  ('why-ai-forgets-context','code-generation'),
  ('reviewing-code-you-did-not-write','testing'), ('reviewing-code-you-did-not-write','code-generation'),
  ('prompts-for-better-code','code-generation'),
  ('git-commands-worth-memorising','beginner-friendly'), ('git-commands-worth-memorising','open-source'),
  ('rls-is-the-boundary','database'), ('rls-is-the-boundary','backend'),
  ('course-git-for-beginners','beginner-friendly'), ('course-git-for-beginners','free-tier'),
  ('course-fullstack-fundamentals','web-apps'), ('course-fullstack-fundamentals','free-tier'),
  ('help-tool-categories','beginner-friendly')
) as m(content_slug, tag_slug)
join content c on c.slug = m.content_slug
join tags    g on g.slug = m.tag_slug
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Curated collections (VIB-41)
--
-- `is_featured` drives the home feed's featured row. The starter set is what
-- onboarding's reveal hands a new member, so it is the one collection that
-- must always exist — keep it featured and keep it first.

insert into collections (title, slug, description, is_featured) values
  -- One per tier (VIB-94). Same title on all three: the reveal shows exactly
  -- one of them, and "Your starter set (intermediate)" would be labelling the
  -- reader rather than the shelf.
  --
  -- The beginner set keeps the unsuffixed slug on purpose — it is a live URL
  -- and the featured collection, and renaming it took the collection card off
  -- the reveal in production for as long as it took to put back.
  ('Your starter set', 'starter-set',
   'Three tools and two reads that get a first project from idea to live.',
   true),
  ('Your starter set', 'starter-set-intermediate',
   'The stack for someone who has shipped before: agentic editing, a real backend, and the reads that stop the second project repeating the first.',
   false),
  ('Your starter set', 'starter-set-expert',
   'Terminal-first tooling, an agent SDK to build on, and the security reading most vibe-coded projects skip.',
   false),
  ('Ship your first web project', 'ship-your-first-web-project',
   'Everything needed to get a real URL in front of a real person, in the order you need it.',
   true),
  ('Set up your local AI stack', 'local-ai-stack',
   'The editor, the CLI agent and the extensions that turn a plain project folder into something an agent can work in.',
   true),
  ('Free tier only', 'free-tier-only',
   'Tools with a genuinely usable free tier, for building something before you spend anything.',
   false)
on conflict (slug) do update set
  title       = excluded.title,
  description = excluded.description,
  is_featured = excluded.is_featured;

-- Membership is polymorphic (target_type + target_id) with no foreign key, so
-- these joins resolve slugs to ids at seed time and silently skip anything not
-- present — a collection referencing a tool that was never seeded simply comes
-- out shorter rather than failing the whole file.
delete from collection_items
where collection_id in (
  select id from collections
  where slug in ('starter-set','starter-set-intermediate','starter-set-expert','ship-your-first-web-project','local-ai-stack','free-tier-only')
);

insert into collection_items (collection_id, target_type, target_id, sort_order)
select c.id, 'tool', t.id, m.sort_order
from (values
  ('starter-set',                 'claude',        10),
  ('starter-set',                 'cursor',        20),
  ('starter-set-intermediate',    'claude-code',   10),
  ('starter-set-intermediate',    'supabase',      20),
  ('starter-set-intermediate',    'nextjs',        30),
  ('starter-set-expert',          'aider',         10),
  ('starter-set-expert',          'claude-agent-sdk', 20),
  ('starter-set-expert',          'playwright-mcp',30),
  ('starter-set',                 'vercel',        30),
  ('ship-your-first-web-project', 'nextjs',        10),
  ('ship-your-first-web-project', 'shadcn-ui',     20),
  ('ship-your-first-web-project', 'supabase',      30),
  ('ship-your-first-web-project', 'vercel',        40),
  ('local-ai-stack',              'claude-code',   10),
  ('local-ai-stack',              'vs-code',       20),
  ('local-ai-stack',              'agent-skills',  30),
  ('local-ai-stack',              'playwright-mcp',40),
  ('free-tier-only',              'vs-code',       10),
  ('free-tier-only',              'supabase',      20),
  ('free-tier-only',              'vercel',        30),
  ('free-tier-only',              'resend',        40)
) as m(collection_slug, tool_slug, sort_order)
join collections c on c.slug = m.collection_slug
join tools       t on t.slug = m.tool_slug;

-- Collections mix kinds: the guide that explains a set belongs in the set.
insert into collection_items (collection_id, target_type, target_id, sort_order)
select c.id, 'content', k.id, m.sort_order
from (values
  ('starter-set',                 'what-vibe-coding-is',        50),
  ('starter-set-intermediate',    'why-ai-forgets-context',     50),
  ('starter-set-intermediate',    'reviewing-code-you-did-not-write', 60),
  ('starter-set-expert',          'rls-is-the-boundary',        50),
  ('starter-set-expert',          'reviewing-code-you-did-not-write', 60),
  ('starter-set',                 'choosing-your-first-setup',  60),
  ('ship-your-first-web-project', 'git-commands-worth-memorising', 50),
  ('local-ai-stack',              'why-ai-forgets-context',     50),
  ('local-ai-stack',              'prompts-for-better-code',    60)
) as m(collection_slug, content_slug, sort_order)
join collections c on c.slug = m.collection_slug
join content     k on k.slug = m.content_slug;

-- ---------------------------------------------------------------------------
-- Flagship wizard: Ship your first web project (VIB-43)
--
-- Four steps, Idea to Launch. `steps` is jsonb because migration 04 keeps the
-- lean MVP shape; lib/validation/wizard.ts is what actually enforces it, so
-- edits here must keep every task id unique across the whole wizard —
-- checklist_state is one flat object keyed by those ids.

insert into wizards (title, slug, kind, reusable, role_level, status, steps) values
(
  'Ship your first web project',
  'ship-your-first-web-project',
  'wizard',
  false,
  'beginner',
  'published',
  '[
    {
      "key": "idea",
      "title": "Idea",
      "intro": "The hardest part of a first project is choosing one small enough to finish.",
      "blocks": [
        {
          "kind": "text",
          "body": "Pick something with one screen and one job. A page that lists your favourite recipes. A countdown to a date that matters. A form that emails you.\n\nThe test is whether you can describe it in one sentence without the word and. If you need and, it is two projects, and you will finish neither."
        },
        {
          "kind": "callout",
          "tone": "warning",
          "body": "Do not start with the thing you actually want to build. Start with the boring version of it, ship that, then make it interesting. Shipping is the skill you are practising here, not design."
        },
        {
          "kind": "prompt",
          "label": "Paste this into your AI tool to pressure-test the idea",
          "prompt": "I want to build this as my first web project: [describe it in one sentence].\n\nBefore any code, tell me:\n1. Is this one screen or several? If several, what is the smallest one-screen version?\n2. What data does it need to store, if any?\n3. What is the single thing that would make this take a week instead of an evening?\n\nBe blunt. I would rather cut scope now than abandon this on Thursday."
        },
        {
          "kind": "checklist",
          "tasks": [
            { "id": "idea-sentence", "label": "Written the idea as one sentence, with no and in it" },
            { "id": "idea-scope", "label": "Cut it down to a single screen" },
            { "id": "idea-done", "label": "Decided what done looks like, so I can tell when I am finished" }
          ]
        }
      ]
    },
    {
      "key": "stack",
      "title": "Stack",
      "intro": "Pick tools that get out of the way. You can change any of this later.",
      "blocks": [
        {
          "kind": "text",
          "body": "For a first project the stack matters far less than picking one and stopping. Next.js for the app, Tailwind for styling, Vercel to host it. Add a database only if your idea actually stores something."
        },
        {
          "kind": "code",
          "language": "bash",
          "code": "npx create-next-app@latest my-project",
          "expected": "A series of questions, then a my-project folder with node_modules installed. Answer yes to TypeScript, yes to Tailwind, yes to App Router."
        },
        {
          "kind": "code",
          "language": "bash",
          "code": "cd my-project\nnpm run dev",
          "expected": "Local: http://localhost:3000 — open it and you should see the Next.js starter page."
        },
        {
          "kind": "callout",
          "tone": "tip",
          "body": "If localhost:3000 shows the starter page, the hard part of setup is already behind you. Everything from here is editing files and refreshing."
        },
        {
          "kind": "checklist",
          "tasks": [
            { "id": "stack-created", "label": "Created the project with create-next-app" },
            { "id": "stack-running", "label": "Seen the starter page at localhost:3000" },
            { "id": "stack-edited", "label": "Changed some text in app/page.tsx and watched it update" }
          ]
        }
      ]
    },
    {
      "key": "deploy",
      "title": "Deploy",
      "intro": "Deploy on day one, while there is nothing to lose. Do not save it for the end.",
      "blocks": [
        {
          "kind": "text",
          "body": "Deploying early means every change after this is a small, safe step instead of one terrifying leap at the end. It also means you have a real URL to send someone the moment it is worth sending."
        },
        {
          "kind": "code",
          "language": "bash",
          "code": "git init\ngit add -A\ngit commit -m \"first commit\"",
          "expected": "create mode ... lines for each file, and a commit hash. If git complains about your name or email, set them with git config and run the commit again."
        },
        {
          "kind": "text",
          "body": "Now make an empty repository on GitHub, then connect it and push. GitHub shows you the exact two commands on the page right after you create it."
        },
        {
          "kind": "text",
          "body": "With the code on GitHub, go to vercel.com, choose Add New Project, and pick the repository. Accept every default and press Deploy. When it finishes you have a live URL."
        },
        {
          "kind": "callout",
          "tone": "tip",
          "body": "From now on, every push to your main branch deploys automatically. That is the whole workflow — there is no separate deploy step to remember."
        },
        {
          "kind": "checklist",
          "tasks": [
            { "id": "deploy-git", "label": "Made the first commit" },
            { "id": "deploy-github", "label": "Pushed the repository to GitHub" },
            { "id": "deploy-vercel", "label": "Deployed on Vercel and opened the live URL" },
            { "id": "deploy-second", "label": "Pushed a second change and watched it deploy itself" }
          ]
        }
      ]
    },
    {
      "key": "launch",
      "title": "Launch",
      "intro": "The last mile: make it yours, then tell one person.",
      "blocks": [
        {
          "kind": "text",
          "body": "Nothing here is technically hard. It is the part everyone skips, and it is the difference between a folder on your laptop and something that exists."
        },
        {
          "kind": "prompt",
          "label": "Ask for a pre-launch review",
          "prompt": "Here is my first web project: [paste your URL].\n\nLook at it as a stranger would and tell me:\n1. Within five seconds, is it obvious what this does?\n2. Anything visibly broken or half-finished?\n3. The single highest-value thing I could fix in under thirty minutes?\n\nDo not suggest new features. I am trying to finish, not start again."
        },
        {
          "kind": "checklist",
          "tasks": [
            { "id": "launch-title", "label": "Set the page title and description so it is not Create Next App" },
            { "id": "launch-mobile", "label": "Opened it on a phone and fixed anything obviously broken" },
            { "id": "launch-placeholder", "label": "Removed every piece of leftover starter content" },
            { "id": "launch-share", "label": "Sent the URL to one actual human being" }
          ]
        },
        {
          "kind": "callout",
          "tone": "info",
          "body": "That last task is the one that counts. A project nobody has seen is still a draft. Once someone has opened it, you have shipped, and the next one is meaningfully easier."
        }
      ]
    }
  ]'::jsonb
)
on conflict (slug) do update set
  title      = excluded.title,
  kind       = excluded.kind,
  role_level = excluded.role_level,
  status     = excluded.status,
  steps      = excluded.steps,
  updated_at = now();

-- Recommended tools panel (VIB-46). Resolved by slug so a tool that was never
-- seeded is simply skipped rather than failing the file.
delete from wizard_recommended_tools
where wizard_id in (select id from wizards where slug = 'ship-your-first-web-project');

insert into wizard_recommended_tools (wizard_id, tool_id)
select w.id, t.id
from wizards w
join tools t on t.slug in ('nextjs', 'shadcn-ui', 'vercel', 'supabase', 'claude-code', 'claude', 'gemini', 'gpt')
where w.slug = 'ship-your-first-web-project'
on conflict do nothing;

-- Editorial pillars (VIB-90). Applied as an update keyed on slug rather than
-- inline in the insert above, for the same reason content_tags is: the mapping
-- is an editorial decision that changes independently of the prose, and it
-- reads as a list you can check against the Learn hub.
--
-- The four help_* rows are deliberately absent. They are product documentation
-- sharing the content table (§34), not editorial, and belong to no pillar.
-- Walkthroughs and Founder playbook have nothing yet — the pillars exist ahead
-- of the writing, not the other way round.
update content c set pillar = v.pillar::content_pillar
from (values
  ('what-vibe-coding-is','fundamentals'),
  ('git-commands-worth-memorising','fundamentals'),
  ('course-git-for-beginners','fundamentals'),
  ('course-fullstack-fundamentals','fundamentals'),
  ('rls-is-the-boundary','fundamentals'),
  ('reviewing-code-you-did-not-write','fundamentals'),
  ('why-ai-forgets-context','context_engineering'),
  ('prompts-for-better-code','prompt_engineering'),
  ('choosing-your-first-setup','tool_reviews')
) as v(slug, pillar)
where c.slug = v.slug;

-- Audience moves off the tag and onto tools.best_for (VIB-87).
--
-- The six tools below carried a `beginner-friendly` tag; that is the same
-- claim the column makes, and two mechanisms for one idea is what caused the
-- free-tier bug in VIB-81. The tag row itself stays — Learn content still
-- uses it, and only the *tool* links were the duplicate.
--
-- Every other tool is left null: "who is this for" is an editorial judgement
-- per tool, and a guess printed on a real product's page is worse than an
-- absent row. Set them in /admin/tools.
update tools t set best_for = 'beginner'
where t.slug in ('claude-ai','chatgpt','cursor','vs-code','create-t3-app','zapier');

-- Platform and the remaining audience tiers (VIB-87), reviewed by Ali
-- 2026-09-04.
--
-- Nine rows are deliberately blank: AutoGen, LangChain, the Claude Agent SDK,
-- Next.js, shadcn/ui, Create T3 App, Agent Skills, Superpowers and the two
-- model entries. A library runs wherever its runtime does, so "macOS ·
-- Windows · Linux" on it is true and tells a reader nothing, and a model is
-- not software you install. An absent row beats a noise row.
update tools t set platform = v.platform
from (values
  ('cursor', array['macos','windows','linux']),
  ('vs-code', array['macos','windows','linux']),
  ('aider', array['macos','windows','linux']),
  ('claude-code', array['macos','windows','linux']),
  ('continue', array['macos','windows','linux']),
  ('github-copilot', array['macos','windows','linux']),
  ('playwright-mcp', array['macos','windows','linux']),
  ('supabase-mcp-server', array['macos','windows','linux']),
  ('supabase', array['web']),
  ('vercel', array['web']),
  ('resend', array['web']),
  ('zapier', array['web']),
  ('n8n', array['web']),
  -- Cloud plus self-host; two answers, and both are true.
  ('typesense', array['web','linux']),
  ('chatgpt', array['web','ios','android']),
  ('claude-ai', array['web','ios','android']),
  ('gemini', array['web','ios','android'])
) as v(slug, platform)
where t.slug = v.slug;

update tools t set best_for = v.best_for::role_level
from (values
  ('claude','beginner'),
  ('gemini','beginner'),
  ('github-copilot','beginner'),
  ('vercel','beginner'),
  ('claude-code','intermediate'),
  ('aider','intermediate'),
  ('continue','intermediate'),
  ('nextjs','intermediate'),
  ('shadcn-ui','intermediate'),
  ('supabase','intermediate'),
  ('resend','intermediate'),
  ('n8n','intermediate'),
  ('langchain','intermediate'),
  ('agent-skills','intermediate'),
  ('playwright-mcp','intermediate'),
  ('supabase-mcp-server','intermediate'),
  ('autogen','expert'),
  ('claude-agent-sdk','expert'),
  ('superpowers','expert'),
  ('typesense','expert')
) as v(slug, best_for)
where t.slug = v.slug;

-- Live specs for the seeded model families (VIB-107). Each lists every model
-- OpenRouter has under the prefix; the featured one leads. Staff can change
-- either in the editor.
update tools t set openrouter_family = v.family, openrouter_id = v.featured
from (values
  ('claude', 'anthropic/claude', 'anthropic/claude-sonnet-5'),
  ('gemini', 'google/gemini', 'google/gemini-3.8-flash')
) as v(slug, family, featured)
where t.slug = v.slug;

-- "Works with" links between existing entries (VIB-109). Only connections that
-- are true today: both models are in Cursor, Copilot's model menu, Continue
-- and Aider; the MCP servers work from any MCP client. Upserted on the pair,
-- so re-running this corrects a kind or note instead of failing.
insert into tool_links (tool_id, linked_tool_id, kind, note, sort_order)
select a.id, b.id, v.kind::tool_link_kind, v.note, v.sort_order
from (values
  ('claude', 'claude-code', 'official', 'terminal, desktop, web and IDE', 0),
  ('claude', 'claude-ai', 'official', null, 1),
  ('claude', 'claude-agent-sdk', 'official', 'build your own agents', 2),
  ('claude', 'cursor', 'runs_in', null, 0),
  ('claude', 'vs-code', 'runs_in', 'via the Claude Code extension', 1),
  ('claude', 'github-copilot', 'runs_in', 'in the model picker', 2),
  ('claude', 'continue', 'runs_in', 'bring your own key', 3),
  ('claude', 'aider', 'runs_in', 'bring your own key', 4),
  ('claude', 'superpowers', 'pairs_with', null, 0),
  ('claude', 'agent-skills', 'pairs_with', null, 0),
  ('claude', 'supabase-mcp-server', 'pairs_with', null, 0),
  ('claude', 'playwright-mcp', 'pairs_with', null, 0),
  ('claude', 'nextjs', 'pairs_with', null, 0),
  ('claude', 'shadcn-ui', 'pairs_with', null, 0),
  ('gemini', 'cursor', 'runs_in', null, 0),
  ('gemini', 'vs-code', 'runs_in', 'via Gemini Code Assist', 1),
  ('gemini', 'github-copilot', 'runs_in', 'in the model picker', 2),
  ('gemini', 'continue', 'runs_in', 'bring your own key', 3),
  ('gemini', 'aider', 'runs_in', 'bring your own key', 4),
  ('gemini', 'supabase-mcp-server', 'pairs_with', null, 0),
  ('gemini', 'playwright-mcp', 'pairs_with', null, 0),
  ('gemini', 'nextjs', 'pairs_with', null, 0),
  ('gemini', 'shadcn-ui', 'pairs_with', null, 0)
) as v(tool, linked, kind, note, sort_order)
join tools a on a.slug = v.tool
join tools b on b.slug = v.linked
on conflict (tool_id, linked_tool_id) do update
  set kind = excluded.kind, note = excluded.note, sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- The ecosystem model pages link to (VIB-110)
--
-- Every entry below was checked against its own site or repository on
-- 2026-09-11. Windsurf is listed under its current name: Cognition renamed it
-- Devin Desktop on 2026-06-02 and windsurf.com redirects there; the old name
-- stays in the tagline so searching "Windsurf" still finds it. Higgsfield's
-- pricing is left unstated rather than guessed.
insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url) values
  ('GPT', 'gpt', 'models',
   'OpenAI''s model family, behind ChatGPT and Codex.',
   'GPT is OpenAI''s family of large language models. For vibe coders it is the model behind ChatGPT and the Codex coding agent, and it is available in nearly every AI editor.',
   'Freemium', 'https://platform.openai.com/docs/models'),

  ('Claude Design', 'claude-design', 'tools',
   'Anthropic''s design tool: prompts in, prototypes and slides out.',
   'Describe a landing page, prototype or deck and Claude builds a first version you refine by conversation or direct edits. It can apply your design system, so results match your product. Part of Anthropic Labs, on paid Claude plans.',
   'Paid', 'https://claude.com/product/design'),
  ('Gemini CLI', 'gemini-cli', 'clis',
   'Google''s open-source agent for Gemini in your terminal.',
   'Reads, edits and runs your project from the command line with Gemini models, with Google Search grounding and MCP support. A personal Google account gets a free daily allowance.',
   'Open source', 'https://github.com/google-gemini/gemini-cli'),
  ('Codex', 'codex', 'clis',
   'OpenAI''s coding agent in your terminal, IDE and ChatGPT.',
   'Codex reads your codebase, edits files and runs commands from plain-language requests. The CLI is open source; the same agent runs in the desktop app, IDE extensions and ChatGPT on the web.',
   'Open source', 'https://openai.com/codex/'),

  ('Devin Desktop', 'devin-desktop', 'ides',
   'The AI editor formerly called Windsurf.',
   'Windsurf, renamed by Cognition in June 2026. The same agentic editor with Cascade, now alongside Devin for running agents on whole tasks. Lets you pick between Claude, GPT and Gemini models.',
   'Freemium', 'https://devin.ai/desktop'),
  ('WebStorm', 'webstorm', 'ides',
   'JetBrains'' IDE for JavaScript and TypeScript.',
   'A full JavaScript and TypeScript IDE with deep refactoring. JetBrains AI Assistant brings Claude, GPT and Gemini models into it, and Claude Code has a JetBrains plugin. Free for non-commercial use.',
   'Freemium', 'https://www.jetbrains.com/webstorm/'),
  ('Kilo Code', 'kilo-code', 'plugins',
   'Open-source coding agent for VS Code, JetBrains and the terminal.',
   'An agent that plans, writes and refactors code inside your editor. Pick from hundreds of models — Claude, GPT, Gemini, open models — and pay the provider''s rate, or bring your own key.',
   'Open source', 'https://kilo.ai'),
  ('OpenCode', 'opencode', 'clis',
   'Open-source coding agent for the terminal, any provider.',
   'A terminal-first agent with Plan and Build modes, LSP diagnostics and MCP support. Bring your own provider — Anthropic, OpenAI, Google and more — and pay only for what you use.',
   'Open source', 'https://opencode.ai'),

  ('OpenRouter', 'openrouter', 'utilities',
   'One API key for hundreds of models.',
   'A single OpenAI-compatible API in front of every major model provider, with prices and uptime side by side. The live model specs on Viberation''s model pages come from its public API.',
   'Freemium', 'https://openrouter.ai'),
  ('OmniRoute', 'omniroute', 'utilities',
   'Free, self-hosted gateway that routes across AI providers.',
   'An MIT-licensed gateway that puts hundreds of providers behind one local OpenAI-compatible endpoint, falling back automatically when one runs out of quota. Works with Claude Code, Codex, Cursor and OpenCode.',
   'Open source', 'https://github.com/diegosouzapw/OmniRoute'),

  ('Lovable', 'lovable', 'app_builders',
   'Describe an app, get a working full-stack build.',
   'A browser-based app builder: you describe what you want and refine it in conversation until it matches. Built on Claude. The quickest route from idea to something clickable if you would rather not touch an editor yet.',
   'Freemium', 'https://lovable.dev'),
  ('Replit', 'replit', 'app_builders',
   'Build, run and deploy from the browser with Replit Agent.',
   'A browser IDE with hosting built in. Replit Agent, powered by Claude, builds an app from a description and deploys it without you setting up anything locally.',
   'Freemium', 'https://replit.com'),

  ('Vercel MCP', 'vercel-mcp', 'mcp_servers',
   'Let your agent check deployments, logs and docs on Vercel.',
   'Vercel''s official remote MCP server. Your agent can search Vercel docs, manage projects and deployments, and read logs, signed in over OAuth.',
   'Free', 'https://vercel.com/docs/mcp/vercel-mcp'),
  ('Netlify MCP', 'netlify-mcp', 'mcp_servers',
   'Let your agent deploy and manage Netlify sites.',
   'Netlify''s official MCP server. Your agent can create and deploy sites, and manage their settings and extensions, from the same session as the code.',
   'Free', 'https://github.com/netlify/netlify-mcp'),
  ('GitHub MCP Server', 'github-mcp-server', 'mcp_servers',
   'Let your agent work with repos, issues, PRs and Actions.',
   'GitHub''s official MCP server. Your agent can read code, open and update issues and pull requests, and check why a CI run failed.',
   'Open source', 'https://github.com/github/github-mcp-server'),
  ('Linear MCP', 'linear-mcp', 'mcp_servers',
   'Let your agent read and update your Linear issues.',
   'Linear''s official hosted MCP server. Your agent can find, create and update issues, projects and comments, so the ticket and the code change stay in step.',
   'Free', 'https://linear.app/docs/mcp'),
  ('Notion MCP', 'notion-mcp', 'mcp_servers',
   'Let your agent read and write your Notion workspace.',
   'Notion''s official hosted MCP server. Your agent can search, read and update the pages and databases you can access — specs, notes and docs included.',
   'Free', 'https://developers.notion.com/guides/mcp/overview'),
  ('Firecrawl MCP', 'firecrawl-mcp', 'mcp_servers',
   'Give your agent clean web pages, search and docs.',
   'Firecrawl''s official MCP server. Your agent can search the web and scrape pages back as clean Markdown, which is how it reads current docs instead of guessing from memory.',
   'Open source', 'https://docs.firecrawl.dev/mcp-server'),

  ('Taste Skill', 'taste-skill', 'skills',
   'Stops your agent from producing generic-looking UI.',
   'A frontend design skill that pushes an agent toward a committed visual direction — layout, typography and motion — instead of the default look every AI page builder shares.',
   'Open source', 'https://github.com/Leonxlnx/taste-skill'),
  ('UI/UX Pro Max', 'ui-ux-pro-max', 'skills',
   'Searchable design knowledge your agent can draw on.',
   'A skill that gives an agent databases of UI styles, colour palettes, font pairings and UX guidelines to choose from while building an interface. Free core, with a paid tier for brand assets.',
   'Freemium', 'https://github.com/nextlevelbuilder/ui-ux-pro-max-skill'),
  ('gstack', 'gstack', 'skills',
   'Garry Tan''s Claude Code setup: a team of specialist roles.',
   'An open-source pack of slash-command skills that turn one agent into roles — product review, engineering planning, code review, QA with a real browser, release.',
   'Open source', 'https://github.com/garrytan/gstack'),
  ('graphify', 'graphify', 'skills',
   'Turn a codebase into a knowledge graph your agent can query.',
   'A skill that maps code, docs and schemas into a graph with every relationship explained, so the agent answers questions about a large project without rereading every file.',
   'Open source', 'https://github.com/Graphify-Labs/graphify'),

  ('Slack', 'slack', 'tools',
   'Team chat, and a place to talk to Claude at work.',
   'The chat tool most teams already use. The Claude app for Slack lets you ask Claude questions in threads and DMs without switching windows.',
   'Freemium', 'https://slack.com'),
  ('ClickUp', 'clickup', 'tools',
   'Tasks, docs and planning in one workspace.',
   'Project management with tasks, docs and goals. Its official MCP server lets an agent create and update tasks and read docs from inside your editor.',
   'Freemium', 'https://clickup.com'),
  ('Higgsfield', 'higgsfield', 'tools',
   'AI image and video generation across many models.',
   'A production platform for AI video and images that puts many generation models in one place. Its MCP server and skills let an agent generate visual assets for the project it is building.',
   null, 'https://higgsfield.ai')
on conflict (slug) do update set
  name         = excluded.name,
  category     = excluded.category,
  tagline      = excluded.tagline,
  description  = excluded.description,
  pricing_tier = excluded.pricing_tier,
  outbound_url = excluded.outbound_url,
  updated_at   = now();

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('gpt','code-generation'), ('gpt','free-tier'),
  ('claude-design','design'), ('claude-design','frontend'),
  ('gemini-cli','open-source'), ('gemini-cli','code-generation'), ('gemini-cli','free-tier'),
  ('codex','open-source'), ('codex','code-generation'),
  ('devin-desktop','code-generation'), ('devin-desktop','free-tier'),
  ('webstorm','frontend'),
  ('kilo-code','open-source'), ('kilo-code','code-generation'),
  ('opencode','open-source'), ('opencode','code-generation'),
  ('openrouter','backend'), ('openrouter','free-tier'),
  ('omniroute','open-source'), ('omniroute','backend'),
  ('lovable','web-apps'), ('lovable','free-tier'),
  ('replit','web-apps'), ('replit','deployment'), ('replit','free-tier'),
  ('vercel-mcp','deployment'),
  ('netlify-mcp','deployment'), ('netlify-mcp','open-source'),
  ('github-mcp-server','open-source'),
  ('linear-mcp','automation'),
  ('notion-mcp','automation'),
  ('firecrawl-mcp','open-source'),
  ('taste-skill','design'), ('taste-skill','frontend'), ('taste-skill','open-source'),
  ('ui-ux-pro-max','design'), ('ui-ux-pro-max','frontend'),
  ('gstack','open-source'), ('gstack','automation'),
  ('graphify','open-source'),
  ('slack','automation'),
  ('clickup','automation'),
  ('higgsfield','design')
) as m(tool_slug, tag_slug)
join tools t on t.slug = m.tool_slug
join tags  g on g.slug = m.tag_slug
on conflict do nothing;

-- GPT gets live specs like Claude and Gemini. No featured model: the newest
-- in the family leads until staff pick one.
update tools set openrouter_family = 'openai/gpt' where slug = 'gpt';

-- Links to the new entries. `shared` applies to all three model families —
-- the editors, agents and gateways below run any of them, and MCP servers
-- work from any MCP client. `specific` is what is only true of one.
insert into tool_links (tool_id, linked_tool_id, kind, note, sort_order)
select a.id, b.id, v.kind::tool_link_kind, v.note, v.sort_order
from (
  select m.model as tool, s.linked, s.kind, s.note, s.sort_order
  from (values ('claude'), ('gemini'), ('gpt')) as m(model)
  cross join (values
    ('cursor', 'runs_in', null, 0),
    ('github-copilot', 'runs_in', 'in the model picker', 2),
    ('continue', 'runs_in', 'bring your own key', 3),
    ('aider', 'runs_in', 'bring your own key', 4),
    ('devin-desktop', 'runs_in', 'formerly Windsurf', 5),
    ('webstorm', 'runs_in', 'via JetBrains AI Assistant', 6),
    ('kilo-code', 'runs_in', 'bring your own key', 7),
    ('opencode', 'runs_in', 'bring your own key', 8),
    ('openrouter', 'runs_in', 'one API for every model', 9),
    ('omniroute', 'runs_in', 'self-hosted gateway', 10),
    ('supabase-mcp-server', 'pairs_with', null, 0),
    ('playwright-mcp', 'pairs_with', null, 0),
    ('vercel-mcp', 'pairs_with', null, 0),
    ('netlify-mcp', 'pairs_with', null, 0),
    ('github-mcp-server', 'pairs_with', null, 0),
    ('linear-mcp', 'pairs_with', null, 0),
    ('notion-mcp', 'pairs_with', null, 0),
    ('firecrawl-mcp', 'pairs_with', null, 0),
    ('graphify', 'pairs_with', null, 0),
    ('nextjs', 'pairs_with', null, 0),
    ('shadcn-ui', 'pairs_with', null, 0),
    ('clickup', 'pairs_with', 'via the ClickUp MCP server', 0),
    ('higgsfield', 'pairs_with', 'via the Higgsfield MCP server', 0)
  ) as s(linked, kind, note, sort_order)
  union all
  select * from (values
    ('claude', 'claude-design', 'official', 'prototypes, slides, one-pagers', 3),
    ('claude', 'lovable', 'runs_in', 'powers the app builder', 11),
    ('claude', 'replit', 'runs_in', 'powers Replit Agent', 12),
    ('claude', 'taste-skill', 'pairs_with', null, 0),
    ('claude', 'ui-ux-pro-max', 'pairs_with', null, 0),
    ('claude', 'gstack', 'pairs_with', null, 0),
    ('claude', 'slack', 'pairs_with', 'the Claude app for Slack', 0),
    ('gemini', 'gemini-cli', 'official', 'free daily allowance', 0),
    ('gpt', 'chatgpt', 'official', null, 0),
    ('gpt', 'codex', 'official', 'terminal, desktop, web and IDE', 1),
    ('gpt', 'vs-code', 'runs_in', 'via the Codex extension', 1),
    ('gpt', 'superpowers', 'pairs_with', 'in Codex', 0)
  ) as x(tool, linked, kind, note, sort_order)
) v
join tools a on a.slug = v.tool
join tools b on b.slug = v.linked
on conflict (tool_id, linked_tool_id) do update
  set kind = excluded.kind, note = excluded.note, sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Starter prompts on model pages (VIB-111)
--
-- Four per family: context file, planning or coding, design, debugging. Each
-- leans on something real about that model's tooling — Claude Code reads
-- CLAUDE.md and Anthropic recommends XML tags for structure, Codex reads
-- AGENTS.md, Gemini CLI loads GEMINI.md and Gemini's long context suits
-- reading a whole repo. `prompts` has no natural key, so re-running skips a
-- title the tool already has instead of duplicating it.
insert into prompts (title, prompt_text, tool_id, use_case_category)
select v.title, v.prompt_text, t.id, v.category
from (values
  ('claude', 'Plan before any code', 'planning',
'Before you write any code, read the files this touches and reply with a short plan:

1. What you will change, file by file
2. What could break, and why
3. How we will check it works

Do not edit anything until I say go.

<task>
[Describe the feature or fix in a sentence or two]
</task>'),
  ('claude', 'Write a CLAUDE.md for this project', 'context',
'Read this repository and write a CLAUDE.md at its root for future sessions. Keep it under 60 lines and include only what you could not work out quickly from the code:

- How to install, run, test and build (exact commands)
- Where things live, and any folder with a rule attached
- Conventions a newcomer would get wrong
- Things never to do here

Ask me about anything you are unsure of instead of guessing.'),
  ('claude', 'UI that does not look AI-generated', 'design',
'Design [the page or component] for [who it is for].

Commit to one clear visual direction and tell me what it is in one line before you build. Avoid the defaults every AI tool reaches for: purple gradients, one font everywhere, three identical feature cards, emoji as icons.

<constraints>
- Use the design tokens and components already in this project
- Mobile first; nothing may scroll sideways at 375px wide
- Text must meet WCAG AA contrast in light and dark mode
</constraints>'),
  ('claude', 'Find the root cause, not a patch', 'debugging',
'Something is broken.

<symptom>
[What you see, and the exact error message]
</symptom>

<steps>
[How to make it happen]
</steps>

Do not fix anything yet. Find every place that calls the code involved, work out the actual cause, and explain it in two or three sentences. Then propose the smallest fix at the cause, plus one check that would have caught it.'),

  ('gpt', 'Write an AGENTS.md for this repo', 'context',
'Read this repository and write an AGENTS.md at its root so Codex and other agents know how to work here. Keep it short and specific:

- Setup, test, lint and build commands, exactly as they run
- Project layout, and which folders have rules attached
- Code style and naming conventions to follow
- What to check before calling a task done

Only include what is true of this repo. Mark anything you are unsure of with a question.'),
  ('gpt', 'One small, reviewable change', 'coding',
'Implement this as the smallest change that fully works:

[Describe the feature]

Rules:
- Reuse what already exists in the codebase before adding anything new
- No new dependencies unless you ask first
- Add or update one test that fails without your change
- Finish with a short summary: files changed, what to check, anything you skipped'),
  ('gpt', 'Screenshot to component', 'design',
'I am attaching a screenshot of [the screen]. Build it as a [React / Next.js] component using this project''s existing components and styles.

Match layout, spacing and hierarchy, not exact pixels. List anything the screenshot does not show clearly or that you had to guess (hover states, empty states, the mobile layout) and ask me about it rather than inventing it.'),
  ('gpt', 'Reproduce, then fix', 'debugging',
'Bug: [what goes wrong, and the exact error]

1. Write a failing test that reproduces it
2. Find the cause, not just the line that throws
3. Fix it at the cause
4. Run that test and the rest of the suite, and show me the output

If you cannot reproduce it, stop and tell me what you tried.'),

  ('gemini', 'Write a GEMINI.md for this project', 'context',
'Read this repository and write a GEMINI.md at its root, the context file Gemini CLI loads at the start of every session. Keep it brief:

- How to run, test and build, with exact commands
- Where the important code lives
- Conventions and rules that are easy to miss
- Things never to do in this repo

Leave out anything the code already makes obvious.'),
  ('gemini', 'Map a codebase you just inherited', 'planning',
'I am new to this codebase. Read all of it, then give me:

1. What the app does, in three sentences
2. The main parts, and how a request flows through them
3. The five files I should read first, and why
4. Anything that looks risky, unfinished or inconsistent

Cite a file path for every claim so I can check it.'),
  ('gemini', 'Sketch or screenshot to layout', 'design',
'I am attaching [a sketch / a screenshot]. Turn it into a responsive layout for [the page] using this project''s components.

Before writing code, describe the structure you see: sections, hierarchy, what repeats. Then build it mobile first. Call out anything the image does not show — hover states, empty states, errors — instead of making it up.'),
  ('gemini', 'Review my changes before I commit', 'debugging',
'Review the uncommitted changes in this repository as a careful senior engineer would.

For each problem, give the file and line, what goes wrong, and a concrete scenario that triggers it. Focus on bugs, security and missing edge cases; skip style nitpicks. If you find nothing serious, say so plainly.')
) as v(tool, title, category, prompt_text)
join tools t on t.slug = v.tool
where not exists (
  select 1 from prompts p where p.tool_id = t.id and p.title = v.title
);

-- ---------------------------------------------------------------------------
-- The skills hub (VIB-130)
--
-- Package managers, directories and guides for agent skills, surfaced on
-- /skills through the `skills-ecosystem` tag. Every entry was checked against
-- its own site or repository on 2026-09-13. Pricing is stated only where the
-- site states it.
insert into tags (name, slug) values
  ('Skills ecosystem', 'skills-ecosystem')
on conflict (slug) do update set name = excluded.name;

insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url) values
  ('skills CLI', 'skills-cli', 'clis',
   'Install any agent skill with one npx command.',
   'The open-source command behind skills.sh. Run npx skills add with a GitHub repository and it copies the skill into Claude Code, Cursor, Codex, Copilot or whichever agents you pick, and can list, update and remove them later.',
   'Open source', 'https://github.com/vercel-labs/skills'),
  ('SkillKit', 'skillkit', 'clis',
   'Install skills once and use them in every agent.',
   'An open-source CLI that installs, translates and shares skills across coding agents, so a skill written for Claude Code also works in Cursor, Codex and Copilot without rewriting it by hand.',
   'Open source', 'https://skillkit.sh'),
  ('skild', 'skild', 'clis',
   'A package manager for skills, with versions and team sync.',
   'Think npm for agent skills: install, update, sync and publish skills from the terminal, with versions so a whole team runs the same ones. MIT licensed, with a public hub for finding skills.',
   'Open source', 'https://skild.sh'),

  ('skills.sh', 'skills-sh', 'utilities',
   'The open leaderboard of agent skills, with security audits.',
   'Ranks skills by real installs from the skills CLI and runs each one past independent scanners such as Snyk and Socket. The install counts and security checks on Viberation''s skill pages come from here.',
   'Free', 'https://skills.sh'),
  ('SkillsMP', 'skillsmp', 'utilities',
   'Search a very large index of open-source skills.',
   'A marketplace that indexes SKILL.md files from public GitHub repositories, searchable by keyword, category and occupation, with stars and last activity on each result.',
   'Free', 'https://skillsmp.com'),
  ('Awesome Skills', 'awesome-skills', 'utilities',
   'A skills marketplace with a risk score on every entry.',
   'Browse skills for Claude, Codex and ChatGPT by category, with a security score that flags risky patterns such as sudo in a SKILL.md before you install anything.',
   null, 'https://awesomeskill.ai'),
  ('SkillsLLM', 'skillsllm', 'utilities',
   'Browse security-vetted skills for Claude Code and Codex.',
   'A directory of open-source agent skills, MCP servers and CLI tools for Claude Code, Codex CLI and ChatGPT, with a vetting pass on what it lists.',
   null, 'https://skillsllm.com'),
  ('Awesome Claude Skills', 'awesome-claude-skills', 'utilities',
   'A long, curated GitHub list of skills and skill resources.',
   'A community-maintained list of Claude skills, tutorials and tools, sorted by what they help with. A good place to browse when you know the job but not the skill.',
   'Open source', 'https://github.com/ComposioHQ/awesome-claude-skills'),

  ('Anthropic Skills', 'anthropic-skills', 'skills',
   'Anthropic''s own skills, from frontend design to documents.',
   'The official skills repository from Anthropic: frontend design, skill creation, Word, PowerPoint, Excel and PDF handling, and more. Also the clearest set of examples to copy when you write your own.',
   'Open source', 'https://github.com/anthropics/skills')
on conflict (slug) do update set
  name         = excluded.name,
  category     = excluded.category,
  tagline      = excluded.tagline,
  description  = excluded.description,
  pricing_tier = excluded.pricing_tier,
  outbound_url = excluded.outbound_url,
  updated_at   = now();

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('skills-cli','skills-ecosystem'), ('skills-cli','open-source'),
  ('skillkit','skills-ecosystem'), ('skillkit','open-source'),
  ('skild','skills-ecosystem'), ('skild','open-source'),
  ('skills-sh','skills-ecosystem'),
  ('skillsmp','skills-ecosystem'),
  ('awesome-skills','skills-ecosystem'),
  ('skillsllm','skills-ecosystem'),
  ('awesome-claude-skills','skills-ecosystem'), ('awesome-claude-skills','open-source'),
  ('anthropic-skills','skills-ecosystem'), ('anthropic-skills','design'), ('anthropic-skills','open-source'),
  ('agent-skills','skills-ecosystem')
) as m(tool_slug, tag_slug)
join tools t on t.slug = m.tool_slug
join tags  g on g.slug = m.tag_slug
on conflict do nothing;

-- Live installs, audits and files (VIB-130). A repository alone is a pack:
-- installs are summed across its skills and there is no single SKILL.md.
-- graphify is listed on skills.sh under its old owner; GitHub redirects that
-- to Graphify-Labs, so the facts are the same repository's.
update tools t set skills_sh_source = v.source
from (values
  ('superpowers', 'obra/superpowers'),
  ('ui-ux-pro-max', 'nextlevelbuilder/ui-ux-pro-max-skill/ui-ux-pro-max'),
  ('taste-skill', 'Leonxlnx/taste-skill'),
  ('gstack', 'garrytan/gstack'),
  ('graphify', 'safishamsi/graphify/graphify'),
  ('anthropic-skills', 'anthropics/skills')
) as v(slug, source)
where t.slug = v.slug;

insert into content (type, title, slug, body, role_level, audience, status, pillar) values
  ('guide', 'What an agent skill is', 'what-an-agent-skill-is',
   'A skill is a folder with a SKILL.md file in it. The file starts with a name and a one-line description, followed by instructions written for the agent.

Your agent reads only the descriptions up front. When a task matches one, it loads that skill''s full instructions, plus any scripts or reference files in the folder. So you can install dozens of skills without filling the context window.

Why bother? A skill turns "how we do this here" into something the agent follows every time. A good design skill stops the generic look. A good debugging skill makes it find the cause before it edits anything. You stop re-explaining the same method each session.

Skills started with Claude and are now an open format. Codex, Cursor, GitHub Copilot and other agents read the same SKILL.md, so one skill works across tools.

Where to start: pick one skill for the thing your agent does worst, install it, and watch whether the results change. Add the next one only when that one earns its place.',
   'beginner', null, 'published', 'context_engineering'),

  ('guide', 'Installing skills safely', 'installing-skills-safely',
   'A skill is instructions your agent will follow, and sometimes scripts it will run with your permissions. Treat installing one like adding a dependency, not like bookmarking a page.

Before you install:

1. Read the SKILL.md. It is usually short. If it tells the agent to run commands, fetch URLs or touch files outside your project, make sure that is what you expect.

2. Look inside the folder. Scripts are where real risk lives. A skill that is only text is far lower risk than one that ships a shell script.

3. Check the security results. skills.sh runs every listed skill past independent scanners and shows pass, warning or fail on the skill''s page. A warning is a reason to read closer, not an automatic no.

4. Prefer maintained sources. Recent commits, an open licence and an author you can identify all count. An abandoned fork of a popular skill does not inherit its reputation.

To install, the skills CLI does the copying for you:

npx skills add https://github.com/owner/repo --skill skill-name

It asks which agents to add the skill to. Project skills live in the repository, so your team gets them through git and can review changes like any other code. Personal skills live in your home folder and only affect you.

After an update, read the diff before you trust it again. The skill you checked is not automatically the skill you have today.',
   'intermediate', null, 'published', 'context_engineering'),

  ('guide', 'Writing your first skill', 'writing-your-first-skill',
   'You already have a skill in you: the thing you keep typing into every session. Write it down once.

1. Make a folder named after the job, such as release-notes, and put a SKILL.md inside it.

2. Start the file with a short header: a name, and a description that says when to use it. The description is what the agent matches tasks against, so be specific. "Use when writing release notes from merged pull requests" beats "Helps with docs".

3. Below the header, write the method as steps. Say what good output looks like, what to check before finishing, and what never to do. Write for a capable colleague who has never seen your project.

4. Keep it short. Move long reference material into separate files in the folder and point to them, so the agent loads them only when it needs them.

5. Test it on a real task. When the agent goes wrong, fix the instruction that let it, not just the output.

Put project skills in the repository so the whole team shares them. Anthropic''s skills repository has well-written examples to copy, including a skill whose whole job is helping you write new skills.',
   'intermediate', null, 'published', 'context_engineering')
on conflict (slug) do nothing;

insert into content_tags (content_id, tag_id)
select c.id, g.id
from (values
  ('what-an-agent-skill-is','skills-ecosystem'), ('what-an-agent-skill-is','beginner-friendly'),
  ('installing-skills-safely','skills-ecosystem'),
  ('writing-your-first-skill','skills-ecosystem'), ('writing-your-first-skill','automation')
) as m(content_slug, tag_slug)
join content c on c.slug = m.content_slug
join tags    g on g.slug = m.tag_slug
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Skill categories and places to sell skills (VIB-132)
--
-- Categories are editorial: neither skills.sh nor SkillsMP publishes one.
-- Agent Skills is a docs page, not a skill, so it stays unfiled. No skill is
-- marked as excluded from any agent: that is only set once someone has
-- actually seen it fail there.
update tools t set skill_category = v.category::skill_category
from (values
  ('superpowers', 'planning_workflow'),
  ('gstack', 'planning_workflow'),
  ('ui-ux-pro-max', 'design_ui'),
  ('taste-skill', 'design_ui'),
  ('graphify', 'data_analysis'),
  ('anthropic-skills', 'documents_office')
) as v(slug, category)
where t.slug = v.slug;

-- External marketplaces, linked out to. Viberation does not sell skills
-- itself. Checked against each site on 2026-09-13.
insert into tags (name, slug) values
  ('Sell skills', 'sell-skills')
on conflict (slug) do update set name = excluded.name;

insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url) values
  ('PromptBase', 'promptbase', 'utilities',
   'Sell your prompts and agent skills to other builders.',
   'A marketplace for AI prompts that also sells agent skills as SKILL.md files. Sales through the marketplace carry a 20% commission; sales through your own link carry none. Payouts go through Stripe.',
   null, 'https://promptbase.com/sell'),
  ('Capafy', 'capafy', 'utilities',
   'Publish a skill and earn from every subscription or run.',
   'A skills marketplace where your skill runs on Capafy''s servers, so buyers get the results without seeing your prompts or scripts. Works from Claude Code and Codex, with pricing by subscription, rental or download.',
   null, 'https://capafy.ai/earn/')
on conflict (slug) do update set
  name         = excluded.name,
  category     = excluded.category,
  tagline      = excluded.tagline,
  description  = excluded.description,
  pricing_tier = excluded.pricing_tier,
  outbound_url = excluded.outbound_url,
  updated_at   = now();

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('promptbase','sell-skills'),
  ('capafy','sell-skills')
) as m(tool_slug, tag_slug)
join tools t on t.slug = m.tool_slug
join tags  g on g.slug = m.tag_slug
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- One skill for each empty category (VIB-134)
--
-- Every entry is on the skills.sh leaderboard, has no failing security audit
-- there, and its tagline and description come from its own SKILL.md, checked
-- on 2026-09-14. Pricing: "Open source" where the repository has a licence;
-- Vercel's skills repository has none, so those two say "Free".
insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url) values
  ('React Best Practices', 'vercel-react-best-practices', 'skills',
   'Vercel''s React and Next.js performance rules for your agent.',
   'Performance guidelines from Vercel Engineering that your agent applies while writing, reviewing or refactoring React and Next.js code: components, pages, data fetching and bundle size.',
   'Free', 'https://github.com/vercel-labs/agent-skills'),
  ('Postgres Best Practices', 'supabase-postgres-best-practices', 'skills',
   'Supabase''s rules for schemas, migrations and queries.',
   'Postgres best practices maintained by Supabase, for Postgres running anywhere. Your agent loads it before creating tables, choosing column types, writing migrations or RLS policies, so the database is right the first time.',
   'Open source', 'https://github.com/supabase/agent-skills'),
  ('Webapp Testing', 'webapp-testing', 'skills',
   'Test your local web app in a real browser with Playwright.',
   'Anthropic''s skill for checking a web app you are running locally: it drives Playwright to verify frontend behaviour, debug the UI, take screenshots and read browser logs.',
   'Open source', 'https://github.com/anthropics/skills'),
  ('Code Review', 'sentry-code-review', 'skills',
   'Review pull requests the way Sentry''s engineers do.',
   'Code review following Sentry engineering practices, for pull requests and code changes. Covers security, performance, testing and design, and gives feedback on code quality.',
   'Open source', 'https://github.com/getsentry/skills'),
  ('Diagnosing Bugs', 'diagnosing-bugs', 'skills',
   'A diagnosis loop for hard bugs and slowdowns.',
   'From Matt Pocock''s skills. When something is broken, throwing, failing or slow, your agent works through a structured diagnosis loop instead of guessing at fixes.',
   'Open source', 'https://github.com/mattpocock/skills'),
  ('Doc Co-authoring', 'doc-coauthoring', 'skills',
   'Write specs, proposals and docs with your agent, step by step.',
   'Anthropic''s structured workflow for co-writing documentation, proposals, technical specs and decision docs: it gathers context from you, refines the draft over rounds, and checks the result.',
   'Free', 'https://github.com/anthropics/skills'),
  ('Deploy to Vercel', 'deploy-to-vercel', 'skills',
   'Ask your agent to deploy, and get the live link back.',
   'Vercel''s skill for deploying apps and websites. Say "deploy my app", "push this live" or "create a preview deployment" and your agent runs the deployment for you.',
   'Free', 'https://github.com/vercel-labs/agent-skills'),
  ('Differential Review', 'differential-review', 'skills',
   'A security-focused review of every change, from Trail of Bits.',
   'Security review of code changes by the auditing firm Trail of Bits. It scales to the codebase, uses git blame for context, measures the blast radius of each change, checks test coverage and writes a report.',
   'Open source', 'https://github.com/trailofbits/skills'),
  ('SEO Audit', 'seo-audit', 'skills',
   'Find out why a page is not ranking, and what to fix.',
   'From Corey Haines'' marketing skills. Your agent audits technical and on-page SEO, such as meta tags and site health, when traffic drops or a page is not showing up in Google.',
   'Open source', 'https://github.com/coreyhaines31/marketingskills')
on conflict (slug) do update set
  name         = excluded.name,
  category     = excluded.category,
  tagline      = excluded.tagline,
  description  = excluded.description,
  pricing_tier = excluded.pricing_tier,
  outbound_url = excluded.outbound_url,
  updated_at   = now();

update tools t set skills_sh_source = v.source, skill_category = v.category::skill_category
from (values
  ('vercel-react-best-practices', 'vercel-labs/agent-skills/vercel-react-best-practices', 'frontend'),
  ('supabase-postgres-best-practices', 'supabase/agent-skills/supabase-postgres-best-practices', 'backend_apis'),
  ('webapp-testing', 'anthropics/skills/webapp-testing', 'testing_qa'),
  ('sentry-code-review', 'getsentry/skills/code-review', 'code_review'),
  ('diagnosing-bugs', 'mattpocock/skills/diagnosing-bugs', 'debugging'),
  ('doc-coauthoring', 'anthropics/skills/doc-coauthoring', 'docs_writing'),
  ('deploy-to-vercel', 'vercel-labs/agent-skills/deploy-to-vercel', 'devops_deploy'),
  ('differential-review', 'trailofbits/skills/differential-review', 'security'),
  ('seo-audit', 'coreyhaines31/marketingskills/seo-audit', 'marketing_content')
) as v(slug, source, category)
where t.slug = v.slug;

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('vercel-react-best-practices','frontend'),
  ('supabase-postgres-best-practices','database'), ('supabase-postgres-best-practices','backend'), ('supabase-postgres-best-practices','open-source'),
  ('webapp-testing','testing'), ('webapp-testing','frontend'), ('webapp-testing','open-source'),
  ('sentry-code-review','code-generation'), ('sentry-code-review','open-source'),
  ('diagnosing-bugs','testing'), ('diagnosing-bugs','open-source'),
  ('doc-coauthoring','open-source'),
  ('deploy-to-vercel','deployment'),
  ('differential-review','testing'), ('differential-review','open-source'),
  ('seo-audit','web-apps'), ('seo-audit','open-source')
) as m(tool_slug, tag_slug)
join tools t on t.slug = m.tool_slug
join tags  g on g.slug = m.tag_slug
on conflict do nothing;

-- Both need a terminal on your own machine: Webapp Testing drives Playwright
-- against a locally running app, and Deploy to Vercel runs the Vercel CLI.
-- Neither can run inside Claude.ai or ChatGPT (VIB-134).
update tools set skill_agents_excluded = array['claude-ai', 'chatgpt']
where slug in ('webapp-testing', 'deploy-to-vercel');

-- ---------------------------------------------------------------------------
-- Three skills in every category (VIB-135)
--
-- Same bar as VIB-134: on the skills.sh leaderboard, no failing security
-- audit, tagline and description taken from the skill's own SKILL.md, checked
-- 2026-09-14. Six first choices were dropped for a failing audit.
--
-- Pricing follows each skill's licence. Anthropic's Word, Excel and
-- PowerPoint skills are source-available, not open source, so they say
-- "Free"; so does Doc Co-authoring, whose folder carries no licence.
insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url) values
  ('Frontend Design', 'frontend-design', 'skills',
   'Distinctive UI instead of templated defaults, from Anthropic.',
   'Anthropic''s guidance for intentional visual design when building a new interface or reshaping an existing one: aesthetic direction, typography, and choices that do not read as generic.',
   'Open source', 'https://github.com/anthropics/skills'),
  ('shadcn/ui Skill', 'shadcn-skill', 'skills',
   'Add, fix and style shadcn/ui components with the right context.',
   'The official shadcn skill. Your agent manages shadcn components and projects, from adding and searching components to debugging, styling and composing UI, with component docs and usage examples to hand.',
   'Open source', 'https://github.com/shadcn-ui/ui'),
  ('Web Design Guidelines', 'web-design-guidelines', 'skills',
   'Check your UI against Vercel''s interface guidelines.',
   'Vercel''s skill for reviewing UI code against its Web Interface Guidelines. Ask your agent to review your UI, check accessibility or audit the UX, and it reports what to fix.',
   'Free', 'https://github.com/vercel-labs/agent-skills'),
  ('FastAPI', 'fastapi-skill', 'skills',
   'FastAPI''s own conventions, kept current.',
   'Best practices from the FastAPI project for APIs, Pydantic models, dependencies and streaming responses, so the code your agent writes uses the latest features and patterns.',
   'Open source', 'https://github.com/fastapi/fastapi'),
  ('Prisma Database Setup', 'prisma-database-setup', 'skills',
   'Connect Prisma to Postgres, MySQL, SQLite or MongoDB.',
   'Prisma''s official guide to configuring a database provider. Your agent uses it when starting a project, switching databases or fixing connection problems.',
   'Open source', 'https://github.com/prisma/skills'),
  ('Test-Driven Development', 'test-driven-development', 'skills',
   'Write the failing test first, then the code.',
   'From Superpowers. Before your agent implements a feature or a bug fix, it writes a test that fails, then the code that makes it pass.',
   'Open source', 'https://github.com/obra/superpowers'),
  ('QA Session', 'qa-session', 'skills',
   'Report bugs as you find them and get GitHub issues filed.',
   'From Matt Pocock''s skills. You describe bugs and issues in conversation, and your agent explores the codebase and files them as GitHub issues.',
   'Open source', 'https://github.com/mattpocock/skills'),
  ('Requesting Code Review', 'requesting-code-review', 'skills',
   'Check finished work against its requirements before merging.',
   'From Superpowers. When a task or major feature is done, and before merging, your agent has the work reviewed to confirm it does what was asked.',
   'Open source', 'https://github.com/obra/superpowers'),
  ('CodeRabbit Review', 'coderabbit-code-review', 'skills',
   'Run CodeRabbit reviews from inside your agent.',
   'CodeRabbit''s skill for running its CLI reviews on committed or uncommitted changes, fetching saved fix prompts for GitHub pull requests, and making sense of the results. Needs the CodeRabbit CLI.',
   'Open source', 'https://github.com/coderabbitai/skills'),
  ('Systematic Debugging', 'systematic-debugging', 'skills',
   'Find the root cause before proposing a fix.',
   'From Superpowers. On any bug, failing test or unexpected behaviour, your agent investigates systematically and finds the cause before it changes any code.',
   'Open source', 'https://github.com/obra/superpowers'),
  ('Sentry Fix Issues', 'sentry-fix-issues', 'skills',
   'Fix the production errors Sentry reports.',
   'Sentry''s skill for finding and fixing issues through the Sentry MCP server. Your agent reads stack traces, breadcrumbs and traces to reach the root cause of production errors.',
   'Open source', 'https://github.com/getsentry/sentry-for-ai'),
  ('Grill Me', 'grill-me', 'skills',
   'A relentless interview to sharpen a plan or design.',
   'From Matt Pocock''s skills. Before you build, your agent questions your plan or design hard, so the gaps show up in conversation instead of in the code.',
   'Open source', 'https://github.com/mattpocock/skills'),
  ('Writing for Agents', 'writing-for-agents', 'skills',
   'Write skills, AGENTS.md and CLAUDE.md that agents actually follow.',
   'From Matt Pocock''s skills. Guidance for writing documents meant for agents, used when creating or editing skills or changing AGENTS.md and CLAUDE.md.',
   'Open source', 'https://github.com/mattpocock/skills'),
  ('Internal Comms', 'internal-comms', 'skills',
   'Status reports, leadership updates and newsletters in your format.',
   'Anthropic''s skill for writing internal communications such as status reports, leadership updates and company newsletters, in the formats your company prefers.',
   'Open source', 'https://github.com/anthropics/skills'),
  ('Excel (xlsx)', 'xlsx-skill', 'skills',
   'Read, fix and build spreadsheets with formulas and charts.',
   'Anthropic''s spreadsheet skill, used whenever a spreadsheet is the input or output: opening and fixing .xlsx or .csv files, adding columns, computing formulas, formatting and charting. Source-available, not open source.',
   'Free', 'https://github.com/anthropics/skills'),
  ('Just Scrape', 'just-scrape', 'skills',
   'Scrape, crawl and pull structured data from the web.',
   'ScrapeGraphAI''s skill for searching the web, scraping pages, crawling documentation and extracting JSON from sites. Needs the ScrapeGraph AI CLI.',
   'Open source', 'https://github.com/scrapegraphai/just-scrape'),
  ('Wrangler', 'wrangler', 'skills',
   'Build and deploy Cloudflare Workers from your agent.',
   'Cloudflare''s skill for running and troubleshooting Wrangler CLI commands and configuring Worker projects for local development, deployment and managing Cloudflare resources.',
   'Open source', 'https://github.com/cloudflare/skills'),
  ('AWS Deployment Pipelines', 'aws-deployment', 'skills',
   'Set up CI/CD on AWS with CodePipeline and CodeBuild.',
   'From the AWS agent toolkit. Your agent configures CI/CD pipelines with CodePipeline, CodeBuild, CodeDeploy, CodeConnections and CodeArtifact.',
   'Open source', 'https://github.com/aws/agent-toolkit-for-aws'),
  ('Security Audit', 'cloudflare-security-audit', 'skills',
   'Find, verify and prioritise vulnerabilities in your code.',
   'Cloudflare''s security audit skill. Your agent finds vulnerabilities grounded in the source code, validates and prioritises them, and describes the fixes, for web apps, APIs, services and libraries.',
   'Open source', 'https://github.com/cloudflare/security-audit-skill'),
  ('Supply Chain Risk Auditor', 'supply-chain-risk-auditor', 'skills',
   'Audit your dependencies for supply-chain risk.',
   'From Trail of Bits. Checks direct and lockfile dependencies against advisories, flags abandoned or archived upstreams and install-time scripts, and reports the risk.',
   'Open source', 'https://github.com/trailofbits/skills'),
  ('Copywriting', 'copywriting', 'skills',
   'Write or rewrite the copy on any marketing page.',
   'From Corey Haines'' marketing skills. Your agent writes and improves copy for homepages, landing pages, pricing pages, feature pages and product pages.',
   'Open source', 'https://github.com/coreyhaines31/marketingskills'),
  ('Page CRO', 'page-cro', 'skills',
   'Get more conversions from a landing or pricing page.',
   'From Corey Haines'' marketing skills. Your agent reviews a marketing page, such as a homepage, landing page or pricing page, and suggests changes to lift conversions.',
   'Open source', 'https://github.com/coreyhaines31/marketingskills'),
  ('PowerPoint (pptx)', 'pptx-skill', 'skills',
   'Create and edit slide decks.',
   'Anthropic''s presentation skill, used whenever a .pptx file is involved: building slide decks and pitch decks, or reading and extracting text from existing ones. Source-available, not open source.',
   'Free', 'https://github.com/anthropics/skills'),
  ('Word (docx)', 'docx-skill', 'skills',
   'Create and edit Word documents with proper formatting.',
   'Anthropic''s Word skill for creating, reading and editing .docx documents and templates with professional formatting. Source-available, not open source.',
   'Free', 'https://github.com/anthropics/skills')
on conflict (slug) do update set
  name         = excluded.name,
  category     = excluded.category,
  tagline      = excluded.tagline,
  description  = excluded.description,
  pricing_tier = excluded.pricing_tier,
  outbound_url = excluded.outbound_url,
  updated_at   = now();

update tools t set skills_sh_source = v.source, skill_category = v.category::skill_category
from (values
  ('frontend-design', 'anthropics/skills/frontend-design', 'design_ui'),
  ('shadcn-skill', 'shadcn/ui/shadcn', 'frontend'),
  ('web-design-guidelines', 'vercel-labs/agent-skills/web-design-guidelines', 'frontend'),
  ('fastapi-skill', 'fastapi/fastapi/fastapi', 'backend_apis'),
  ('prisma-database-setup', 'prisma/skills/prisma-database-setup', 'backend_apis'),
  ('test-driven-development', 'obra/superpowers/test-driven-development', 'testing_qa'),
  ('qa-session', 'mattpocock/skills/qa', 'testing_qa'),
  ('requesting-code-review', 'obra/superpowers/requesting-code-review', 'code_review'),
  ('coderabbit-code-review', 'coderabbitai/skills/code-review', 'code_review'),
  ('systematic-debugging', 'obra/superpowers/systematic-debugging', 'debugging'),
  ('sentry-fix-issues', 'getsentry/sentry-for-ai/sentry-fix-issues', 'debugging'),
  ('grill-me', 'mattpocock/skills/grill-me', 'planning_workflow'),
  ('writing-for-agents', 'mattpocock/skills/writing-for-agents', 'docs_writing'),
  ('internal-comms', 'anthropics/skills/internal-comms', 'docs_writing'),
  ('xlsx-skill', 'anthropics/skills/xlsx', 'data_analysis'),
  ('just-scrape', 'scrapegraphai/just-scrape/just-scrape', 'data_analysis'),
  ('wrangler', 'cloudflare/skills/wrangler', 'devops_deploy'),
  ('aws-deployment', 'aws/agent-toolkit-for-aws/aws-deployment', 'devops_deploy'),
  ('cloudflare-security-audit', 'cloudflare/security-audit-skill/security-audit', 'security'),
  ('supply-chain-risk-auditor', 'trailofbits/skills/supply-chain-risk-auditor', 'security'),
  ('copywriting', 'coreyhaines31/marketingskills/copywriting', 'marketing_content'),
  ('page-cro', 'coreyhaines31/marketingskills/page-cro', 'marketing_content'),
  ('pptx-skill', 'anthropics/skills/pptx', 'documents_office'),
  ('docx-skill', 'anthropics/skills/docx', 'documents_office')
) as v(slug, source, category)
where t.slug = v.slug;

-- These drive a command-line tool on your own machine, which a chat app
-- cannot run.
update tools set skill_agents_excluded = array['claude-ai', 'chatgpt']
where slug in ('coderabbit-code-review', 'just-scrape', 'wrangler', 'aws-deployment');

-- Correction to VIB-134: this folder carries no licence.
update tools set pricing_tier = 'Free' where slug = 'doc-coauthoring';

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('frontend-design','design'), ('frontend-design','frontend'), ('frontend-design','open-source'),
  ('shadcn-skill','frontend'), ('shadcn-skill','design'), ('shadcn-skill','open-source'),
  ('web-design-guidelines','frontend'), ('web-design-guidelines','design'),
  ('fastapi-skill','backend'), ('fastapi-skill','open-source'),
  ('prisma-database-setup','database'), ('prisma-database-setup','backend'), ('prisma-database-setup','open-source'),
  ('test-driven-development','testing'), ('test-driven-development','open-source'),
  ('qa-session','testing'), ('qa-session','open-source'),
  ('requesting-code-review','code-generation'), ('requesting-code-review','open-source'),
  ('coderabbit-code-review','code-generation'), ('coderabbit-code-review','open-source'),
  ('systematic-debugging','testing'), ('systematic-debugging','open-source'),
  ('sentry-fix-issues','testing'), ('sentry-fix-issues','open-source'),
  ('grill-me','open-source'),
  ('writing-for-agents','automation'), ('writing-for-agents','open-source'),
  ('internal-comms','open-source'),
  ('just-scrape','automation'), ('just-scrape','open-source'),
  ('wrangler','deployment'), ('wrangler','open-source'),
  ('aws-deployment','deployment'), ('aws-deployment','open-source'),
  ('cloudflare-security-audit','testing'), ('cloudflare-security-audit','open-source'),
  ('supply-chain-risk-auditor','testing'), ('supply-chain-risk-auditor','open-source'),
  ('copywriting','web-apps'), ('copywriting','open-source'),
  ('page-cro','web-apps'), ('page-cro','open-source')
) as m(tool_slug, tag_slug)
join tools t on t.slug = m.tool_slug
join tags  g on g.slug = m.tag_slug
on conflict do nothing;

-- App builders (VIB-136). Lovable and Replit move here from `tools`; the
-- rest are new. Checked against each vendor's site on 2026-09-14.
update tools set category = 'app_builders', updated_at = now()
where slug in ('lovable', 'replit');

insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url) values
  ('Bolt', 'bolt', 'app_builders',
   'Prompt, run and edit a full-stack app in a browser tab.',
   'Bolt runs a real Node.js environment inside your browser, so the app it generates is running code you can edit, not a mockup. Pick the framework you want, from React and Next.js to Vue, Svelte or Astro.',
   'Freemium', 'https://bolt.new'),
  ('Base44', 'base44', 'app_builders',
   'One prompt builds the app, database, logins and hosting.',
   'Base44 generates a full-stack web app on its own managed platform, with data storage, user logins and permissions set up behind the scenes. Owned by Wix since 2025 and run as its own product.',
   'Freemium', 'https://base44.com'),
  ('v0', 'v0', 'app_builders',
   'Vercel''s app builder for React and Next.js.',
   'Describe a page or app and v0 builds it in Next.js with shadcn/ui, then deploys it to Vercel. The natural choice if your project already lives on that stack.',
   'Freemium', 'https://v0.app'),
  ('Emergent', 'emergent', 'app_builders',
   'Build web and mobile apps by describing them.',
   'A Y Combinator-backed builder whose agents generate full-stack apps with logins, a database, hosting and payments from a plain-English brief. Credit-based, with a small free allowance to try it.',
   'Freemium', 'https://emergent.sh'),
  ('Mocha', 'mocha', 'app_builders',
   'No-code app builder with auth, database and hosting built in.',
   'Mocha builds and publishes full-stack web apps from a description, with sign-in, a database and hosting included so there are no separate services to connect. Keeps separate development and production databases.',
   'Freemium', 'https://getmocha.com'),
  ('Rork', 'rork', 'app_builders',
   'Describe a mobile app, get a native iOS and Android build.',
   'Rork generates React Native (Expo) apps that compile to real native code rather than a web view, and can publish to the App Store for you. A separate Max plan builds native Swift apps for Apple devices.',
   'Freemium', 'https://rork.com'),
  ('Bubble', 'bubble', 'app_builders',
   'Visual no-code builder for web and mobile apps, with AI.',
   'Bubble generates a starting app from a prompt, then you keep building in its visual editor, with its own database, workflows and hosting. The app lives on Bubble rather than as code you export.',
   'Freemium', 'https://bubble.io'),
  ('FlutterFlow', 'flutterflow', 'app_builders',
   'Visual builder for Flutter mobile and web apps.',
   'Design screens visually or with AI, connect Firebase or Supabase, and export clean Flutter code whenever you want to leave. Popular for cross-platform mobile apps.',
   'Freemium', 'https://flutterflow.io'),
  ('Softr', 'softr', 'app_builders',
   'Turn your spreadsheet or database into a working app.',
   'Softr builds client portals, internal tools and directories on top of data you already have in Airtable, Google Sheets and similar sources, with user logins and permissions. AI can generate the first version.',
   'Freemium', 'https://www.softr.io'),
  ('Relume', 'relume', 'app_builders',
   'AI sitemaps and wireframes for websites, before you build.',
   'Relume plans a website rather than building an app: it generates a sitemap, wireframes and copy from a brief, then exports them to Webflow, Figma or React. Useful for agencies and designers speeding up site structure.',
   'Freemium', 'https://www.relume.io'),
  ('Framer', 'framer', 'app_builders',
   'Design and publish polished websites, with AI to start you off.',
   'A visual website builder with hosting, a CMS and animations built in. Its AI can draft a first page from a prompt, and designers use it to ship marketing sites without handing off to a developer.',
   'Freemium', 'https://www.framer.com'),
  ('Webflow', 'webflow', 'app_builders',
   'Visual website builder with full design control and a CMS.',
   'Webflow gives you the layout power of hand-written HTML and CSS in a visual editor, plus a CMS, hosting and AI assistance. Relume''s wireframes export straight into it.',
   'Freemium', 'https://webflow.com'),
  ('Durable', 'durable', 'app_builders',
   'A small-business website generated in under a minute.',
   'Answer a few questions about your business and Durable writes and publishes a complete site, with booking, invoicing and a simple CRM alongside. Built for speed over custom design.',
   'Freemium', 'https://durable.com')
on conflict (slug) do update set
  name         = excluded.name,
  category     = excluded.category,
  tagline      = excluded.tagline,
  description  = excluded.description,
  pricing_tier = excluded.pricing_tier,
  outbound_url = excluded.outbound_url,
  updated_at   = now();

update tools t set platform = array['web'], best_for = v.best_for::role_level
from (values
  ('bolt','beginner'), ('base44','beginner'), ('v0','intermediate'),
  ('emergent','beginner'), ('mocha','beginner'), ('rork','beginner'),
  ('bubble','beginner'), ('flutterflow','intermediate'), ('softr','beginner'),
  ('relume','intermediate'), ('framer','beginner'), ('webflow','intermediate'),
  ('durable','beginner')
) as v(slug, best_for)
where t.slug = v.slug;

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('bolt','web-apps'), ('bolt','code-generation'), ('bolt','free-tier'),
  ('base44','web-apps'), ('base44','backend'), ('base44','free-tier'),
  ('v0','web-apps'), ('v0','frontend'), ('v0','code-generation'), ('v0','free-tier'),
  ('emergent','web-apps'), ('emergent','backend'), ('emergent','free-tier'),
  ('mocha','web-apps'), ('mocha','backend'), ('mocha','database'), ('mocha','free-tier'),
  ('rork','code-generation'), ('rork','free-tier'),
  ('bubble','web-apps'), ('bubble','database'), ('bubble','free-tier'),
  ('flutterflow','frontend'), ('flutterflow','code-generation'), ('flutterflow','free-tier'),
  ('softr','web-apps'), ('softr','database'), ('softr','free-tier'),
  ('relume','design'), ('relume','free-tier'),
  ('framer','design'), ('framer','frontend'), ('framer','free-tier'),
  ('webflow','design'), ('webflow','frontend'), ('webflow','free-tier'),
  ('durable','web-apps'), ('durable','free-tier')
) as m(tool_slug, tag_slug)
join tools t on t.slug = m.tool_slug
join tags  g on g.slug = m.tag_slug
on conflict do nothing;

-- Two more app builders, and a level for the two that moved in (VIB-137).
-- Checked against Figma's and Google's docs on 2026-09-14.
insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url) values
  ('Figma Make', 'figma-make', 'app_builders',
   'Prompt a working prototype or web app inside Figma.',
   'Figma Make turns a description or an existing Figma design into an interactive app with real React and Tailwind code, and can publish it to its own URL. A natural next step for designers who already work in Figma.',
   'Freemium', 'https://www.figma.com/make/'),
  ('Google AI Studio', 'google-ai-studio', 'app_builders',
   'Describe an app and Gemini builds it in the browser.',
   'Google AI Studio''s Build mode generates a full-stack app from a prompt, previews it live, and can set up Firebase logins and a database for you before deploying to Cloud Run. It can also build native Android apps.',
   'Freemium', 'https://aistudio.google.com/apps')
on conflict (slug) do update set
  name         = excluded.name,
  category     = excluded.category,
  tagline      = excluded.tagline,
  description  = excluded.description,
  pricing_tier = excluded.pricing_tier,
  outbound_url = excluded.outbound_url,
  updated_at   = now();

update tools t set platform = array['web'], best_for = v.best_for::role_level
from (values
  ('figma-make','beginner'), ('google-ai-studio','beginner')
) as v(slug, best_for)
where t.slug = v.slug;

update tools set best_for = 'beginner' where slug in ('lovable', 'replit');

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('figma-make','design'), ('figma-make','frontend'), ('figma-make','free-tier'),
  ('google-ai-studio','web-apps'), ('google-ai-studio','code-generation'), ('google-ai-studio','free-tier')
) as m(tool_slug, tag_slug)
join tools t on t.slug = m.tool_slug
join tags  g on g.slug = m.tag_slug
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Five skills in every category (VIB-138)
--
-- Same bar as VIB-134 and VIB-135: on the skills.sh leaderboard, no failing
-- security audit, described from the skill's own page, checked 2026-09-14.
-- Skills built for one stack (.NET, Go, AWS, Azure, Cloudflare) say so in the
-- tagline, so nobody installs a .NET skill into a Next.js project by mistake.
insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url) values
  ('Impeccable', 'impeccable', 'skills',
   'Design, critique and polish an interface with one skill.',
   'Paul Bakaus''s design skill. Your agent can design or redesign a UI, then critique, audit, polish, simplify or animate it, working through the craft steps that make an interface feel finished.',
   'Open source', 'https://github.com/pbakaus/impeccable'),
  ('Emil Design Engineering', 'emil-design-eng', 'skills',
   'Emil Kowalski''s eye for UI polish and animation.',
   'Encodes Emil Kowalski''s approach to UI polish, component design, animation decisions and the small details that make software feel great.',
   'Open source', 'https://github.com/emilkowalski/skills'),
  ('React Composition Patterns', 'vercel-composition-patterns', 'skills',
   'Component patterns that scale, from Vercel.',
   'Vercel''s React composition patterns. Your agent uses them when refactoring components that have grown too many boolean props, building flexible component libraries or designing reusable APIs.',
   'Free', 'https://github.com/vercel-labs/agent-skills'),
  ('React Native Best Practices', 'react-native-best-practices', 'skills',
   'Vercel''s React Native and Expo rules for fast mobile apps.',
   'Vercel''s best practices for React Native and Expo. Your agent applies them when building components, speeding up long lists and implementing native features.',
   'Free', 'https://github.com/vercel-labs/agent-skills'),
  ('Supabase', 'supabase-skill', 'skills',
   'Supabase''s own skill for Auth, Database, Storage and Edge Functions.',
   'The official Supabase skill, for any task involving Supabase: Database, Auth, Edge Functions, Realtime, Storage, Cron and Queues, plus supabase-js and SSR setups in Next.js, React, SvelteKit, Astro and Remix.',
   'Open source', 'https://github.com/supabase/agent-skills'),
  ('Neon Postgres', 'neon-postgres-skill', 'skills',
   'Set up and connect Neon Postgres the right way.',
   'Neon''s guide to working with its Postgres: setup, connection methods and drivers, and when to use pooled or direct connections.',
   'Open source', 'https://github.com/neondatabase/agent-skills'),
  ('Verification Before Completion', 'verification-before-completion', 'skills',
   'No "it works" without running the checks first.',
   'From Superpowers. Before your agent says work is complete, fixed or passing, or before it commits or opens a PR, it runs the verification commands and confirms the output.',
   'Open source', 'https://github.com/obra/superpowers'),
  ('Test Anti-Patterns', 'test-anti-patterns', 'skills',
   'Find tests that verify nothing, from the .NET team.',
   'From Microsoft''s .NET skills. Your agent audits a test file or suite and produces a severity-ranked report of problems such as tests that check nothing and missing or circular assertions.',
   'Open source', 'https://github.com/dotnet/skills'),
  ('Receiving Code Review', 'receiving-code-review', 'skills',
   'Weigh review feedback before acting on it.',
   'From Superpowers. When your agent receives review comments, especially unclear or questionable ones, it checks them technically before implementing any suggestion.',
   'Open source', 'https://github.com/obra/superpowers'),
  ('Caveman Review', 'caveman-review', 'skills',
   'Code review in one line per finding: where, what, fix.',
   'From Caveman. A compressed code review of a pull request or diff, with each finding reduced to its location, the problem and the fix.',
   'Open source', 'https://github.com/juliusbrussee/caveman'),
  ('Zoom Out', 'zoom-out', 'skills',
   'Step back and see how unfamiliar code fits together.',
   'From Matt Pocock''s skills. When you are lost in a section of code, your agent zooms out and explains the broader context: how the piece fits into the rest of the system.',
   'Open source', 'https://github.com/mattpocock/skills'),
  ('.NET Performance Analysis', 'dotnet-performance', 'skills',
   'Find performance anti-patterns in .NET code.',
   'From Microsoft''s .NET skills. Your agent scans .NET code for performance problems across async, memory, strings, collections, LINQ, regex, serialisation and I/O, ranked by severity.',
   'Open source', 'https://github.com/dotnet/skills'),
  ('Writing Plans', 'writing-plans', 'skills',
   'Turn a spec into a step-by-step plan before touching code.',
   'From Superpowers. When there is a spec or set of requirements for a multi-step task, your agent writes an implementation plan first, before it changes any code.',
   'Open source', 'https://github.com/obra/superpowers'),
  ('To PRD', 'to-prd', 'skills',
   'Turn the conversation so far into a PRD in your issue tracker.',
   'From Matt Pocock''s skills. Your agent turns what you have already discussed into a product requirements document and publishes it to the project''s issue tracker, without another round of questions.',
   'Open source', 'https://github.com/mattpocock/skills'),
  ('Ubiquitous Language', 'ubiquitous-language', 'skills',
   'Build a shared glossary of your project''s terms.',
   'From Matt Pocock''s skills. Your agent pulls a domain-driven-design glossary out of the conversation, flags ambiguous terms and proposes the canonical word for each.',
   'Open source', 'https://github.com/mattpocock/skills'),
  ('Go Documentation', 'go-documentation', 'skills',
   'Write godoc, READMEs and changelogs for Go projects.',
   'A documentation guide for Go projects: godoc comments, README, CONTRIBUTING and CHANGELOG files, Go Playground links, example tests and API docs.',
   'Open source', 'https://github.com/samber/cc-skills-golang'),
  ('Athena Data Lake Queries', 'athena-data-lake', 'skills',
   'Run SQL over your AWS data lake with Athena.',
   'From the AWS agent toolkit. Your agent runs and manages Amazon Athena SQL queries across default and federated catalogs such as Glue, S3 Tables and Redshift.',
   'Open source', 'https://github.com/aws/agent-toolkit-for-aws'),
  ('Redshift Guide', 'redshift-guide', 'skills',
   'Stop your agent writing Postgres SQL for Amazon Redshift.',
   'From the AWS agent toolkit. Amazon Redshift is not PostgreSQL, and this corrects the mistakes models make when they assume it is: Redshift-specific SQL, DDL, COPY and UNLOAD, and system views.',
   'Open source', 'https://github.com/aws/agent-toolkit-for-aws'),
  ('Azure Kubernetes', 'azure-kubernetes', 'skills',
   'Plan and create production-ready AKS clusters on Azure.',
   'From Microsoft''s Azure skills. Your agent plans, creates and configures Azure Kubernetes Service clusters, from the day-zero checklist and SKU choice to networking.',
   'Open source', 'https://github.com/microsoft/azure-skills'),
  ('AWS Serverless', 'aws-serverless', 'skills',
   'Build and deploy serverless apps on AWS Lambda.',
   'From the AWS agent toolkit. Your agent builds, deploys, debugs and tunes serverless applications with Lambda, API Gateway, Step Functions and EventBridge, using SAM or CDK.',
   'Open source', 'https://github.com/aws/agent-toolkit-for-aws'),
  ('Turnstile Setup', 'turnstile-spin', 'skills',
   'Add Cloudflare Turnstile bot protection to your forms.',
   'Cloudflare''s skill for setting up, repairing or migrating to Turnstile bot verification in an existing frontend and backend, including the server-side Siteverify check.',
   'Open source', 'https://github.com/cloudflare/skills'),
  ('AWS Secrets Best Practices', 'aws-secrets', 'skills',
   'Create secrets in AWS Secrets Manager the secure way.',
   'From the AWS agent toolkit. Your agent creates and manages secrets in AWS Secrets Manager following security best practices, including dedicated encryption keys.',
   'Open source', 'https://github.com/aws/agent-toolkit-for-aws'),
  ('Local SEO', 'seo-local', 'skills',
   'Improve how a local business shows up in Google.',
   'From Claude SEO. Your agent analyses local SEO: Google Business Profile, consistent name, address and phone details, citations, reviews, local schema markup and location pages.',
   'Open source', 'https://github.com/agricidaniel/claude-seo'),
  ('Product Launch Video', 'product-launch-video', 'skills',
   'Turn a product page or script into a launch video.',
   'From HeyGen''s HyperFrames. Give your agent a product URL, script or brief and it produces a launch or promo video: feature reveals, product demos and app promos. Needs the HyperFrames CLI.',
   'Open source', 'https://github.com/heygen-com/hyperframes'),
  ('Canvas Design', 'canvas-design', 'skills',
   'Create posters and visual pieces as PNG or PDF.',
   'Anthropic''s skill for making visual work such as posters and art pieces, saved as .png or .pdf, guided by a design philosophy rather than a template.',
   'Free', 'https://github.com/anthropics/skills'),
  ('HyperFrames Slideshow', 'hyperframes-slideshow', 'skills',
   'Build presentations and pitch decks as interactive slides.',
   'From HeyGen''s HyperFrames. Your agent authors a presentation or pitch deck with discrete slides, step-by-step reveals and clickable navigation. Needs the HyperFrames CLI.',
   'Open source', 'https://github.com/heygen-com/hyperframes')
on conflict (slug) do update set
  name         = excluded.name,
  category     = excluded.category,
  tagline      = excluded.tagline,
  description  = excluded.description,
  pricing_tier = excluded.pricing_tier,
  outbound_url = excluded.outbound_url,
  updated_at   = now();

update tools t set skills_sh_source = v.source, skill_category = v.category::skill_category
from (values
  ('impeccable', 'pbakaus/impeccable/impeccable', 'design_ui'),
  ('emil-design-eng', 'emilkowalski/skills/emil-design-eng', 'design_ui'),
  ('vercel-composition-patterns', 'vercel-labs/agent-skills/vercel-composition-patterns', 'frontend'),
  ('react-native-best-practices', 'vercel-labs/agent-skills/vercel-react-native-skills', 'frontend'),
  ('supabase-skill', 'supabase/agent-skills/supabase', 'backend_apis'),
  ('neon-postgres-skill', 'neondatabase/agent-skills/neon-postgres', 'backend_apis'),
  ('verification-before-completion', 'obra/superpowers/verification-before-completion', 'testing_qa'),
  ('test-anti-patterns', 'dotnet/skills/test-anti-patterns', 'testing_qa'),
  ('receiving-code-review', 'obra/superpowers/receiving-code-review', 'code_review'),
  ('caveman-review', 'juliusbrussee/caveman/caveman-review', 'code_review'),
  ('zoom-out', 'mattpocock/skills/zoom-out', 'debugging'),
  ('dotnet-performance', 'dotnet/skills/analyzing-dotnet-performance', 'debugging'),
  ('writing-plans', 'obra/superpowers/writing-plans', 'planning_workflow'),
  ('to-prd', 'mattpocock/skills/to-prd', 'planning_workflow'),
  ('ubiquitous-language', 'mattpocock/skills/ubiquitous-language', 'docs_writing'),
  ('go-documentation', 'samber/cc-skills-golang/golang-documentation', 'docs_writing'),
  ('athena-data-lake', 'aws/agent-toolkit-for-aws/querying-data-lake', 'data_analysis'),
  ('redshift-guide', 'aws/agent-toolkit-for-aws/redshift-guide', 'data_analysis'),
  ('azure-kubernetes', 'microsoft/azure-skills/azure-kubernetes', 'devops_deploy'),
  ('aws-serverless', 'aws/agent-toolkit-for-aws/aws-serverless', 'devops_deploy'),
  ('turnstile-spin', 'cloudflare/skills/turnstile-spin', 'security'),
  ('aws-secrets', 'aws/agent-toolkit-for-aws/creating-secrets-using-best-practices', 'security'),
  ('seo-local', 'agricidaniel/claude-seo/seo-local', 'marketing_content'),
  ('product-launch-video', 'heygen-com/hyperframes/product-launch-video', 'marketing_content'),
  ('canvas-design', 'anthropics/skills/canvas-design', 'documents_office'),
  ('hyperframes-slideshow', 'heygen-com/hyperframes/slideshow', 'documents_office')
) as v(slug, source, category)
where t.slug = v.slug;

-- These run a CLI or act on a cloud account, which a chat app cannot do.
update tools set skill_agents_excluded = array['claude-ai', 'chatgpt']
where slug in ('product-launch-video', 'hyperframes-slideshow', 'aws-serverless',
               'athena-data-lake', 'aws-secrets', 'azure-kubernetes');

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('impeccable','design'), ('impeccable','frontend'), ('impeccable','open-source'),
  ('emil-design-eng','design'), ('emil-design-eng','frontend'), ('emil-design-eng','open-source'),
  ('vercel-composition-patterns','frontend'),
  ('react-native-best-practices','frontend'),
  ('supabase-skill','database'), ('supabase-skill','backend'), ('supabase-skill','open-source'),
  ('neon-postgres-skill','database'), ('neon-postgres-skill','backend'), ('neon-postgres-skill','open-source'),
  ('verification-before-completion','testing'), ('verification-before-completion','open-source'),
  ('test-anti-patterns','testing'), ('test-anti-patterns','open-source'),
  ('receiving-code-review','code-generation'), ('receiving-code-review','open-source'),
  ('caveman-review','code-generation'), ('caveman-review','open-source'),
  ('zoom-out','open-source'),
  ('dotnet-performance','testing'), ('dotnet-performance','open-source'),
  ('writing-plans','open-source'),
  ('to-prd','open-source'),
  ('ubiquitous-language','open-source'),
  ('go-documentation','open-source'),
  ('athena-data-lake','database'), ('athena-data-lake','open-source'),
  ('redshift-guide','database'), ('redshift-guide','open-source'),
  ('azure-kubernetes','deployment'), ('azure-kubernetes','open-source'),
  ('aws-serverless','deployment'), ('aws-serverless','backend'), ('aws-serverless','open-source'),
  ('turnstile-spin','frontend'), ('turnstile-spin','backend'), ('turnstile-spin','open-source'),
  ('aws-secrets','backend'), ('aws-secrets','open-source'),
  ('seo-local','web-apps'), ('seo-local','open-source'),
  ('product-launch-video','design'), ('product-launch-video','open-source'),
  ('canvas-design','design'),
  ('hyperframes-slideshow','design'), ('hyperframes-slideshow','open-source')
) as m(tool_slug, tag_slug)
join tools t on t.slug = m.tool_slug
join tags  g on g.slug = m.tag_slug
on conflict do nothing;

-- Hosting (VIB-140). Vercel moves here from `tools`; the rest are new, plus
-- ChatGPT Sites in App Builders. Checked against vendor sites and pricing
-- pages on 2026-09-14.
insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url) values
  ('Vercel', 'vercel', 'hosting',
   'Deploy Next.js with a preview URL per pull request.',
   'Push a branch, get a live URL. The preview-per-PR workflow is what makes reviewing a change practical, and the free Hobby plan covers personal projects.',
   'Freemium', 'https://vercel.com'),
  ('Netlify', 'netlify', 'hosting',
   'Connect a Git repo and every push goes live.',
   'One of the original Git-based hosts for static sites and front-end frameworks, with deploy previews, serverless functions and forms built in. A free plan covers small sites.',
   'Freemium', 'https://www.netlify.com'),
  ('Cloudflare Workers', 'cloudflare-workers', 'hosting',
   'Host a site and its API on Cloudflare''s global network.',
   'Workers now serves static files as well as code, and it is what Cloudflare recommends for new projects over the older Pages product. Static requests are free, and a generous free plan covers the rest for small apps.',
   'Freemium', 'https://workers.cloudflare.com'),
  ('GitHub Pages', 'github-pages', 'hosting',
   'Free hosting for a static site, straight from a repository.',
   'Turn on Pages in a repository''s settings and GitHub publishes its HTML, or a built site, at a github.io address. Static only, so no server code or database, but ideal for portfolios, docs and landing pages.',
   'Free', 'https://pages.github.com'),
  ('Hostinger', 'hostinger', 'hosting',
   'Budget web hosting with domains, email and an AI builder.',
   'Classic shared, WordPress and VPS hosting at low monthly prices, with a domain and email bundled on most plans. Its Horizons plans add an AI builder that creates and hosts a site from a prompt.',
   'Paid', 'https://www.hostinger.com'),
  ('Firebase Hosting', 'firebase-hosting', 'hosting',
   'Google''s hosting for web apps built on Firebase.',
   'Fast static hosting on Google''s CDN, with App Hosting alongside it for server-rendered Next.js and Angular apps. The obvious pick if your app already uses Firebase logins or Firestore.',
   'Freemium', 'https://firebase.google.com/products/hosting'),
  ('Render', 'render', 'hosting',
   'Run web services, databases and cron jobs from Git.',
   'A friendly step up from front-end hosts: Render runs a real back end, Postgres and background workers without you managing servers. Free web services sleep after 15 minutes idle and take about a minute to wake.',
   'Freemium', 'https://render.com'),
  ('Railway', 'railway', 'hosting',
   'Deploy an app and its database in a few clicks.',
   'Railway spins up services, Postgres, Redis and more on one canvas and bills for the resources they actually use. New accounts get a one-time trial credit, then a small monthly free allowance.',
   'Freemium', 'https://railway.com'),
  ('Fly.io', 'fly-io', 'hosting',
   'Run your app in containers close to your users.',
   'Fly.io runs Docker-packaged apps on machines in regions around the world, which suits back ends that need low latency. Pay as you go after a short trial; there is no free tier for new accounts.',
   'Paid', 'https://fly.io'),
  ('DigitalOcean App Platform', 'digitalocean-app-platform', 'hosting',
   'Managed hosting for apps, from DigitalOcean.',
   'Point App Platform at a repository and it builds and runs your app, with databases available alongside. Up to three static sites are free; apps with server code start at a few dollars a month.',
   'Freemium', 'https://www.digitalocean.com/products/app-platform'),
  ('AWS Amplify', 'aws-amplify', 'hosting',
   'Host full-stack web apps on AWS from a Git repo.',
   'Amplify Hosting builds and deploys front ends and server-rendered Next.js apps, and can add logins and data backed by AWS. Covered by the AWS free tier to start, and a gentler way into AWS than configuring it by hand.',
   'Freemium', 'https://aws.amazon.com/amplify/hosting/'),

  ('ChatGPT Sites', 'chatgpt-sites', 'app_builders',
   'Ask ChatGPT for a website and it builds and hosts it.',
   'Describe a site in chat and ChatGPT writes it, publishes it and gives you a link to share, with simple data storage for lightweight apps. In beta for paid ChatGPT plans, and not yet available in the UK, EU or Switzerland.',
   'Paid', 'https://chatgpt.com')
on conflict (slug) do update set
  name         = excluded.name,
  category     = excluded.category,
  tagline      = excluded.tagline,
  description  = excluded.description,
  pricing_tier = excluded.pricing_tier,
  outbound_url = excluded.outbound_url,
  updated_at   = now();

update tools t set platform = array['web'], best_for = v.best_for::role_level
from (values
  ('netlify','beginner'), ('cloudflare-workers','intermediate'),
  ('github-pages','beginner'), ('hostinger','beginner'),
  ('firebase-hosting','intermediate'), ('render','intermediate'),
  ('railway','intermediate'), ('fly-io','expert'),
  ('digitalocean-app-platform','intermediate'), ('aws-amplify','intermediate'),
  ('chatgpt-sites','beginner')
) as v(slug, best_for)
where t.slug = v.slug;

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('netlify','deployment'), ('netlify','web-apps'), ('netlify','free-tier'),
  ('cloudflare-workers','deployment'), ('cloudflare-workers','backend'), ('cloudflare-workers','free-tier'),
  ('github-pages','deployment'), ('github-pages','free-tier'), ('github-pages','beginner-friendly'),
  ('hostinger','deployment'), ('hostinger','beginner-friendly'),
  ('firebase-hosting','deployment'), ('firebase-hosting','web-apps'), ('firebase-hosting','free-tier'),
  ('render','deployment'), ('render','backend'), ('render','database'), ('render','free-tier'),
  ('railway','deployment'), ('railway','backend'), ('railway','database'), ('railway','free-tier'),
  ('fly-io','deployment'), ('fly-io','backend'),
  ('digitalocean-app-platform','deployment'), ('digitalocean-app-platform','backend'), ('digitalocean-app-platform','free-tier'),
  ('aws-amplify','deployment'), ('aws-amplify','web-apps'), ('aws-amplify','free-tier'),
  ('chatgpt-sites','web-apps'), ('chatgpt-sites','deployment')
) as m(tool_slug, tag_slug)
join tools t on t.slug = m.tool_slug
join tags  g on g.slug = m.tag_slug
on conflict do nothing;

-- Hosting tags and key facts (VIB-141). Checked against vendor pricing and
-- docs on 2026-09-14. No `windows` tag: none of these hosts offers Windows
-- servers (Hostinger's VPS is Linux only).
insert into tags (name, slug, kind) values
  ('Static sites', 'static-sites', 'facet'),
  ('Serverless',   'serverless',   'facet'),
  ('Containers',   'containers',   'facet'),
  ('VPS',          'vps',          'facet'),
  ('WordPress',    'wordpress',    'facet'),
  ('Next.js',      'nextjs',       'facet'),
  ('React',        'react',        'facet'),
  ('Email',        'email',        'facet'),
  ('Cloud',        'cloud',        'facet'),
  ('Linux',        'linux',        'facet'),
  ('Free trial',   'free-trial',   'pricing')
on conflict (slug) do update set name = excluded.name, kind = excluded.kind;

-- AWS dropped always-free Amplify hosting for new accounts in July 2025;
-- what is left is a credit trial, so it is Paid with a free trial.
update tools set pricing_tier = 'Paid',
  description = 'Amplify Hosting builds and deploys front ends and server-rendered Next.js apps, and can add logins and data backed by AWS. New AWS accounts get free credits to start, and it is a gentler way into AWS than configuring it by hand.',
  updated_at = now()
where slug = 'aws-amplify';

delete from tool_tags
where tool_id = (select id from tools where slug = 'aws-amplify')
  and tag_id = (select id from tags where slug = 'free-tier');

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('vercel','static-sites'), ('vercel','serverless'), ('vercel','nextjs'), ('vercel','react'),
  ('netlify','static-sites'), ('netlify','serverless'), ('netlify','nextjs'), ('netlify','react'),
  ('cloudflare-workers','static-sites'), ('cloudflare-workers','serverless'), ('cloudflare-workers','nextjs'),
  ('cloudflare-workers','react'), ('cloudflare-workers','database'), ('cloudflare-workers','cloud'),
  ('github-pages','static-sites'), ('github-pages','react'),
  ('hostinger','vps'), ('hostinger','wordpress'), ('hostinger','nextjs'), ('hostinger','database'),
  ('hostinger','email'), ('hostinger','cloud'), ('hostinger','linux'),
  ('firebase-hosting','static-sites'), ('firebase-hosting','serverless'), ('firebase-hosting','nextjs'),
  ('firebase-hosting','react'), ('firebase-hosting','database'), ('firebase-hosting','cloud'),
  ('render','containers'), ('render','static-sites'), ('render','nextjs'), ('render','react'),
  ('railway','containers'), ('railway','nextjs'), ('railway','free-trial'),
  ('fly-io','containers'), ('fly-io','database'), ('fly-io','free-trial'),
  ('digitalocean-app-platform','containers'), ('digitalocean-app-platform','static-sites'),
  ('digitalocean-app-platform','nextjs'), ('digitalocean-app-platform','react'),
  ('digitalocean-app-platform','cloud'), ('digitalocean-app-platform','free-trial'),
  ('aws-amplify','static-sites'), ('aws-amplify','serverless'), ('aws-amplify','nextjs'),
  ('aws-amplify','react'), ('aws-amplify','cloud'), ('aws-amplify','free-trial')
) as m(tool_slug, tag_slug)
join tools t on t.slug = m.tool_slug
join tags  g on g.slug = m.tag_slug
on conflict do nothing;

update tools t set key_facts = v.facts::jsonb, updated_at = now()
from (values
  ('vercel', '[
    {"label": "Free plan", "value": "Hobby plan, for personal and non-commercial projects"},
    {"label": "Paid plans from", "value": "$20 per user a month (Pro)"},
    {"label": "Hosts", "value": "Static sites and serverless functions"},
    {"label": "Frameworks", "value": "Next.js, React, Astro, SvelteKit, Nuxt and more"},
    {"label": "Databases", "value": "Postgres, Redis and more through the Vercel Marketplace"},
    {"label": "Custom domains", "value": "Yes, and you can buy domains in Vercel"},
    {"label": "Email hosting", "value": "No"},
    {"label": "Deploy from", "value": "GitHub, GitLab, Bitbucket or the CLI"}
  ]'),
  ('netlify', '[
    {"label": "Free plan", "value": "300 credits a month; sites pause when they run out"},
    {"label": "Paid plans from", "value": "$9 a month (Personal)"},
    {"label": "Hosts", "value": "Static sites and serverless functions"},
    {"label": "Frameworks", "value": "Next.js, React, Astro, Nuxt, SvelteKit and more"},
    {"label": "Databases", "value": "Bring your own, such as Supabase or Neon"},
    {"label": "Custom domains", "value": "Yes"},
    {"label": "Email hosting", "value": "No"},
    {"label": "Deploy from", "value": "Git, drag and drop, or the CLI"}
  ]'),
  ('cloudflare-workers', '[
    {"label": "Free plan", "value": "100,000 requests a day; static files are free"},
    {"label": "Paid plans from", "value": "$5 a month"},
    {"label": "Hosts", "value": "Static sites, APIs and full-stack apps on a global network"},
    {"label": "Frameworks", "value": "Next.js, React, Astro, SvelteKit, React Router and more"},
    {"label": "Databases", "value": "D1 (SQLite), KV and R2 storage, or connect to Postgres"},
    {"label": "Custom domains", "value": "Yes, and domains are sold at cost"},
    {"label": "Email hosting", "value": "Forwarding only, through Email Routing"},
    {"label": "Deploy from", "value": "Git or the Wrangler CLI"}
  ]'),
  ('github-pages', '[
    {"label": "Free plan", "value": "Free for public repositories"},
    {"label": "Paid plans from", "value": "GitHub Pro ($4 a month) to publish from a private repository"},
    {"label": "Hosts", "value": "Static sites only"},
    {"label": "Frameworks", "value": "Any static build: plain HTML, React, Astro, Jekyll and more"},
    {"label": "Databases", "value": "None"},
    {"label": "Custom domains", "value": "Yes"},
    {"label": "Email hosting", "value": "No"},
    {"label": "Deploy from", "value": "A GitHub repository or GitHub Actions"}
  ]'),
  ('hostinger', '[
    {"label": "Free plan", "value": "None, but a 30-day money-back guarantee"},
    {"label": "Paid plans from", "value": "A few dollars a month on long-term plans"},
    {"label": "Hosts", "value": "Shared and WordPress hosting, Node.js apps, cloud hosting and Linux VPS"},
    {"label": "Frameworks", "value": "WordPress and PHP, plus Next.js and other Node.js apps on Business and Cloud plans"},
    {"label": "Databases", "value": "MySQL included"},
    {"label": "Custom domains", "value": "Yes, with a free domain for the first year on most yearly plans"},
    {"label": "Email hosting", "value": "Yes, included on most plans"},
    {"label": "Deploy from", "value": "GitHub, a file upload or the control panel"}
  ]'),
  ('firebase-hosting', '[
    {"label": "Free plan", "value": "Spark plan covers small static sites"},
    {"label": "Paid plans from", "value": "Pay as you go (Blaze), which App Hosting needs"},
    {"label": "Hosts", "value": "Static sites, plus server-rendered apps on App Hosting"},
    {"label": "Frameworks", "value": "Next.js, Angular, React and any static build"},
    {"label": "Databases", "value": "Firestore, Realtime Database, and Postgres through Data Connect"},
    {"label": "Custom domains", "value": "Yes"},
    {"label": "Email hosting", "value": "No"},
    {"label": "Deploy from", "value": "GitHub or the Firebase CLI"}
  ]'),
  ('render', '[
    {"label": "Free plan", "value": "Web services that sleep after 15 minutes idle, static sites, and a Postgres database that expires after 30 days"},
    {"label": "Paid plans from", "value": "$7 a month per always-on service"},
    {"label": "Hosts", "value": "Web services, static sites, background workers and cron jobs"},
    {"label": "Frameworks", "value": "Next.js, Node.js, Python, Ruby, Go, Rust or any Docker image"},
    {"label": "Databases", "value": "Managed Postgres and Redis-compatible Key Value"},
    {"label": "Custom domains", "value": "Yes"},
    {"label": "Email hosting", "value": "No"},
    {"label": "Deploy from", "value": "GitHub, GitLab, Bitbucket or a Docker registry"}
  ]'),
  ('railway', '[
    {"label": "Free plan", "value": "$1 of usage a month after the trial"},
    {"label": "Free trial", "value": "$5 of credit for 30 days, no card needed"},
    {"label": "Paid plans from", "value": "$5 a month (Hobby), including $5 of usage"},
    {"label": "Hosts", "value": "Web services, workers, cron jobs and Docker images"},
    {"label": "Frameworks", "value": "Most languages detected automatically, or any Dockerfile"},
    {"label": "Databases", "value": "Postgres, MySQL, Redis and MongoDB in one click"},
    {"label": "Custom domains", "value": "Yes"},
    {"label": "Email hosting", "value": "No"},
    {"label": "Deploy from", "value": "GitHub, the CLI or a template"}
  ]'),
  ('fly-io', '[
    {"label": "Free plan", "value": "None for new accounts"},
    {"label": "Free trial", "value": "A short trial, then pay as you go"},
    {"label": "Paid plans from", "value": "Billed per second; a small always-on app is a few dollars a month"},
    {"label": "Hosts", "value": "Docker containers on machines in regions worldwide"},
    {"label": "Frameworks", "value": "Anything that runs in a container"},
    {"label": "Databases", "value": "Managed Postgres"},
    {"label": "Custom domains", "value": "Yes"},
    {"label": "Email hosting", "value": "No"},
    {"label": "Deploy from", "value": "The flyctl CLI or GitHub Actions"}
  ]'),
  ('digitalocean-app-platform', '[
    {"label": "Free plan", "value": "Up to three static sites"},
    {"label": "Free trial", "value": "Promotional credit for new accounts, often $200 over 60 days"},
    {"label": "Paid plans from", "value": "$5 a month per service"},
    {"label": "Hosts", "value": "Static sites, web services, workers and Docker images"},
    {"label": "Frameworks", "value": "Next.js, React, Node.js, Python, Go, PHP and more"},
    {"label": "Databases", "value": "Managed Postgres, MySQL, MongoDB and Valkey"},
    {"label": "Custom domains", "value": "Yes"},
    {"label": "Email hosting", "value": "No"},
    {"label": "Deploy from", "value": "GitHub, GitLab or a container registry"}
  ]'),
  ('aws-amplify', '[
    {"label": "Free plan", "value": "No always-free plan for new AWS accounts"},
    {"label": "Free trial", "value": "Up to $200 of AWS credits for six months on new accounts"},
    {"label": "Paid plans from", "value": "Pay as you go for builds, storage and traffic"},
    {"label": "Hosts", "value": "Static sites and server-rendered apps"},
    {"label": "Frameworks", "value": "Next.js, React, Vue, Angular, Nuxt and more"},
    {"label": "Databases", "value": "DynamoDB through Amplify Data, or any AWS database"},
    {"label": "Custom domains", "value": "Yes"},
    {"label": "Email hosting", "value": "No"},
    {"label": "Deploy from", "value": "GitHub, GitLab, Bitbucket or a manual upload"}
  ]')
) as v(slug, facts)
where t.slug = v.slug;

-- App builder tags and key facts (VIB-142). Checked against pricing pages
-- and reviews on 2026-09-14. Prices move often on these products, so the
-- facts say "from" and name the plan. Mocha is left out: it shut down on
-- 2026-08-01.
insert into tags (name, slug, kind) values
  ('Mobile apps',  'mobile-apps',  'facet'),
  ('Websites',     'websites',     'facet'),
  ('No-code',      'no-code',      'facet'),
  ('Code export',  'code-export',  'facet'),
  ('GitHub sync',  'github-sync',  'facet'),
  ('React Native', 'react-native', 'facet'),
  ('Flutter',      'flutter',      'facet')
on conflict (slug) do update set name = excluded.name, kind = excluded.kind;

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('lovable','react'), ('lovable','database'), ('lovable','code-export'), ('lovable','github-sync'),
  ('bolt','mobile-apps'), ('bolt','react'), ('bolt','nextjs'), ('bolt','database'), ('bolt','code-export'), ('bolt','github-sync'),
  ('base44','database'), ('base44','code-export'), ('base44','github-sync'),
  ('v0','nextjs'), ('v0','react'), ('v0','code-export'), ('v0','github-sync'),
  ('replit','web-apps'), ('replit','mobile-apps'), ('replit','database'), ('replit','code-export'), ('replit','github-sync'),
  ('emergent','mobile-apps'), ('emergent','database'), ('emergent','code-export'), ('emergent','github-sync'),
  ('rork','mobile-apps'), ('rork','react-native'), ('rork','code-export'), ('rork','github-sync'),
  ('bubble','mobile-apps'), ('bubble','no-code'),
  ('flutterflow','mobile-apps'), ('flutterflow','web-apps'), ('flutterflow','flutter'), ('flutterflow','code-export'), ('flutterflow','github-sync'),
  ('softr','no-code'),
  ('relume','websites'), ('relume','react'), ('relume','code-export'),
  ('framer','websites'), ('framer','no-code'),
  ('webflow','websites'), ('webflow','no-code'), ('webflow','code-export'),
  ('durable','websites'), ('durable','no-code'),
  ('figma-make','web-apps'), ('figma-make','react'), ('figma-make','code-export'),
  ('google-ai-studio','mobile-apps'), ('google-ai-studio','react'), ('google-ai-studio','database'),
  ('google-ai-studio','code-export'), ('google-ai-studio','github-sync'),
  ('chatgpt-sites','websites'), ('chatgpt-sites','database')
) as m(tool_slug, tag_slug)
join tools t on t.slug = m.tool_slug
join tags  g on g.slug = m.tag_slug
on conflict do nothing;

update tools t set key_facts = v.facts::jsonb, updated_at = now()
from (values
  ('lovable', '[
    {"label": "Free plan", "value": "5 credits a day, up to 30 a month"},
    {"label": "Paid plans from", "value": "$25 a month (Pro)"},
    {"label": "Builds", "value": "Full-stack web apps"},
    {"label": "Code it writes", "value": "React, Vite and Tailwind"},
    {"label": "Own your code", "value": "Yes, two-way GitHub sync"},
    {"label": "Backend", "value": "Built-in database and logins, or connect Supabase"},
    {"label": "Hosting", "value": "Included, on a lovable.app address"},
    {"label": "Custom domains", "value": "On paid plans"}
  ]'),
  ('bolt', '[
    {"label": "Free plan", "value": "1M tokens a month, capped at 300K a day"},
    {"label": "Paid plans from", "value": "$25 a month (Pro)"},
    {"label": "Builds", "value": "Web apps, plus mobile apps with Expo"},
    {"label": "Code it writes", "value": "Your choice of React, Next.js, Vue, Svelte, Astro and more"},
    {"label": "Own your code", "value": "Yes, download it or push to GitHub"},
    {"label": "Backend", "value": "Built-in databases, or connect Supabase"},
    {"label": "Hosting", "value": "Included; free sites carry Bolt branding"},
    {"label": "Custom domains", "value": "On paid plans"}
  ]'),
  ('base44', '[
    {"label": "Free plan", "value": "25 message credits a month, 5 a day"},
    {"label": "Paid plans from", "value": "$20 a month (Starter), less billed yearly"},
    {"label": "Builds", "value": "Full-stack web apps"},
    {"label": "Code it writes", "value": "React front end on Base44''s own platform"},
    {"label": "Own your code", "value": "GitHub export on the Builder plan and above"},
    {"label": "Backend", "value": "Database, logins and permissions built in"},
    {"label": "Hosting", "value": "Included"},
    {"label": "Custom domains", "value": "On the Builder plan and above"}
  ]'),
  ('v0', '[
    {"label": "Free plan", "value": "$5 of credits a month, 7 messages a day"},
    {"label": "Paid plans from", "value": "$30 per user a month (Plus)"},
    {"label": "Builds", "value": "Web apps and pages"},
    {"label": "Code it writes", "value": "Next.js, React, Tailwind and shadcn/ui"},
    {"label": "Own your code", "value": "Yes, GitHub sync or download"},
    {"label": "Backend", "value": "Connect Supabase, Neon and others through Vercel"},
    {"label": "Hosting", "value": "One-click deploy to Vercel"},
    {"label": "Custom domains", "value": "Yes, through Vercel"}
  ]'),
  ('replit', '[
    {"label": "Free plan", "value": "Daily Agent credits and one published app"},
    {"label": "Paid plans from", "value": "About $20 to $25 a month (Core), with usage on top"},
    {"label": "Builds", "value": "Web apps, mobile apps and scripts"},
    {"label": "Code it writes", "value": "Most languages; JavaScript and Python by default"},
    {"label": "Own your code", "value": "Yes, GitHub sync or download"},
    {"label": "Backend", "value": "Built-in database and logins"},
    {"label": "Hosting", "value": "Included, billed by usage"},
    {"label": "Custom domains", "value": "On paid plans"}
  ]'),
  ('emergent', '[
    {"label": "Free plan", "value": "10 credits to try it"},
    {"label": "Paid plans from", "value": "$20 a month (Standard)"},
    {"label": "Builds", "value": "Full-stack web apps and mobile apps"},
    {"label": "Code it writes", "value": "React front end with a Python back end"},
    {"label": "Own your code", "value": "Save to GitHub on paid plans"},
    {"label": "Backend", "value": "Database, logins and payments set up for you"},
    {"label": "Hosting", "value": "Included; deploying uses credits"},
    {"label": "Custom domains", "value": "On paid plans"}
  ]'),
  ('rork', '[
    {"label": "Free plan", "value": "35 credits a month, 5 a day"},
    {"label": "Paid plans from", "value": "About $25 a month"},
    {"label": "Builds", "value": "Native iOS and Android apps"},
    {"label": "Code it writes", "value": "React Native with Expo; Swift on Rork Max"},
    {"label": "Own your code", "value": "Yes, through GitHub"},
    {"label": "Hosting", "value": "Can publish to the App Store for you"},
    {"label": "Custom domains", "value": "Not applicable for mobile apps"}
  ]'),
  ('bubble', '[
    {"label": "Free plan", "value": "Build and test, but no live app"},
    {"label": "Paid plans from", "value": "$29 a month for web (Starter, billed yearly)"},
    {"label": "Builds", "value": "Web apps and native mobile apps"},
    {"label": "Code it writes", "value": "None: a visual no-code editor"},
    {"label": "Own your code", "value": "No, apps stay on Bubble"},
    {"label": "Backend", "value": "Database, logins and workflows built in"},
    {"label": "Hosting", "value": "Included, billed by workload units"},
    {"label": "Custom domains", "value": "On paid plans"}
  ]'),
  ('flutterflow', '[
    {"label": "Free plan", "value": "Full visual builder, web publishing to a free subdomain"},
    {"label": "Paid plans from", "value": "$39 a month (Basic)"},
    {"label": "Builds", "value": "Mobile, web and desktop apps"},
    {"label": "Code it writes", "value": "Flutter (Dart)"},
    {"label": "Own your code", "value": "Code export from Basic; GitHub sync from Growth"},
    {"label": "Backend", "value": "Connect Firebase or Supabase"},
    {"label": "Hosting", "value": "Web hosting included; app store deployment from Basic"},
    {"label": "Custom domains", "value": "On paid plans"}
  ]'),
  ('softr', '[
    {"label": "Free plan", "value": "10 app users and 5,000 database records"},
    {"label": "Paid plans from", "value": "$49 a month (Basic)"},
    {"label": "Builds", "value": "Client portals, internal tools and business apps"},
    {"label": "Code it writes", "value": "None: a visual no-code editor"},
    {"label": "Own your code", "value": "No, apps stay on Softr"},
    {"label": "Backend", "value": "Built-in database, or Airtable, Google Sheets, Supabase and more"},
    {"label": "Hosting", "value": "Included"},
    {"label": "Custom domains", "value": "Yes, even on the free plan"}
  ]'),
  ('relume', '[
    {"label": "Free plan", "value": "One project and a starter set of components"},
    {"label": "Paid plans from", "value": "$32 a month per user (Starter, billed yearly)"},
    {"label": "Builds", "value": "Sitemaps, wireframes and copy for websites"},
    {"label": "Code it writes", "value": "Exports to Webflow, Figma or React"},
    {"label": "Own your code", "value": "Yes, React export"},
    {"label": "Backend", "value": "None"},
    {"label": "Hosting", "value": "None; publish through Webflow or your own host"},
    {"label": "Custom domains", "value": "Not applicable"}
  ]'),
  ('framer', '[
    {"label": "Free plan", "value": "Publish on a framer.app address with Framer branding"},
    {"label": "Paid plans from", "value": "$10 a month per site (Basic, billed yearly)"},
    {"label": "Builds", "value": "Marketing sites and landing pages"},
    {"label": "Code it writes", "value": "None: a visual editor, with code components if you want them"},
    {"label": "Own your code", "value": "No, sites stay on Framer"},
    {"label": "Backend", "value": "Built-in CMS, no app database"},
    {"label": "Hosting", "value": "Included"},
    {"label": "Custom domains", "value": "On paid plans"}
  ]'),
  ('webflow', '[
    {"label": "Free plan", "value": "Starter: a webflow.io address and a small site"},
    {"label": "Paid plans from", "value": "$15 a month per site (Basic, billed yearly)"},
    {"label": "Builds", "value": "Websites with a CMS"},
    {"label": "Code it writes", "value": "Clean HTML and CSS from a visual editor"},
    {"label": "Own your code", "value": "Code export on paid Workspace plans"},
    {"label": "Backend", "value": "Built-in CMS, no app database"},
    {"label": "Hosting", "value": "Included"},
    {"label": "Custom domains", "value": "On paid site plans"}
  ]'),
  ('durable', '[
    {"label": "Free plan", "value": "Launch a site for $0 on a Durable address"},
    {"label": "Paid plans from", "value": "$12 a month (Starter, billed yearly)"},
    {"label": "Builds", "value": "Small-business websites"},
    {"label": "Code it writes", "value": "None: answer a few questions and edit visually"},
    {"label": "Own your code", "value": "No, sites stay on Durable"},
    {"label": "Backend", "value": "Simple CRM and invoicing, no app database"},
    {"label": "Hosting", "value": "Included"},
    {"label": "Custom domains", "value": "On paid plans"}
  ]'),
  ('figma-make', '[
    {"label": "Free plan", "value": "Figma Starter, with a small monthly allowance of AI credits"},
    {"label": "Paid plans from", "value": "$16 a month (Professional, billed yearly)"},
    {"label": "Builds", "value": "Interactive prototypes and web apps"},
    {"label": "Code it writes", "value": "React and Tailwind"},
    {"label": "Own your code", "value": "Yes, view and copy the code"},
    {"label": "Backend", "value": "Connect Supabase for data and logins"},
    {"label": "Hosting", "value": "Publish to a Figma-hosted address"}
  ]'),
  ('google-ai-studio', '[
    {"label": "Free plan", "value": "Building is free; Gemini API use has a free tier"},
    {"label": "Paid plans from", "value": "Pay as you go for Gemini API and Cloud Run hosting"},
    {"label": "Builds", "value": "Full-stack web apps and native Android apps"},
    {"label": "Code it writes", "value": "React and Node.js; Kotlin for Android"},
    {"label": "Own your code", "value": "Yes, GitHub sync or download a ZIP"},
    {"label": "Backend", "value": "Firebase database and logins, set up for you"},
    {"label": "Hosting", "value": "Deploy to Google Cloud Run, billed by Google Cloud"},
    {"label": "Custom domains", "value": "Yes, through Cloud Run"}
  ]'),
  ('chatgpt-sites', '[
    {"label": "Free plan", "value": "None; needs a paid ChatGPT plan"},
    {"label": "Paid plans from", "value": "ChatGPT Plus"},
    {"label": "Builds", "value": "Websites and lightweight web apps"},
    {"label": "Code it writes", "value": "Runs on Cloudflare Workers; no Node.js servers"},
    {"label": "Backend", "value": "Simple storage on Cloudflare D1 and R2"},
    {"label": "Hosting", "value": "Included, with a shareable link"},
    {"label": "Custom domains", "value": "Yes, if you own the domain"}
  ]')
) as v(slug, facts)
where t.slug = v.slug;

-- Mocha shut down on 2026-08-01 (VIB-142). Removed rather than left as a
-- listing that sends readers to a dead product. Nothing bookmarked it.
delete from tools where slug = 'mocha';

-- Durable builds websites, not apps (VIB-142).
delete from tool_tags
where tool_id = (select id from tools where slug = 'durable')
  and tag_id = (select id from tags where slug = 'web-apps');

-- More IDEs, with tags and key facts (VIB-143). Checked against vendor
-- pricing pages, docs and reviews on 2026-09-14.
insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url) values
  ('Google Antigravity', 'google-antigravity', 'ides',
   'Google''s agent-first IDE, built around Gemini.',
   'A VS Code-style editor where agents plan, write and check code across your project while you review their work. The free Individual plan includes agent access with weekly limits, which makes it one of the cheapest ways to try an agentic IDE.',
   'Freemium', 'https://antigravity.google'),
  ('Kiro', 'kiro', 'ides',
   'AWS''s IDE that writes a spec before it writes code.',
   'Kiro turns a prompt into requirements, a design and a task list, then its agents work through the tasks. The spec stays in the repo as living documentation. Built on Code OSS and powered by Claude through Amazon Bedrock.',
   'Freemium', 'https://kiro.dev'),
  ('Zed', 'zed', 'ides',
   'A fast open-source editor with AI built in.',
   'Written in Rust and noticeably quicker than Electron editors. Its agent panel can use Zed''s hosted models, your own API keys, local models, or external agents such as Claude Code, and the editor itself is free.',
   'Freemium', 'https://zed.dev'),
  ('Trae', 'trae', 'ides',
   'ByteDance''s AI IDE with a generous free plan.',
   'A VS Code-based editor with premium models from several providers included, and a SOLO mode that builds features end to end. The free plan includes premium model requests every month, so you can try it without paying.',
   'Freemium', 'https://www.trae.ai'),
  ('IntelliJ IDEA', 'intellij-idea', 'ides',
   'JetBrains'' IDE for Java and Kotlin, now one free download.',
   'The IDE most Java and Kotlin developers use. Since 2025 it is a single product: the core is free, including for work, and Ultimate unlocks Spring, databases and web tooling. JetBrains AI and the Junie agent run inside it.',
   'Freemium', 'https://www.jetbrains.com/idea/'),
  ('Android Studio', 'android-studio', 'ides',
   'Google''s official IDE for Android apps, with Gemini included.',
   'Built on IntelliJ and free. Gemini in Android Studio is included at no cost, and its Agent Mode can run your app on a device, read the screen and logs, and fix what it finds. You can also plug in other providers or local models.',
   'Free', 'https://developer.android.com/studio'),
  ('Xcode', 'xcode', 'ides',
   'Apple''s IDE for iPhone, iPad and Mac apps, with ChatGPT and Claude built in.',
   'The only way to build and ship apps for Apple platforms. Its coding intelligence connects to ChatGPT or your Claude plan, and can use other providers or local models. Free, and macOS only.',
   'Free', 'https://developer.apple.com/xcode/')
on conflict (slug) do update set
  name         = excluded.name,
  category     = excluded.category,
  tagline      = excluded.tagline,
  description  = excluded.description,
  pricing_tier = excluded.pricing_tier,
  outbound_url = excluded.outbound_url,
  updated_at   = now();

update tools t set platform = v.platform::text[], best_for = v.best_for::role_level
from (values
  ('google-antigravity', '{macos,windows,linux}', 'intermediate'),
  ('kiro',               '{macos,windows,linux}', 'intermediate'),
  ('zed',                '{macos,windows,linux}', 'intermediate'),
  ('trae',               '{macos,windows,linux}', 'beginner'),
  ('intellij-idea',      '{macos,windows,linux}', 'intermediate'),
  ('android-studio',     '{macos,windows,linux}', 'intermediate'),
  ('xcode',              '{macos}',               'intermediate'),
  ('webstorm',           '{macos,windows,linux}', 'intermediate'),
  ('devin-desktop',      '{macos,windows,linux}', 'beginner')
) as v(slug, platform, best_for)
where t.slug = v.slug;

insert into tags (name, slug, kind) values
  ('VS Code based',     'vs-code-based', 'facet'),
  ('JetBrains',         'jetbrains',     'facet'),
  ('Bring your own key','byok',          'facet'),
  ('Local models',      'local-models',  'facet')
on conflict (slug) do update set name = excluded.name, kind = excluded.kind;

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('cursor','vs-code-based'), ('cursor','byok'),
  ('devin-desktop','vs-code-based'),
  ('vs-code','vs-code-based'),
  ('webstorm','jetbrains'), ('webstorm','byok'), ('webstorm','local-models'), ('webstorm','free-trial'),
  ('google-antigravity','vs-code-based'), ('google-antigravity','code-generation'), ('google-antigravity','free-tier'),
  ('kiro','vs-code-based'), ('kiro','code-generation'), ('kiro','free-tier'), ('kiro','free-trial'),
  ('zed','byok'), ('zed','local-models'), ('zed','open-source'), ('zed','code-generation'), ('zed','free-tier'),
  ('trae','vs-code-based'), ('trae','code-generation'), ('trae','free-tier'),
  ('intellij-idea','jetbrains'), ('intellij-idea','byok'), ('intellij-idea','local-models'),
  ('intellij-idea','backend'), ('intellij-idea','free-tier'), ('intellij-idea','free-trial'),
  ('android-studio','jetbrains'), ('android-studio','mobile-apps'), ('android-studio','byok'),
  ('android-studio','local-models'), ('android-studio','free-tier'),
  ('xcode','mobile-apps'), ('xcode','byok'), ('xcode','local-models'), ('xcode','free-tier')
) as m(tool_slug, tag_slug)
join tools t on t.slug = m.tool_slug
join tags  g on g.slug = m.tag_slug
on conflict do nothing;

update tools t set key_facts = v.facts::jsonb, updated_at = now()
from (values
  ('cursor', '[
    {"label": "Free plan", "value": "Hobby: a limited number of Agent requests and Tab completions"},
    {"label": "Paid plans from", "value": "$20 a month (Pro), including $20 of model usage"},
    {"label": "Built on", "value": "A fork of VS Code, so most VS Code extensions work"},
    {"label": "Models", "value": "Claude, GPT, Gemini and Cursor''s own models"},
    {"label": "Your own API key", "value": "Yes: OpenAI, Anthropic, Google, Azure and Bedrock"},
    {"label": "Local models", "value": "No"},
    {"label": "Good for", "value": "Everyday AI coding on any stack"}
  ]'),
  ('devin-desktop', '[
    {"label": "Free plan", "value": "A usage allowance that refreshes daily and weekly"},
    {"label": "Paid plans from", "value": "$20 a month (Pro)"},
    {"label": "Built on", "value": "A fork of VS Code; renamed from Windsurf in June 2026"},
    {"label": "Agent", "value": "Devin Local, which replaced Cascade in July 2026"},
    {"label": "Good for", "value": "People moving over from Windsurf, or already using Devin"}
  ]'),
  ('vs-code', '[
    {"label": "Free plan", "value": "The editor is free; GitHub Copilot Free adds 2,000 completions and 50 chat messages a month"},
    {"label": "Paid plans from", "value": "GitHub Copilot Pro, $10 a month"},
    {"label": "Built on", "value": "Code OSS, Microsoft''s open-source editor"},
    {"label": "Models", "value": "Claude, GPT and Gemini through GitHub Copilot"},
    {"label": "Your own API key", "value": "On Copilot Business and Enterprise"},
    {"label": "Extensions", "value": "The largest marketplace, and the first place most AI tools ship"},
    {"label": "Good for", "value": "A free, flexible editor that works with every AI extension"}
  ]'),
  ('webstorm', '[
    {"label": "Free plan", "value": "Free for non-commercial use"},
    {"label": "Free trial", "value": "30 days for commercial use"},
    {"label": "Paid plans from", "value": "$89 a year for commercial use, cheaper in later years"},
    {"label": "Built on", "value": "The JetBrains IntelliJ platform"},
    {"label": "AI", "value": "JetBrains AI Free and the Junie agent included; AI Pro is $100 a year"},
    {"label": "Your own API key", "value": "Yes, through JetBrains AI''s third-party providers"},
    {"label": "Local models", "value": "Yes, through Ollama or LM Studio"},
    {"label": "Good for", "value": "JavaScript, TypeScript, React, Vue and Node.js"}
  ]'),
  ('google-antigravity', '[
    {"label": "Free plan", "value": "Individual: agent access with weekly limits, unlimited Tab completions"},
    {"label": "Paid plans from", "value": "$20 a month (Pro)"},
    {"label": "Built on", "value": "A fork of VS Code"},
    {"label": "Models", "value": "Gemini, plus Claude Sonnet and GPT-OSS"},
    {"label": "Your own API key", "value": "No"},
    {"label": "Good for", "value": "Handing whole tasks to agents and reviewing the result"}
  ]'),
  ('kiro', '[
    {"label": "Free plan", "value": "50 credits a month"},
    {"label": "Free trial", "value": "500 bonus credits for your first 14 days"},
    {"label": "Paid plans from", "value": "$20 a month (Pro, 1,000 credits)"},
    {"label": "Built on", "value": "Code OSS, with extensions from Open VSX"},
    {"label": "Models", "value": "Claude, through Amazon Bedrock"},
    {"label": "Your own API key", "value": "No"},
    {"label": "Good for", "value": "Planning a feature properly before any code is written"}
  ]'),
  ('zed', '[
    {"label": "Free plan", "value": "The editor is free, with 2,000 accepted AI edit predictions a month"},
    {"label": "Paid plans from", "value": "$10 a month (Pro), unlimited edit predictions"},
    {"label": "Built on", "value": "Its own open-source editor, written in Rust"},
    {"label": "Models", "value": "Zed''s hosted models, or external agents such as Claude Code"},
    {"label": "Your own API key", "value": "Yes, on the free plan"},
    {"label": "Local models", "value": "Yes, through Ollama"},
    {"label": "Good for", "value": "A fast, lightweight editor that works with the agent you already use"}
  ]'),
  ('trae', '[
    {"label": "Free plan", "value": "A monthly allowance of completions and premium model requests"},
    {"label": "Paid plans from", "value": "$10 a month (Pro)"},
    {"label": "Built on", "value": "A fork of VS Code"},
    {"label": "Models", "value": "Claude, GPT, Gemini and DeepSeek, no API keys needed"},
    {"label": "Good for", "value": "Trying an agentic IDE without paying"}
  ]'),
  ('intellij-idea', '[
    {"label": "Free plan", "value": "Core Java and Kotlin features, free for commercial use too"},
    {"label": "Free trial", "value": "30 days of Ultimate"},
    {"label": "Paid plans from", "value": "$19.90 a month or $199 a year (Ultimate)"},
    {"label": "Built on", "value": "The JetBrains IntelliJ platform"},
    {"label": "AI", "value": "JetBrains AI Free and the Junie agent included; AI Pro is $100 a year"},
    {"label": "Your own API key", "value": "Yes, through JetBrains AI''s third-party providers"},
    {"label": "Local models", "value": "Yes, through Ollama or LM Studio"},
    {"label": "Good for", "value": "Java, Kotlin and Spring back ends"}
  ]'),
  ('android-studio', '[
    {"label": "Free plan", "value": "Free, with Gemini included at no cost"},
    {"label": "Paid plans from", "value": "Optional: your own Gemini API key for newer models and higher limits"},
    {"label": "Built on", "value": "The JetBrains IntelliJ platform"},
    {"label": "Models", "value": "Gemini by default, or GPT and Claude with your own key"},
    {"label": "Your own API key", "value": "Yes"},
    {"label": "Local models", "value": "Yes, through Ollama or LM Studio"},
    {"label": "Good for", "value": "Native Android apps in Kotlin"}
  ]'),
  ('xcode', '[
    {"label": "Free plan", "value": "Free"},
    {"label": "Paid plans from", "value": "Uses your ChatGPT or Claude plan for AI"},
    {"label": "Built on", "value": "Apple''s own IDE; macOS only"},
    {"label": "Models", "value": "ChatGPT and Claude built in, or other providers"},
    {"label": "Your own API key", "value": "Yes"},
    {"label": "Local models", "value": "Yes"},
    {"label": "Good for", "value": "iPhone, iPad and Mac apps in Swift"}
  ]')
) as v(slug, facts)
where t.slug = v.slug;

-- CLI tags and key facts (VIB-144). Checked against vendor docs, npm and
-- GitHub on 2026-09-14.
update tools t set platform = '{macos,windows,linux}', best_for = v.best_for::role_level
from (values
  ('codex', 'intermediate'), ('gemini-cli', 'beginner'), ('opencode', 'intermediate'),
  ('skild', 'intermediate'), ('skillkit', 'intermediate'), ('skills-cli', 'intermediate')
) as v(slug, best_for)
where t.slug = v.slug;

insert into tags (name, slug, kind) values
  ('Coding agent', 'coding-agent', 'facet')
on conflict (slug) do update set name = excluded.name, kind = excluded.kind;

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('claude-code','coding-agent'), ('claude-code','byok'),
  ('codex','coding-agent'), ('codex','byok'), ('codex','local-models'),
  ('gemini-cli','coding-agent'), ('gemini-cli','byok'),
  ('opencode','coding-agent'), ('opencode','byok'), ('opencode','local-models'),
  ('aider','coding-agent'), ('aider','byok'), ('aider','local-models')
) as m(tool_slug, tag_slug)
join tools t on t.slug = m.tool_slug
join tags  g on g.slug = m.tag_slug
on conflict do nothing;

update tools t set key_facts = v.facts::jsonb, updated_at = now()
from (values
  ('claude-code', '[
    {"label": "Free plan", "value": "None; needs a paid Claude plan or API credits"},
    {"label": "Paid plans from", "value": "$20 a month (Claude Pro), or pay per token with an API key"},
    {"label": "Install", "value": "curl -fsSL https://claude.ai/install.sh | bash (Windows: irm https://claude.ai/install.ps1 | iex)"},
    {"label": "Models", "value": "Claude"},
    {"label": "Your own API key", "value": "Yes, an Anthropic key, or Amazon Bedrock, Google Vertex AI or Microsoft Foundry"},
    {"label": "Local models", "value": "No"},
    {"label": "Good for", "value": "Handing multi-step coding tasks to an agent that runs commands and edits files"}
  ]'),
  ('codex', '[
    {"label": "Free plan", "value": "The CLI is free and open source; usage needs a ChatGPT plan or API credits"},
    {"label": "Paid plans from", "value": "Included with ChatGPT Plus, or pay per token with an API key"},
    {"label": "Install", "value": "npm install -g @openai/codex"},
    {"label": "Models", "value": "OpenAI''s GPT models"},
    {"label": "Your own API key", "value": "Yes, an OpenAI key"},
    {"label": "Local models", "value": "Yes, open-weight models through Ollama"},
    {"label": "Good for", "value": "ChatGPT subscribers who want an agent in the terminal"}
  ]'),
  ('gemini-cli', '[
    {"label": "Free plan", "value": "1,000 requests a day with a personal Google account"},
    {"label": "Paid plans from", "value": "Pay per token with a Gemini API key, or a Gemini Code Assist plan"},
    {"label": "Install", "value": "npm install -g @google/gemini-cli"},
    {"label": "Models", "value": "Gemini"},
    {"label": "Your own API key", "value": "Yes, a Gemini API key or Vertex AI"},
    {"label": "Local models", "value": "No"},
    {"label": "Good for", "value": "Trying a terminal agent for free"}
  ]'),
  ('opencode', '[
    {"label": "Free plan", "value": "Free and open source; bring your own provider"},
    {"label": "Paid plans from", "value": "Optional: OpenCode Zen models from $10 a month"},
    {"label": "Install", "value": "curl -fsSL https://opencode.ai/install | bash"},
    {"label": "Models", "value": "75+ providers, including OpenAI, Google and open models"},
    {"label": "Your own API key", "value": "Yes"},
    {"label": "Local models", "value": "Yes, through Ollama"},
    {"label": "Good for", "value": "One terminal agent that is not tied to a single model company"}
  ]'),
  ('aider', '[
    {"label": "Free plan", "value": "Free and open source; you pay your model provider"},
    {"label": "Install", "value": "python -m pip install aider-install, then aider-install"},
    {"label": "Models", "value": "Claude, GPT, Gemini, DeepSeek and dozens more"},
    {"label": "Your own API key", "value": "Yes, required"},
    {"label": "Local models", "value": "Yes, through Ollama"},
    {"label": "Git", "value": "Commits every change with a written message"},
    {"label": "Good for", "value": "Careful pair programming where every edit is a reviewable commit"}
  ]'),
  ('skills-cli', '[
    {"label": "Free plan", "value": "Free and open source (MIT)"},
    {"label": "Install", "value": "No install: npx skills add owner/repo"},
    {"label": "Works with", "value": "75+ agents, including Claude Code, Codex, Cursor and GitHub Copilot"},
    {"label": "Commands", "value": "add, list, find, update, remove and init"},
    {"label": "Good for", "value": "Installing a skill from GitHub into whichever agents you use"}
  ]'),
  ('skild', '[
    {"label": "Free plan", "value": "Free and open source (MIT)"},
    {"label": "Install", "value": "npm i -g skild"},
    {"label": "Works with", "value": "Claude, Cursor, Windsurf, OpenCode, Copilot and Antigravity"},
    {"label": "Commands", "value": "install, update, sync, push, publish and search"},
    {"label": "Good for", "value": "Teams keeping the same skill versions across every developer"}
  ]'),
  ('skillkit', '[
    {"label": "Free plan", "value": "Free and open source"},
    {"label": "Install", "value": "npm install -g skillkit"},
    {"label": "Works with", "value": "46 agents, including Claude Code, Cursor, Codex and Gemini CLI"},
    {"label": "Commands", "value": "init, recommend, add and sync"},
    {"label": "Good for", "value": "Using one set of skills across agents with different formats"}
  ]')
) as v(slug, facts)
where t.slug = v.slug;

-- Agents: cloud agents, frameworks, tags and key facts (VIB-145). Checked
-- against vendor docs, pricing pages and reviews on 2026-09-14.
insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url) values
  ('Devin', 'devin', 'agents',
   'A cloud agent you assign tickets to, like a junior engineer.',
   'Describe a task in the web app, Slack or Jira, and Devin plans it, writes the code and tests it on its own machine in the cloud, then opens a pull request. It answers review comments too. Billed by work done, so costs track how much you hand over.',
   'Freemium', 'https://devin.ai'),
  ('Jules', 'jules', 'agents',
   'Google''s cloud coding agent that works on your GitHub repo.',
   'Pick a repository, describe a task, and Jules works on it in the background with Gemini, then opens a pull request for you to review. Free to start with a daily task limit; a Google AI plan raises it.',
   'Freemium', 'https://jules.google.com'),
  ('GitHub Copilot coding agent', 'copilot-coding-agent', 'agents',
   'Assign a GitHub issue to Copilot and get a pull request back.',
   'Copilot''s cloud agent picks up an issue, plans the work, writes the code, runs the tests and opens a pull request, then revises it from your review comments. Included with paid Copilot plans, and handy if your work already lives in GitHub issues.',
   'Paid', 'https://docs.github.com/copilot/concepts/agents/coding-agent/about-coding-agent'),
  ('OpenAI Agents SDK', 'openai-agents-sdk', 'agents',
   'OpenAI''s lightweight framework for multi-agent workflows.',
   'An open-source library for building agents that use tools, hand work to each other and check inputs with guardrails. Works with OpenAI and over 100 other models, in Python or TypeScript.',
   'Open source', 'https://openai.github.io/openai-agents-python/'),
  ('LangGraph', 'langgraph', 'agents',
   'Build agents as controllable step-by-step graphs.',
   'From the LangChain team. You define each step an agent can take and how it moves between them, which makes complex agents easier to debug and run in production. Open source in Python and TypeScript, with optional paid hosting through LangSmith.',
   'Open source', 'https://www.langchain.com/langgraph'),
  ('CrewAI', 'crewai', 'agents',
   'Teams of role-based agents that work together.',
   'Give each agent a role and a goal, such as researcher and writer, and CrewAI coordinates them on a task. One of the quickest frameworks to learn. Open source in Python, with a paid platform for teams.',
   'Open source', 'https://www.crewai.com'),
  ('Mastra', 'mastra', 'agents',
   'A TypeScript framework for agents, workflows and RAG.',
   'Built for JavaScript and TypeScript developers who want to add agents to a web app. Includes workflows, memory, evals and a local studio for testing. The core is open source under Apache 2.0.',
   'Open source', 'https://mastra.ai'),
  ('Google ADK', 'google-adk', 'agents',
   'Google''s Agent Development Kit, in four languages.',
   'An open-source framework for building, testing and deploying agents, optimised for Gemini and Google Cloud but able to use other models. Available in Python, TypeScript, Go and Java.',
   'Open source', 'https://adk.dev'),
  ('Microsoft Agent Framework', 'microsoft-agent-framework', 'agents',
   'Microsoft''s agent framework for Python and .NET, successor to AutoGen.',
   'Combines AutoGen''s multi-agent ideas with Semantic Kernel''s enterprise tooling. Reached 1.0 in April 2026, is open source under MIT, and is where Microsoft points new projects.',
   'Open source', 'https://github.com/microsoft/agent-framework'),
  ('AutoGen', 'autogen', 'agents',
   'Microsoft''s early multi-agent framework, now in maintenance mode.',
   'An open-source framework for several agents that talk to each other to solve a task. Since October 2025 it only gets bug and security fixes; Microsoft recommends Microsoft Agent Framework for new projects.',
   'Open source', 'https://microsoft.github.io/autogen/')
on conflict (slug) do update set
  name         = excluded.name,
  category     = excluded.category,
  tagline      = excluded.tagline,
  description  = excluded.description,
  pricing_tier = excluded.pricing_tier,
  outbound_url = excluded.outbound_url,
  updated_at   = now();

update tools t set platform = v.platform::text[], best_for = v.best_for::role_level
from (values
  ('devin', '{web}', 'intermediate'),
  ('jules', '{web}', 'beginner'),
  ('copilot-coding-agent', '{web}', 'beginner'),
  ('openai-agents-sdk', '{}', 'expert'),
  ('langgraph', '{}', 'expert'),
  ('crewai', '{}', 'intermediate'),
  ('mastra', '{}', 'expert'),
  ('google-adk', '{}', 'expert'),
  ('microsoft-agent-framework', '{}', 'expert')
) as v(slug, platform, best_for)
where t.slug = v.slug;

insert into tags (name, slug, kind) values
  ('Cloud agent',         'cloud-agent',     'facet'),
  ('Agent framework',     'agent-framework', 'facet'),
  ('Opens pull requests', 'opens-prs',       'facet'),
  ('Python',              'python',          'facet'),
  ('TypeScript',          'typescript',      'facet'),
  ('Multi-agent',         'multi-agent',     'facet')
on conflict (slug) do update set name = excluded.name, kind = excluded.kind;

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('devin','cloud-agent'), ('devin','opens-prs'), ('devin','automation'), ('devin','free-tier'),
  ('jules','cloud-agent'), ('jules','opens-prs'), ('jules','automation'), ('jules','free-tier'),
  ('copilot-coding-agent','cloud-agent'), ('copilot-coding-agent','opens-prs'), ('copilot-coding-agent','automation'),
  ('claude-agent-sdk','agent-framework'), ('claude-agent-sdk','python'), ('claude-agent-sdk','typescript'),
  ('openai-agents-sdk','agent-framework'), ('openai-agents-sdk','python'), ('openai-agents-sdk','typescript'),
  ('openai-agents-sdk','multi-agent'), ('openai-agents-sdk','open-source'), ('openai-agents-sdk','backend'),
  ('langgraph','agent-framework'), ('langgraph','python'), ('langgraph','typescript'),
  ('langgraph','multi-agent'), ('langgraph','open-source'), ('langgraph','backend'),
  ('crewai','agent-framework'), ('crewai','python'), ('crewai','multi-agent'), ('crewai','open-source'), ('crewai','backend'),
  ('mastra','agent-framework'), ('mastra','typescript'), ('mastra','open-source'), ('mastra','backend'),
  ('google-adk','agent-framework'), ('google-adk','python'), ('google-adk','typescript'),
  ('google-adk','multi-agent'), ('google-adk','open-source'), ('google-adk','backend'),
  ('microsoft-agent-framework','agent-framework'), ('microsoft-agent-framework','python'),
  ('microsoft-agent-framework','multi-agent'), ('microsoft-agent-framework','open-source'), ('microsoft-agent-framework','backend'),
  ('autogen','agent-framework'), ('autogen','python'), ('autogen','multi-agent')
) as m(tool_slug, tag_slug)
join tools t on t.slug = m.tool_slug
join tags  g on g.slug = m.tag_slug
on conflict do nothing;

update tools t set key_facts = v.facts::jsonb, updated_at = now()
from (values
  ('devin', '[
    {"label": "What it is", "value": "A cloud agent: it works on its own computer while you do something else"},
    {"label": "Do you need to code?", "value": "No, but you should be able to review the code it writes"},
    {"label": "Free plan", "value": "A light agent allowance; Devin''s cloud agents need a paid plan"},
    {"label": "Paid plans from", "value": "Core: pay as you go from $20, about $2.25 per unit of work (roughly 15 minutes)"},
    {"label": "How you give it work", "value": "The web app, Slack or Jira"},
    {"label": "What you get back", "value": "A pull request on GitHub, and replies to your review comments"},
    {"label": "Good for", "value": "Handing off well-defined tickets"}
  ]'),
  ('jules', '[
    {"label": "What it is", "value": "A cloud agent: it works on your GitHub repo in the background"},
    {"label": "Do you need to code?", "value": "No, but you should be able to review the code it writes"},
    {"label": "Free plan", "value": "A daily task limit"},
    {"label": "Paid plans from", "value": "More tasks and newer Gemini models with a Google AI Pro or Ultra plan"},
    {"label": "How you give it work", "value": "Choose a GitHub repository and describe the task"},
    {"label": "What you get back", "value": "A pull request on a new branch"},
    {"label": "Models", "value": "Gemini"},
    {"label": "Good for", "value": "Bug fixes, tests and small features while you work on something else"}
  ]'),
  ('copilot-coding-agent', '[
    {"label": "What it is", "value": "A cloud agent built into GitHub"},
    {"label": "Do you need to code?", "value": "No, but you should be able to review the code it writes"},
    {"label": "Free plan", "value": "Not included in Copilot Free"},
    {"label": "Paid plans from", "value": "GitHub Copilot Pro, $10 a month"},
    {"label": "How you give it work", "value": "Assign a GitHub issue to Copilot, or mention @copilot on a pull request"},
    {"label": "What you get back", "value": "A pull request, revised from your review comments"},
    {"label": "Good for", "value": "Projects that already track work in GitHub issues"}
  ]'),
  ('claude-agent-sdk', '[
    {"label": "What it is", "value": "A framework: a code library for building your own agent"},
    {"label": "Do you need to code?", "value": "Yes, in Python or TypeScript"},
    {"label": "Cost", "value": "The library is free; you pay for Claude usage with an API key or your Claude plan''s Agent SDK credit"},
    {"label": "Models", "value": "Claude, also through Amazon Bedrock, Google Vertex AI or Microsoft Foundry"},
    {"label": "Install", "value": "pip install claude-agent-sdk, or npm install @anthropic-ai/claude-agent-sdk"},
    {"label": "Good for", "value": "Building an agent with the same tools and permissions Claude Code uses"}
  ]'),
  ('openai-agents-sdk', '[
    {"label": "What it is", "value": "A framework: a code library for building your own agents"},
    {"label": "Do you need to code?", "value": "Yes, in Python or TypeScript"},
    {"label": "Cost", "value": "Free and open source; you pay your model provider"},
    {"label": "Models", "value": "OpenAI, plus over 100 other models"},
    {"label": "Install", "value": "pip install openai-agents, or npm install @openai/agents"},
    {"label": "Good for", "value": "Agents that hand work to each other, with guardrails and tracing"}
  ]'),
  ('langgraph', '[
    {"label": "What it is", "value": "A framework: a code library for building your own agents"},
    {"label": "Do you need to code?", "value": "Yes, in Python or TypeScript"},
    {"label": "Cost", "value": "Free and open source; optional paid hosting and monitoring through LangSmith"},
    {"label": "Models", "value": "Any, through LangChain''s integrations"},
    {"label": "Install", "value": "pip install langgraph, or npm install @langchain/langgraph"},
    {"label": "Good for", "value": "Complex agents that need every step to be controllable in production"}
  ]'),
  ('crewai', '[
    {"label": "What it is", "value": "A framework: a code library for teams of agents"},
    {"label": "Do you need to code?", "value": "Yes, in Python"},
    {"label": "Cost", "value": "Free and open source; optional paid platform for teams"},
    {"label": "Models", "value": "Most providers, including local models"},
    {"label": "Install", "value": "pip install crewai"},
    {"label": "Good for", "value": "Getting several role-based agents working together quickly"}
  ]'),
  ('mastra', '[
    {"label": "What it is", "value": "A framework: a code library for agents and AI workflows"},
    {"label": "Do you need to code?", "value": "Yes, in TypeScript"},
    {"label": "Cost", "value": "Free and open source (Apache 2.0); optional hosted cloud"},
    {"label": "Models", "value": "Many providers"},
    {"label": "Install", "value": "npm create mastra@latest"},
    {"label": "Good for", "value": "Adding agents to a JavaScript or Next.js app"}
  ]'),
  ('google-adk', '[
    {"label": "What it is", "value": "A framework: a code library for building, testing and deploying agents"},
    {"label": "Do you need to code?", "value": "Yes, in Python, TypeScript, Go or Java"},
    {"label": "Cost", "value": "Free and open source (Apache 2.0); you pay your model provider"},
    {"label": "Models", "value": "Optimised for Gemini; OpenAI, Anthropic and others through LiteLLM"},
    {"label": "Install", "value": "pip install google-adk"},
    {"label": "Good for", "value": "Agents that will run on Google Cloud"}
  ]'),
  ('microsoft-agent-framework', '[
    {"label": "What it is", "value": "A framework: a code library for agents and multi-agent workflows"},
    {"label": "Do you need to code?", "value": "Yes, in Python or C#"},
    {"label": "Cost", "value": "Free and open source (MIT); you pay your model provider"},
    {"label": "Models", "value": "Several providers, including Azure OpenAI"},
    {"label": "Install", "value": "pip install agent-framework, or the .NET packages from NuGet"},
    {"label": "Good for", "value": ".NET teams, and anyone moving on from AutoGen"}
  ]'),
  ('autogen', '[
    {"label": "What it is", "value": "A framework for agents that talk to each other"},
    {"label": "Status", "value": "Maintenance mode since October 2025: bug and security fixes only"},
    {"label": "Do you need to code?", "value": "Yes, in Python"},
    {"label": "Cost", "value": "Free and open source; you pay your model provider"},
    {"label": "Good for", "value": "Existing AutoGen projects; start new ones on Microsoft Agent Framework"}
  ]')
) as v(slug, facts)
where t.slug = v.slug;
