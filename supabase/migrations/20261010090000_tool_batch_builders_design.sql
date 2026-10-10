-- Twenty-six tools Ali sent as a list of links (VIB-242).
--
-- The list was 34 URLs. Bolt, Bubble, Base44, Rork and Devin were already
-- rows. Three more are deliberately not here:
--
--   DigUp AI           no named maker, no pricing page and no coverage
--                      anywhere, so nothing on the row could be checked
--   Launch Your Store  a free pre-built Shopify theme behind a Shopify
--                      sign-up link; not a builder and not AI
--   Deductive          bought by Elastic (closed 2026-08-24), demo-only, and
--                      being folded into Elastic Observability
--
-- Everything below was read off the tool's own site and pricing page on
-- 2026-10-10. Where a price could not be read from the vendor (MagicPath,
-- Unicorn Studio's paid plan, Hercules, Blackbox's individual plans, MeDo,
-- Gemini Notebook's paid tiers) key_facts says what the plan is without a
-- number, rather than repeating a figure from a review site.
--
-- Category calls that are not obvious:
--
--   Gemini Notebook  is NotebookLM, renamed by Google on 2026-07-16. The row
--                    carries the new name; the old one is in the description
--                    because that is what people still search for.
--   Kombai           ships a desktop app too, but the thing most people
--                    install is the editor extension, so it is a plugin.
--   Blackbox AI      one row under plugins, per the VIB-191 rule: the CLI,
--                    web app and cloud agents are where it runs.
--   bb               an IDE for running other people's agents, so ides.
--   Printing Press   sits with the other skill CLIs (skild, skillkit).
--   Creao            builds scheduled agents inside tools you already use,
--                    which is what n8n and Zapier are for, so workflows.
--   Duda, Instant    conventional builders with AI added. Included under
--                    app_builders next to Webflow and Framer (Ali).
--   Aura, Neuform    both from Meng To. Aura publishes sites; Neuform makes
--                    templates and design systems to hand to a coding agent.
--
-- pricing_tier is Paid wherever the free plan cannot generate anything
-- (Neuform) or there is only a trial (Duda, Verboo, xPage, Moonchild).
--
-- No badges: none of these has been checked as popular, and the ones that
-- are new this year are not new enough to say so.
insert into tools (name, slug, category, tagline, description, pricing_tier, outbound_url, platform, best_for, badge)
values
  -- app_builders
  ('Softgen', 'softgen', 'app_builders',
   'Describe an app, get a Next.js project in your own GitHub.',
   'Softgen is a chat-based app builder that asks follow-up questions, writes a plan and then builds against it with a live preview. What it produces is ordinary Next.js with Supabase behind it, in a GitHub repository you own, so you can open the same project in Cursor or Claude Code the day you outgrow the builder. Stripe, Resend and analytics are one-click additions, deployment goes to Vercel, and you can pick the model doing the work. You start on trial credits and pay monthly after that.',
   'Freemium', 'https://softgen.ai', array['web'], 'beginner', null),

  ('EZsite', 'ezsite', 'app_builders',
   'Full-stack apps from a prompt, a design or a URL.',
   'EZsite builds a working web app from a description, an uploaded design or an existing site you point it at. The app comes with a database, logins, payments through Stripe or PayPal, scheduled tasks and hosting already wired, and you can connect your own Postgres, MySQL, SQL Server or Oracle database if the data lives elsewhere. Source can be downloaded or synced to GitHub at any point. Plans are monthly with an AI token allowance, and there is a one-off lifetime option.',
   'Paid', 'https://ezsite.ai', array['web'], 'beginner', null),

  ('Adalo', 'adalo', 'app_builders',
   'One visual build that ships to iPhone, Android and the web.',
   'Adalo is a visual builder for database-driven apps, and its point is that one project becomes a native iPhone app, a native Android app and a web app together. Each app gets a hosted Postgres database, and Ada, its AI assistant, builds and edits screens from a prompt on every plan. The free plan is for building and testing only: publishing, custom domains and app store submission start on Starter. Apple and Google developer accounts are a separate cost.',
   'Freemium', 'https://www.adalo.com', array['web','ios','android'], 'beginner', null),

  ('Atoms', 'atoms', 'app_builders',
   'A team of AI agents that plans, builds and markets your app.',
   'Atoms comes from the people behind MetaGPT, and it works the way that project does: a team leader agent hands your request to a product manager, an architect, an engineer and others, and checks in with you before each stage. The result is a website or web app with logins, a database, Stripe payments and hosting from Atoms Cloud, published to a live URL in one click. You can export the code or sync it to GitHub and run it elsewhere. The free plan is a small daily credit allowance.',
   'Freemium', 'https://atoms.dev', array['web'], 'beginner', null),

  ('Hercules', 'hercules', 'app_builders',
   'An app builder aimed at business software, with the backend included.',
   'Hercules builds from chat like the others, but it is pitched at the software a business runs on: CRMs, inventory trackers, HR portals, internal dashboards. Logins, roles and permissions, a database, payments, email, file storage, search and scheduled jobs are part of every app rather than integrations to set up. Apps publish to a custom domain, and can go to the App Store and Google Play as well. It is free to start, with paid cloud credits as you use more.',
   'Freemium', 'https://hercules.app', array['web'], 'beginner', null),

  ('MeDo', 'medo', 'app_builders',
   'Baidu''s no-code builder for full-stack apps.',
   'MeDo is Baidu''s prompt-to-app builder. You describe the app, it produces a working full-stack draft, and you refine layouts and logic in a visual editor in the browser. Finished apps are hosted on Baidu Cloud with a shareable link. It runs on a daily free credit allowance with cheap top-ups, which makes it one of the lower-cost ways to try this kind of tool. Check how export and data location work for you before putting a real project on it.',
   'Freemium', 'https://medo.dev', array['web'], 'beginner', null),

  ('Duda', 'duda', 'app_builders',
   'A website builder made for agencies with many client sites.',
   'Duda is a website builder for people who build sites for other people. Client accounts, white-labelling, team roles and per-site billing are the core of it, and the AI sits on top: it generates sections and whole multi-page sites, writes and translates copy, and handles alt text and SEO. An MCP server lets outside AI tools work on your Duda sites, and Duda Vibe extends it to small web apps. Hosting is included. There is a 14-day trial and no free plan.',
   'Paid', 'https://www.duda.co', array['web'], 'intermediate', null),

  ('Instant', 'instant', 'app_builders',
   'Design Shopify pages and sections without touching theme code.',
   'Instant is a visual page builder for Shopify. You design landing pages, product templates, theme sections, headers and cart drawers on a canvas and publish them into your store''s theme, with a Figma plugin for bringing existing designs across. Paid plans add AI credits, A/B tests and heatmaps. The free plan publishes one page, one section and one blog post, which is enough to see whether it suits your store. It only makes sense if you are already on Shopify.',
   'Freemium', 'https://instant.so', array['web'], 'beginner', null),

  ('Aura', 'aura', 'app_builders',
   'An AI website builder with a designer''s eye for landing pages.',
   'Aura is Meng To''s AI website builder, and it is known for output that looks designed rather than generated. You prompt for a page or remix one of its templates, edit it visually, and either publish with a custom domain and CMS or export HTML and Figma files. Every template comes with a DESIGN.md you can copy and hand to a coding agent to build more pages in the same style. The free plan lets you remix templates and export HTML but includes no AI prompts.',
   'Freemium', 'https://www.aura.build', array['web'], 'beginner', null),

  ('Neuform', 'neuform', 'app_builders',
   'Prompt a landing page, remix it, export the design system.',
   'Neuform is a second tool from Meng To, built around remixing. You start from a prompt or a community template, push it in different directions, and export the result as HTML, React or Figma. The part worth knowing is the design system: one idea becomes a system you can carry across web and mobile, and hand to Claude Code, Codex or Cursor. The free plan only browses the library. Generating needs a paid plan, which starts with a three-day trial.',
   'Paid', 'https://neuform.ai', array['web'], 'intermediate', null),

  ('xPage', 'xpage', 'app_builders',
   'Paste a product link, get a selling landing page.',
   'xPage is a store builder for people selling a product online. Paste a product URL or upload a photo and it writes and lays out a landing page, then handles checkout, orders, payments, bundles and translation into other languages in the same place. It is a closed commerce platform rather than something that gives you code, so treat it as an alternative to a Shopify store, not to Lovable. It starts with a paid trial.',
   'Paid', 'https://www.xpage.ai', array['web'], 'beginner', null),

  -- tools
  ('Gemini Notebook', 'gemini-notebook', 'tools',
   'Google''s research notebook that answers from your own sources.',
   'Gemini Notebook is what NotebookLM became when Google renamed it in July 2026. You give a notebook your sources (documents, links, videos, notes) and it answers from those, with citations back to the passage, rather than from the open web. That makes it good for reading documentation, specs and long threads before you build. It also turns a notebook into an audio overview, and newer plans can run code against your sources. Free with a Google account; higher limits come with Google''s AI plans.',
   'Freemium', 'https://notebook.google', array['web','ios','android'], 'beginner', null),

  ('UX Pilot', 'ux-pilot', 'tools',
   'Wireframes, screens and whole user flows from a prompt.',
   'UX Pilot is an AI design tool that works through the stages a designer would: flowchart, wireframe, then high-fidelity screens, generated for every step of a user journey rather than one screen at a time. It takes a prompt, a sketch, a screenshot or a product requirements document, and can learn your design system from imported Figma components. The free plan has every design feature on a daily credit limit. Exporting to Figma or to code is where the paid plan starts.',
   'Freemium', 'https://uxpilot.ai', array['web'], 'beginner', null),

  ('MagicPath', 'magicpath', 'tools',
   'A design canvas your coding agent can work on with you.',
   'MagicPath is an infinite canvas for interface design where AI agents are collaborators. One request sets several agents designing screens or variations in parallel, and teammates see them move in real time. Its distinctive part is the link to code: install the MagicPath plugin in Claude Code, Codex or Cursor and that agent can put designs on your canvas, push a design into your repository, or pull a component back out. It also opens from inside ChatGPT.',
   'Freemium', 'https://www.magicpath.ai', array['web'], 'intermediate', null),

  ('Moonchild', 'moonchild', 'tools',
   'Turn a requirements doc into screens built from your design system.',
   'Moonchild is a chat-based design tool that assembles screens from the design system you already have, imported from Figma, GitHub or a live URL. Paste a product requirements document and it maps the flows and generates the screens and a prototype. Designs go out to Figma, or to Claude Code and Cursor as structured output through its MCP server, which is a cleaner handoff than a screenshot. Plans are paid and metered in credits.',
   'Paid', 'https://moonchild.ai', array['web'], 'intermediate', null),

  ('Unicorn Studio', 'unicorn-studio', 'tools',
   'Shader and motion effects for your site, without writing shaders.',
   'Unicorn Studio is a browser tool for making the animated, interactive backgrounds and hero graphics you see on polished landing pages. You stack effects on layers, tie them to scroll, hover or mouse movement, and embed the result in Framer, Webflow or your own app with a small script. An AI agent writes custom shader effects from a description, and there is a code editor if you want to write your own. The free plan embeds with a logo.',
   'Freemium', 'https://www.unicorn.studio', array['web'], 'intermediate', null),

  ('YouMind', 'youmind', 'tools',
   'Save what you read and watch, then make something from it.',
   'YouMind is a research and creation workspace. You save articles, videos, podcasts and files into it, ask questions across them, and then turn what you have gathered into articles, slides, images, video or a webpage. Higher plans add an agent that browses and completes tasks for you, memory across sessions, and connections to Notion, Linear and GitHub over MCP. It is closer to Gemini Notebook than to an app builder, with more ways to publish what comes out.',
   'Paid', 'https://youmind.com', array['web','ios','android','macos'], 'beginner', null),

  ('CodeRabbit', 'coderabbit', 'tools',
   'AI code review on every pull request.',
   'CodeRabbit reviews your pull requests the way a careful colleague would: a plain-language summary of what changed, line comments on likely bugs, and one-click fixes for the simple ones. It learns from the feedback you give it, and it also reviews from the command line and inside your editor, so a coding agent can have its own work checked before you see it. For anyone shipping AI-written code it is a cheap second pair of eyes. Public repositories are reviewed free.',
   'Freemium', 'https://www.coderabbit.ai', array['web'], 'intermediate', null),

  -- plugins
  ('Kombai', 'kombai', 'plugins',
   'A frontend agent that designs first, then codes in your stack.',
   'Kombai is a coding agent that only does frontend, and does it in two modes. Design mode gives you a canvas to try directions and make targeted edits before any production code changes. Code mode then writes into your existing repository, reusing your components, tokens and Storybook rather than inventing new ones. It reads Figma files directly, picks from many models or routes for you, and tests its work in a built-in browser. It installs as an extension in VS Code and its forks, or as a desktop app.',
   'Freemium', 'https://kombai.com', array['macos','windows','linux'], 'intermediate', null),

  ('Blackbox AI', 'blackbox-ai', 'plugins',
   'A coding assistant with hundreds of models behind one login.',
   'Blackbox AI is a coding assistant best known as a VS Code extension, with the same agent reachable from a CLI, a web app and cloud agents that run in a sandbox. Its selling point is breadth: several hundred models, open and closed, behind one account and one bill, with routing and failover between them. That makes it a low-effort way to try many models on real code. The company is now pitching mainly at enterprises, so read the current plan page before relying on a price you saw in a review.',
   'Freemium', 'https://www.blackbox.ai', array['macos','windows','linux','web'], 'intermediate', null),

  -- clis
  ('Command Code', 'command-code', 'clis',
   'A terminal coding agent that learns how you like code written.',
   'Command Code is a terminal coding agent built around open models and around learning your preferences. Every edit you accept, reject or rewrite is treated as a signal and turned into project skills and personal memory, which a team can share. It also repairs the malformed tool calls open models tend to produce, which is most of what makes them frustrating in other agents. There are dozens of models to choose from, plan mode, MCP, custom agents and a desktop app. Free to start.',
   'Freemium', 'https://commandcode.ai', array['macos','windows','linux'], 'intermediate', null),

  ('Verboo Code', 'verboo-code', 'clis',
   'A terminal coding agent with flat-rate, unmetered tokens.',
   'Verboo Code is a terminal coding agent from Brazil with an unusual pricing model: each plan rents you a dedicated GPU running open models, so there is no token meter, only a limit on requests per minute. You switch between its models mid-conversation, and because it exposes an OpenAI-compatible endpoint you can point OpenCode, Cursor or any other client at it instead. Worth pricing up if your agent bills are unpredictable. The trial is ten million tokens.',
   'Paid', 'https://verboo.ai/en', array['macos','windows','linux'], 'expert', null),

  ('Printing Press', 'printing-press', 'clis',
   'Generate an agent-friendly CLI for any API or website.',
   'Printing Press takes an API spec, or a website with no public API, and prints a command-line tool for it that an agent can use efficiently, along with a Claude Code skill and an MCP server for the same thing. The CLIs it makes keep a local SQLite copy of the data and combine several calls into one command, so the agent spends fewer tokens. If you do not want to generate your own, there is a searchable library of ready-made ones you install by name.',
   'Open source', 'https://printingpress.dev', array['macos','windows','linux'], 'expert', null),

  -- ides
  ('bb', 'bb', 'ides',
   'An open-source workspace for running many coding agents.',
   'bb calls itself the IDE that builds itself. It is a desktop app for running coding agents in parallel threads, each in its own git worktree, with a view of what every agent has changed. It does not bring a model: it drives the agent CLIs you already have signed in, including Claude Code, Codex, Cursor and opencode. Agents can be scheduled, given a browser to test with, and pointed at bb itself to customise it. The Mac build is stable; Windows and Linux are alpha.',
   'Open source', 'https://getbb.app', array['macos','windows','linux'], 'expert', null),

  -- templates
  ('ShipAny', 'shipany', 'templates',
   'A paid Next.js starter for launching an AI product.',
   'ShipAny is a paid starter kit for AI software products. You get a Next.js codebase with logins, Stripe payments, subscriptions, credit billing, translations, a user dashboard and an admin panel already built, plus ready-made variants for image and video generators. It is written to be extended by a coding agent, so the usual route is to buy a template, open it in Claude Code or Cursor, and describe your product. You pay once per template and get the repository.',
   'Paid', 'https://shipany.ai', array[]::text[], 'intermediate', null),

  -- workflows
  ('Creao', 'creao', 'workflows',
   'Describe a recurring task and get an agent that runs it.',
   'Creao builds agents for repeating work. You describe the task in plain language (answer quote requests, watch stock levels, draft a weekly brief), and it builds an agent that runs on a schedule, on a webhook or when a Slack message arrives, inside Gmail, Sheets, Slack and the other tools you connect. You decide per agent how much it may do alone and where it must stop for approval. It remembers across runs, and can generate images, video and speech along the way.',
   'Freemium', 'https://creao.ai', array['web'], 'beginner', null)
on conflict (slug) do nothing;

update tools set key_facts = f.facts, updated_at = now()
from (values
  ('softgen', '[
    {"label": "Free plan", "value": "Trial credits, no card needed"},
    {"label": "Paid plans from", "value": "$25 a month (Starter)"},
    {"label": "Builds", "value": "Full-stack web apps"},
    {"label": "Code it writes", "value": "Next.js"},
    {"label": "Own your code", "value": "Yes, in a GitHub repo you own"},
    {"label": "Backend", "value": "Managed Supabase, or connect your own"},
    {"label": "Hosting", "value": "One-click deploy to Vercel"}
  ]'::jsonb),
  ('ezsite', '[
    {"label": "Paid plans from", "value": "$25 a month (Starter), or a one-off lifetime plan"},
    {"label": "Builds", "value": "Full-stack web apps, with Android from the same project"},
    {"label": "Code it writes", "value": "React or Vue"},
    {"label": "Own your code", "value": "Yes, download it or sync to GitHub"},
    {"label": "Backend", "value": "Built-in database, logins and payments, or connect your own database"},
    {"label": "Hosting", "value": "Included, on an EZsite address"},
    {"label": "Custom domains", "value": "One on Starter, more on higher plans"}
  ]'::jsonb),
  ('adalo', '[
    {"label": "Free plan", "value": "Build and test only, nothing published"},
    {"label": "Paid plans from", "value": "$36 a month (Starter, billed yearly)"},
    {"label": "Builds", "value": "Native iPhone and Android apps, and web apps"},
    {"label": "AI", "value": "Ada, in beta, on every plan"},
    {"label": "Backend", "value": "Hosted Postgres per app, plus external REST APIs"},
    {"label": "App stores", "value": "Automated publishing on paid plans"},
    {"label": "Custom domains", "value": "On paid plans"}
  ]'::jsonb),
  ('atoms', '[
    {"label": "Made by", "value": "The MetaGPT team"},
    {"label": "Free plan", "value": "15 credits a day, up to 25 a month"},
    {"label": "Paid plans from", "value": "$20 a month (Pro)"},
    {"label": "Builds", "value": "Websites and web apps"},
    {"label": "Own your code", "value": "Yes, export it or sync to GitHub"},
    {"label": "Backend", "value": "Atoms Cloud: logins, database and Stripe payments"},
    {"label": "Hosting", "value": "Included, one-click publish"}
  ]'::jsonb),
  ('hercules', '[
    {"label": "Made by", "value": "Zeus AI Labs"},
    {"label": "Costs", "value": "Free to start, then paid cloud credits"},
    {"label": "Builds", "value": "Internal tools, customer-facing apps, sites and mobile apps"},
    {"label": "Backend", "value": "Built in: logins, roles, database, payments, email and storage"},
    {"label": "Hosting", "value": "Included"},
    {"label": "Custom domains", "value": "Yes"},
    {"label": "App stores", "value": "Publishes to the App Store and Google Play"}
  ]'::jsonb),
  ('medo', '[
    {"label": "Made by", "value": "Baidu"},
    {"label": "Costs", "value": "A free daily credit allowance, with paid top-ups"},
    {"label": "Builds", "value": "Full-stack web apps"},
    {"label": "Editing", "value": "Chat plus a visual editor"},
    {"label": "Hosting", "value": "Included, on Baidu Cloud"}
  ]'::jsonb),
  ('duda', '[
    {"label": "Free plan", "value": "None; 14-day trial without a card"},
    {"label": "Paid plans from", "value": "$19 a month (Basic, billed yearly)"},
    {"label": "Builds", "value": "Websites, online stores and booking sites"},
    {"label": "Built for", "value": "Agencies: client accounts, team roles and white-labelling"},
    {"label": "AI", "value": "Generates sections and whole sites, copy, translation and SEO"},
    {"label": "Works with agents", "value": "Yes, through its MCP server"},
    {"label": "Hosting", "value": "Included"}
  ]'::jsonb),
  ('instant', '[
    {"label": "Free plan", "value": "Publish one page, one section and one blog post"},
    {"label": "Paid plans", "value": "Starter, Pro and Business, with a 7-day trial"},
    {"label": "Builds", "value": "Shopify landing pages, sections and product templates"},
    {"label": "Needs", "value": "A Shopify store"},
    {"label": "Figma", "value": "Plugin on every plan"},
    {"label": "Testing", "value": "A/B tests and heatmaps on Pro and above"}
  ]'::jsonb),
  ('aura', '[
    {"label": "Made by", "value": "Meng To"},
    {"label": "Free plan", "value": "Remix templates and export HTML; no AI prompts"},
    {"label": "Paid plans from", "value": "$25 a month (Pro), half that billed yearly"},
    {"label": "Builds", "value": "Websites and landing pages"},
    {"label": "Code it writes", "value": "HTML with Tailwind"},
    {"label": "Exports", "value": "HTML on every plan; Figma on paid plans"},
    {"label": "Custom domains", "value": "On paid plans"},
    {"label": "Good for", "value": "A DESIGN.md to hand to your coding agent"}
  ]'::jsonb),
  ('neuform', '[
    {"label": "Made by", "value": "Meng To"},
    {"label": "Free plan", "value": "Browse the template library only"},
    {"label": "Paid plans from", "value": "$25 a month (Pro), half that billed yearly"},
    {"label": "Trial", "value": "Three days and 20 prompts"},
    {"label": "Builds", "value": "Landing pages, mobile screens and design systems"},
    {"label": "Exports", "value": "HTML, React and Figma"}
  ]'::jsonb),
  ('xpage', '[
    {"label": "Costs", "value": "Paid, starting with a $1 trial for 14 days"},
    {"label": "Builds", "value": "Product landing pages with checkout"},
    {"label": "Starts from", "value": "A product link, a photo, or from scratch"},
    {"label": "Includes", "value": "Payments, order tracking, bundles and analytics"},
    {"label": "Own your code", "value": "No, it is a hosted platform"}
  ]'::jsonb),
  ('gemini-notebook', '[
    {"label": "Made by", "value": "Google"},
    {"label": "Formerly", "value": "NotebookLM, renamed July 2026"},
    {"label": "Costs", "value": "Free with a Google account; higher limits on Google AI plans"},
    {"label": "Answers from", "value": "The sources you add, with citations"},
    {"label": "Also makes", "value": "Audio overviews of a notebook"},
    {"label": "Good for", "value": "Reading docs and specs before you build"}
  ]'::jsonb),
  ('ux-pilot', '[
    {"label": "Free plan", "value": "80 credits a day, every design feature, one project"},
    {"label": "Paid plans from", "value": "$29 a month (Pro), $19 billed yearly"},
    {"label": "Takes", "value": "A prompt, a sketch, a screenshot or a requirements doc"},
    {"label": "Gives you", "value": "Flowcharts, wireframes, high-fidelity screens and prototypes"},
    {"label": "Exports", "value": "Figma and code, on paid plans"},
    {"label": "Design systems", "value": "Imports your Figma components"}
  ]'::jsonb),
  ('magicpath', '[
    {"label": "Costs", "value": "Free to start, with paid plans metered in credits"},
    {"label": "Gives you", "value": "Interactive prototypes and components on a shared canvas"},
    {"label": "Works with", "value": "Claude Code, Codex and Cursor, through a plugin"},
    {"label": "Also opens in", "value": "ChatGPT"},
    {"label": "Good for", "value": "Moving designs into a repo and components back out"}
  ]'::jsonb),
  ('moonchild', '[
    {"label": "Made by", "value": "Devign"},
    {"label": "Costs", "value": "Pro and Max plans, metered in credits"},
    {"label": "Takes", "value": "A requirements doc and your design system"},
    {"label": "Design systems", "value": "Imports from Figma, GitHub or a live URL"},
    {"label": "Exports", "value": "Figma, or to Claude Code and Cursor over MCP"}
  ]'::jsonb),
  ('unicorn-studio', '[
    {"label": "Free plan", "value": "All effects, embeds carry a logo"},
    {"label": "Paid plan", "value": "Removes the logo and adds a commercial licence"},
    {"label": "Makes", "value": "Shader, 3D and motion graphics for web pages"},
    {"label": "Embeds in", "value": "Framer, Webflow, Figma or your own app"},
    {"label": "AI", "value": "An agent that writes shader effects from a description"},
    {"label": "Exports", "value": "A small script embed, or WebM and MP4 video"}
  ]'::jsonb),
  ('youmind', '[
    {"label": "Made by", "value": "Mind Motor"},
    {"label": "Paid plans from", "value": "$20 a month (Starter)"},
    {"label": "Saves", "value": "Articles, videos, podcasts, files and notes"},
    {"label": "Makes", "value": "Articles, slides, images, video and webpages"},
    {"label": "Connects to", "value": "Notion, Linear, GitHub and more over MCP, on Pro"},
    {"label": "Apps", "value": "Web, iPhone, Android, a Mac beta and a browser extension"}
  ]'::jsonb),
  ('coderabbit', '[
    {"label": "Free plan", "value": "Public repositories, free for good"},
    {"label": "Paid plans from", "value": "$30 a developer a month (Essentials), $24 billed yearly"},
    {"label": "Trial", "value": "14 days"},
    {"label": "Reviews in", "value": "Pull requests, the command line and your editor"},
    {"label": "Works with", "value": "GitHub and GitLab"},
    {"label": "Good for", "value": "A second check on AI-written code"}
  ]'::jsonb),
  ('kombai', '[
    {"label": "Free plan", "value": "300 credits a month"},
    {"label": "Paid plans from", "value": "$20 a month (Pro)"},
    {"label": "Works in", "value": "VS Code, Cursor, Antigravity, Trae and Kiro, or its own desktop app"},
    {"label": "Does", "value": "Frontend only: design on a canvas, then code in your repo"},
    {"label": "Figma", "value": "Reads Figma files directly"},
    {"label": "Models", "value": "Claude, GPT, Grok, Kimi and others, or auto-routed"}
  ]'::jsonb),
  ('blackbox-ai', '[
    {"label": "Costs", "value": "Free to start; check the site for current paid plans"},
    {"label": "Works in", "value": "VS Code and JetBrains"},
    {"label": "Also available as", "value": "A CLI, a web app and cloud agents"},
    {"label": "Models", "value": "Several hundred, open and closed, behind one account"},
    {"label": "Good for", "value": "Trying many models on the same code"}
  ]'::jsonb),
  ('command-code', '[
    {"label": "Free plan", "value": "Yes, for solo developers"},
    {"label": "Paid plans from", "value": "$1 a month (Go); Pro is $20"},
    {"label": "Install", "value": "npm i -g command-code"},
    {"label": "Models", "value": "Dozens, mostly open: GLM, Qwen, DeepSeek, Kimi, MiniMax and more"},
    {"label": "Learns", "value": "Your accepts, rejects and edits, as shareable skills"},
    {"label": "Also available as", "value": "A desktop app for Mac, Windows and Linux"}
  ]'::jsonb),
  ('verboo-code', '[
    {"label": "Made by", "value": "Verboo Tecnologia, Brazil"},
    {"label": "Costs", "value": "Pro $69, Max $129 and Ultra $269 a month"},
    {"label": "Trial", "value": "10 million tokens; a card is saved at signup"},
    {"label": "Install", "value": "npm install -g @verboo/code"},
    {"label": "Limits", "value": "Requests per minute, not tokens"},
    {"label": "Works with", "value": "Any client that speaks the OpenAI API"}
  ]'::jsonb),
  ('printing-press', '[
    {"label": "Cost", "value": "Free and open source (MIT)"},
    {"label": "Made by", "value": "Matt Van Horn"},
    {"label": "Gives you", "value": "A Go CLI, a Claude Code skill and an MCP server"},
    {"label": "Starts from", "value": "An API spec, or a website with no API"},
    {"label": "Use it", "value": "/printing-press <app> inside Claude Code"},
    {"label": "Needs", "value": "Go and Node"}
  ]'::jsonb),
  ('bb', '[
    {"label": "Cost", "value": "Free and open source (MIT)"},
    {"label": "Try it", "value": "npx bb-app@latest"},
    {"label": "Runs", "value": "Claude Code, Codex, Cursor, opencode and other agent CLIs"},
    {"label": "Models", "value": "None of its own; it uses the agents you are signed in to"},
    {"label": "Platforms", "value": "Mac is stable; Windows and Linux are alpha"}
  ]'::jsonb),
  ('shipany', '[
    {"label": "Cost", "value": "Paid, once per template"},
    {"label": "Built on", "value": "Next.js, Tailwind and shadcn/ui"},
    {"label": "Includes", "value": "Logins, Stripe payments, credit billing, translations and an admin panel"},
    {"label": "Backend", "value": "Supabase with Drizzle"},
    {"label": "Deploys to", "value": "Vercel, Cloudflare, AWS or Netlify"},
    {"label": "You get", "value": "Access to the GitHub repository"}
  ]'::jsonb),
  ('creao', '[
    {"label": "Free plan", "value": "30 one-time credits, no card needed"},
    {"label": "Paid plans from", "value": "$20 a month (Pro)"},
    {"label": "Runs on", "value": "A schedule, a webhook or a Slack message"},
    {"label": "Connects to", "value": "Gmail, Google Sheets, Slack and many more"},
    {"label": "Control", "value": "Approval gates per agent"},
    {"label": "Models", "value": "OpenAI, Anthropic, Google and others, plus its own Lite model"}
  ]'::jsonb)
) as f(slug, facts)
where tools.slug = f.slug;

insert into tool_tags (tool_id, tag_id)
select t.id, g.id
from (values
  ('softgen', array['web-apps','database','free-trial','nextjs','react','supabase','vercel','code-export','github-sync']),
  ('ezsite', array['web-apps','mobile-apps','database','react','code-export','github-sync','no-code']),
  ('adalo', array['mobile-apps','web-apps','database','postgres','free-tier','no-code','beginner-friendly']),
  ('atoms', array['web-apps','websites','database','free-tier','multi-agent','code-export','github-sync']),
  ('hercules', array['web-apps','mobile-apps','database','free-tier','no-code']),
  ('medo', array['web-apps','database','free-tier','no-code']),
  ('duda', array['websites','free-trial','no-code','design','remote-mcp']),
  ('instant', array['websites','frontend','design','free-tier','no-code']),
  ('aura', array['websites','frontend','design','free-tier','code-export']),
  ('neuform', array['websites','frontend','design','free-trial','code-export','react']),
  ('xpage', array['websites','free-trial','no-code']),
  ('gemini-notebook', array['free-tier','search','audio','beginner-friendly']),
  ('ux-pilot', array['frontend','design','free-tier','no-code','code-export']),
  ('magicpath', array['frontend','design','free-tier','code-export','multi-agent']),
  ('moonchild', array['frontend','design','remote-mcp']),
  ('unicorn-studio', array['frontend','design','free-tier','no-code']),
  ('youmind', array['search','image-generation','video-generation','mcp-client']),
  ('coderabbit', array['free-tier','free-trial','security-checks','testing']),
  ('kombai', array['coding-agent','code-generation','frontend','design','extension','vs-code','free-tier','mcp-client','macos','windows','linux']),
  ('blackbox-ai', array['coding-agent','code-generation','extension','vs-code','jetbrains','free-tier','cloud-agent']),
  ('command-code', array['coding-agent','code-generation','local-files','mcp-client','free-tier','macos','windows','linux']),
  ('verboo-code', array['coding-agent','code-generation','local-files','free-trial','macos','windows','linux']),
  ('printing-press', array['open-source','skills-ecosystem','local-mcp','go','automation']),
  ('bb', array['open-source','coding-agent','multi-agent','local-files','macos','windows','linux']),
  ('shipany', array['web-apps','nextjs','react','typescript','supabase','database']),
  ('creao', array['automation','free-tier','no-code','cloud-agent'])
) as m(slug, tag_slugs)
join tools t on t.slug = m.slug
join tags g on g.slug = any(m.tag_slugs)
on conflict (tool_id, tag_id) do nothing;

-- The rows a reader will already have open. pairs_with for all of them, for
-- the reason given in the Qoder migration: tool_links has no "alternative to".
-- A link shows on both pages, so two new rows are linked once, with a note
-- that reads the same from either end.
insert into tool_links (tool_id, linked_tool_id, kind, note, sort_order)
select a.id, b.id, 'pairs_with', n.note, n.sort_order
from (values
  ('softgen', 'lovable', 'the same idea, on React and Vite', 0),
  ('softgen', 'cursor', 'where the Next.js repo goes next', 1),
  ('ezsite', 'base44', 'the other all-in-one builder', 0),
  ('adalo', 'flutterflow', 'the more technical route to native apps', 0),
  ('adalo', 'rork', 'native apps from a prompt', 1),
  ('atoms', 'lovable', 'one agent instead of a team', 0),
  ('hercules', 'base44', 'the same backend-included pitch', 0),
  ('hercules', 'softr', 'internal tools on top of your existing data', 1),
  ('medo', 'bolt', 'the same shape, in the browser', 0),
  ('duda', 'webflow', 'more design control, less agency tooling', 0),
  ('instant', 'webflow', 'the same visual approach, outside Shopify', 0),
  ('aura', 'neuform', 'the same maker, Meng To', 0),
  ('aura', 'design-md', 'the file every Aura template ships with', 1),
  ('neuform', 'design-md', 'the format its design systems export to', 0),
  ('xpage', 'durable', 'a quick site for a business rather than a product', 0),
  ('gemini-notebook', 'gemini-app', 'the general Gemini chat', 0),
  ('gemini-notebook', 'perplexity', 'answers from the web instead of your sources', 1),
  ('ux-pilot', 'google-stitch', 'the free one from Google', 0),
  ('ux-pilot', 'figma-make', 'if you are already in Figma', 1),
  ('magicpath', 'claude-code', 'works on the canvas through the plugin', 0),
  ('magicpath', 'claude-design', 'the other canvas built around an agent', 1),
  ('moonchild', 'ux-pilot', 'both turn a requirements doc into screens', 0),
  ('unicorn-studio', 'framer', 'where most of these scenes end up', 0),
  ('unicorn-studio', 'aura', 'Unicorn scenes work as Aura backgrounds', 1),
  ('youmind', 'gemini-notebook', 'both answer from the sources you save', 0),
  ('coderabbit', 'coderabbit-code-review', 'the skill that runs it from your agent', 0),
  ('coderabbit', 'github-copilot', 'the other reviewer on your pull requests', 1),
  ('kombai', 'cline', 'a general agent in the same editor', 0),
  ('kombai', 'cursor', 'one of the editors it installs into', 1),
  ('blackbox-ai', 'github-copilot', 'the default it competes with', 0),
  ('blackbox-ai', 'openrouter', 'many models behind one key, without the agent', 1),
  ('command-code', 'opencode', 'the other terminal agent for open models', 0),
  ('command-code', 'claude-code', 'the one it is measured against', 1),
  ('verboo-code', 'opencode', 'can use Verboo as its model endpoint', 0),
  ('printing-press', 'claude-code', 'where you run /printing-press', 0),
  ('printing-press', 'skills-cli', 'installs the skills it produces', 1),
  ('bb', 'claude-code', 'one of the agents it drives', 0),
  ('bb', 'codex', 'another one', 1),
  ('shipany', 'create-t3-app', 'the free starter, without the billing', 0),
  ('shipany', 'shadcn-ui', 'the components it is built from', 1),
  ('creao', 'n8n', 'the same job, wired by hand', 0),
  ('creao', 'zapier', 'the same job, as fixed steps', 1)
) as n(slug, linked_slug, note, sort_order)
join tools a on a.slug = n.slug
join tools b on b.slug = n.linked_slug
on conflict (tool_id, linked_tool_id) do nothing;
