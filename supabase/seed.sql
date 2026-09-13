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

  ('Agent Skills', 'agent-skills', 'skills',
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

  ('Lovable', 'lovable', 'tools',
   'Describe an app, get a working full-stack build.',
   'A browser-based app builder: you describe what you want and refine it in conversation until it matches. Built on Claude. The quickest route from idea to something clickable if you would rather not touch an editor yet.',
   'Freemium', 'https://lovable.dev'),
  ('Replit', 'replit', 'tools',
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
  ('anthropic-skills','skills-ecosystem'), ('anthropic-skills','design'), ('anthropic-skills','open-source')
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
