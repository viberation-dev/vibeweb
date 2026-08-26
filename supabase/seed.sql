-- Viberation — seed data: tools directory (VIB-27) + Learn content (VIB-32, VIB-35)
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
  ('claude-ai','beginner-friendly'), ('claude-ai','free-tier'),
  ('chatgpt','beginner-friendly'), ('chatgpt','free-tier'),
  ('claude-agent-sdk','automation'), ('claude-agent-sdk','backend'),
  ('autogen','automation'), ('autogen','open-source'),
  ('cursor','code-generation'), ('cursor','beginner-friendly'),
  ('vs-code','free-tier'), ('vs-code','open-source'), ('vs-code','beginner-friendly'),
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
  ('create-t3-app','web-apps'), ('create-t3-app','frontend'), ('create-t3-app','beginner-friendly'),
  ('n8n','automation'), ('n8n','backend'),
  ('zapier','automation'), ('zapier','beginner-friendly'),
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

insert into content (type, title, slug, body, role_level, audience) values
  ('guide', 'What vibe coding actually is', 'what-vibe-coding-is',
   'Vibe coding is building software by describing what you want to an AI model and steering the result, rather than typing every line yourself.

That does not mean you stop thinking. It means the bottleneck moves. Instead of "how do I write this loop", the question becomes "is this the right thing to build, and is what came back actually correct".

The three habits that separate people who ship from people who get stuck:

1. Work in small slices. Ask for one thing, check it, then ask for the next. A model given ten requirements at once will quietly drop three of them.

2. Read what you get back. You do not have to be able to write it from scratch, but you do have to be able to tell whether it does what you asked.

3. Keep a way to undo. Version control is not optional the moment you let something else edit your files.',
   'beginner', null),

  ('guide', 'Choosing your first AI coding setup', 'choosing-your-first-setup',
   'You need three things, and you probably already have one of them.

A model. This is the thing doing the reasoning. Start with whatever is bundled into the tool you pick — swapping models is a later optimisation, not a first decision.

A place to work. Either an AI-native editor, or a CLI agent that edits files in a folder you already have. Editors are gentler if you have never used a terminal. CLI agents give you more rope.

Somewhere to put it. A git repository, and a host that deploys from it. Do this on day one, before you have anything worth losing.

The mistake to avoid is collecting tools. One editor, one model, one host, and something actually finished beats a bookmark folder of things you tried once.',
   'beginner', null),

  ('article', 'Why your AI keeps forgetting what you told it', 'why-ai-forgets-context',
   'Models have a context window — a fixed budget of text they can consider at once. Everything competes for it: your instructions, the files you opened, the errors you pasted, and the whole conversation so far.

When a session runs long, the earliest things fall out of that budget first. That is why the rule you set at the top stops being followed an hour later.

What helps, in order of how much it helps:

Put durable rules in a file the tool reads every session, not in a message. A CLAUDE.md or equivalent survives a new session; a chat message does not.

Start a fresh session per task. A long session is not a memory, it is a liability.

Point at specific files rather than asking it to search. Every wasted read costs budget you wanted for the actual work.',
   'intermediate', null),

  ('article', 'Reviewing code you did not write', 'reviewing-code-you-did-not-write',
   'You are going to merge a lot of code you did not type. Reviewing it is a different skill from writing it, and it is the one that actually keeps a vibe-coded project alive past week three.

Read the diff, not the summary. The summary is what the model believed it did. The diff is what it did.

Check the edges the model was never told about. Empty inputs, a user who is signed out, a list with zero items, a network call that fails. Models write the happy path unprompted and the rest only when asked.

Ask what else calls this. A change that fixes one caller and breaks two others still passes the test you were looking at.

Be suspicious of new dependencies. A package added to save five lines of work is five lines of work plus a supply chain.',
   'intermediate', null),

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
   null, null),

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
   'beginner', null),

  ('article', 'Row level security is the security boundary', 'rls-is-the-boundary',
   'If your database rows are protected by a check in your application code, they are not protected. Anything holding a key can talk to the database directly, and your code is not in that path.

Row level security moves the rule into the database. A policy says which rows a given user can see or change, and it applies to every query from every client, including the ones you did not write.

The practical shape of it:

Public content is readable by everyone and writable only by staff.

Personal data — bookmarks, history, saved progress — is readable and writable only by the row owner.

Counters and aggregates are written by a security definer function, because the table itself is not user-writable.

Application checks are still worth having as defence in depth. They are just not the thing standing between a stranger and your data.',
   'expert', null),

  ('course_link', 'Git and GitHub for absolute beginners', 'course-git-for-beginners',
   'A free, video-based introduction to version control that assumes no prior terminal experience.

Worth doing before you let any AI agent edit your files, because the entire safety net of vibe coding is being able to see what changed and undo it.

Covers repositories, commits, branches, pull requests, and resolving your first merge conflict.

Search for "Git and GitHub for Beginners" on freeCodeCamp — it is a full crash course and costs nothing.',
   'beginner', null),

  ('course_link', 'Full stack fundamentals without the framework churn', 'course-fullstack-fundamentals',
   'A longer course on how web applications actually fit together: requests, responses, databases, authentication and deployment.

The value here is not the specific stack it teaches. It is that once you know what a session cookie is and why a database query can be slow, AI-generated code stops being a black box you either accept or reject on vibes.

The Odin Project and Full Stack Open are both free and both good. Pick one and finish it.',
   'intermediate', null),

  ('help_article', 'Creating your Viberation account', 'help-creating-your-account',
   'You can browse the tool directory and everything in Learn without an account. You need one to save things.

To sign up, use Sign up in the top right. You can either use an email address and password, or continue with GitHub or Google.

If you sign up with email, we send you a confirmation link. Open it to finish creating the account — until you do, signing in will not work.

If you already signed up with Google or GitHub and later try email with the same address, sign in with the original method instead. They are the same account.',
   null, 'enduser'),

  ('help_article', 'Saving and organising bookmarks', 'help-saving-bookmarks',
   'Anything with a Save button can be bookmarked — tools in the directory, and articles and guides in Learn.

Press Save on a card or a detail page. If you are not signed in, we take you to sign in and bring you straight back to where you were.

Everything you save appears on your Bookmarks page.

Folders are just names you type. Type a new name on any bookmark to create that folder, or pick one you have used before to move it there. Bookmarks with no folder collect under Unfiled at the bottom.

Renaming a folder moves everything in it at once. To remove a bookmark, press Saved on it again.',
   null, 'enduser'),

  ('help_article', 'Setting your skill level', 'help-setting-your-level',
   'Your level tells us which guides to put in front of you. It is set on your Profile page, and you can change it whenever you like.

Beginner, intermediate and expert are about how much you want explained, not about how good you are.

On the Learn page we show content written for your level, plus everything written for all levels. Use the level chips to look at another level, or All levels to see everything at once. That choice is per-visit and does not change your profile.',
   null, 'enduser'),

  ('help_article', 'What the tool categories mean', 'help-tool-categories',
   'The directory groups tools by what a thing actually is, not by what you might use it for.

Models are the AI itself. Chats are the conversational apps built on them. Agents do multi-step work on your behalf.

IDEs are editors. CLIs are terminal tools. Skills, MCP servers and plugins all extend a tool you already use, in different ways.

Frameworks, templates and workflows are starting points for a project. Tools and utilities are everything else that helps.

If you are looking for something by subject rather than by kind — frontend, database, free tier — use the tags instead. A tool has one category and as many tags as it needs.',
   null, 'enduser')
on conflict (slug) do update set
  type       = excluded.type,
  title      = excluded.title,
  body       = excluded.body,
  role_level = excluded.role_level,
  audience   = excluded.audience,
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
