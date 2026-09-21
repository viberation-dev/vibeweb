/**
 * Plain-English explainers shown at the top of a directory category
 * (VIB-145). Every category has one since VIB-182: keyed by the enum, so a
 * new category fails the build until it is explained.
 *
 * "Agent" is the word vibe coders find most confusing: the same word covers
 * the thing inside Cursor, a service that opens pull requests while you
 * sleep, and a Python library. A category whose name needs explaining gets
 * an entry here first. Signed-in members can hide one they have
 * understood; the hidden categories live in a cookie so the first paint is
 * already collapsed.
 *
 * Links are written as `{ category, tag }` rather than URLs so the page
 * builds them with toolsHref, and a tag link filters this same category.
 */
import type { ToolCategory } from "@/lib/tool-categories";

/** Comma-separated categories whose explainer this member has hidden. */
export const GUIDES_HIDDEN_COOKIE = "guides_hidden";

/** Parses the cookie value; unknown entries are harmless and ignored by lookups. */
export function hiddenGuides(value: string | undefined): string[] {
  return value?.split(",").filter(Boolean) ?? [];
}

export type CategoryGuide = {
  title: string;
  intro: string;
  kinds: ReadonlyArray<{
    name: string;
    body: string;
    links: ReadonlyArray<{ label: string; category: string; tag?: string }>;
  }>;
  /** One line on picking between the kinds. */
  choose: string;
};

export const CATEGORY_GUIDES: Readonly<Record<ToolCategory, CategoryGuide>> = {
  agents: {
    title: "What is an AI agent?",
    intro:
      "A chatbot answers you. An agent does the work. You give it a goal, and it works in a loop: it reads your files, runs commands, checks the result and tries again, until the job is done or it needs you.",
    kinds: [
      {
        name: "In your editor or terminal",
        body: "Claude Code, Cursor and Codex. You watch the agent work and approve changes as it goes. This is where most vibe coders start.",
        links: [
          { label: "See IDEs", category: "ides" },
          { label: "See CLIs", category: "clis" },
        ],
      },
      {
        name: "Cloud agents",
        body: "Devin, Jules and GitHub Copilot's coding agent. You hand over a task, close your laptop, and come back to a pull request to review. No coding needed, but you should check what it wrote.",
        links: [{ label: "Show cloud agents", category: "agents", tag: "cloud-agent" }],
      },
      {
        name: "Agent frameworks",
        body: "Code libraries for building your own agent into a product, such as a support bot that can look up orders. You will write code, usually Python or TypeScript.",
        links: [{ label: "Show frameworks", category: "agents", tag: "agent-framework" }],
      },
    ],
    choose:
      "Building an app with AI? Start with an agent in your editor or terminal. Want tasks done while you are away? Try a cloud agent. Adding an AI feature for your own users? That is when you need a framework.",
  },
  // VIB-161. Every walkthrough says "run this in your terminal", and
  // beginners do not know which one, or what the difference from a shell is.
  terminals: {
    title: "Terminal, shell or command line?",
    intro:
      "When you are starting out, they all mean the same thing: a window where you type a command and press Enter. Strictly, the terminal is the window and the shell is the program inside it that runs what you type, such as PowerShell, bash or zsh. Your computer already has one, so you do not need to install anything to begin.",
    kinds: [
      {
        name: "On Windows",
        body: "Open Windows Terminal from the Start menu. It runs PowerShell, which handles npm, npx and git commands. Install Git for Windows as well and you also get Git Bash, handy for guides written for Mac or Linux.",
        links: [{ label: "Show Windows terminals", category: "terminals", tag: "windows" }],
      },
      {
        name: "On a Mac",
        body: "Terminal comes with every Mac. Press Cmd+Space, type Terminal and press Enter. It runs zsh, which works with almost every guide you will find.",
        links: [{ label: "Show Mac terminals", category: "terminals", tag: "macos" }],
      },
      {
        name: "On Linux",
        body: "Your desktop comes with one: Ptyxis on recent Ubuntu, Konsole on KDE. On Ubuntu, press Ctrl+Alt+T to open it.",
        links: [{ label: "Show Linux terminals", category: "terminals", tag: "linux" }],
      },
    ],
    choose:
      "Start with the terminal already on your computer. Once commands feel normal, try Warp or Wave if you want AI to explain errors or suggest the next command.",
  },
  // VIB-147. "MCP" is jargon most vibe coders meet in a setup guide first.
  mcp_servers: {
    title: "What is an MCP server?",
    intro:
      "Your agent can only work with what it can reach. An MCP server connects it to one more thing, such as your database, your GitHub repos or a real browser, so it can look things up and take action there instead of asking you to copy and paste. MCP is the shared standard, so one server works with Claude Code, Cursor, Codex and most other agents.",
    kinds: [
      {
        name: "Remote servers",
        body: "A web address you add to your agent, then sign in with your account in the browser. Nothing to install. Most services you already use offer one.",
        links: [{ label: "Show remote servers", category: "mcp_servers", tag: "remote-mcp" }],
      },
      {
        name: "Local servers",
        body: "Run on your own computer with one command, usually starting npx. Used for things on your machine, such as controlling a browser.",
        links: [{ label: "Show local servers", category: "mcp_servers", tag: "local-mcp" }],
      },
      {
        name: "Staying safe",
        body: "A server acts with your permissions. Use read-only mode where it exists, point it at a test project rather than live data, never paste API keys into chat, and only add servers from companies you trust.",
        links: [],
      },
    ],
    choose:
      "Add a server for each service your project already uses, such as your database or where you deploy. Start with one, check what your agent does with it, then add the next.",
  },
  // VIB-182. Every other category, in TOOL_CATEGORIES order.
  models: {
    title: "What is an AI model?",
    intro:
      "The model is the brain. Every chat app, agent and app builder sends your words to a model, such as Claude, GPT or Gemini, and shows you what comes back. The tool you use is the body around it, and the same model can sit inside many tools.",
    kinds: [
      {
        name: "You rarely pick one directly",
        body: "Most tools choose a model for you or let you switch in a menu. Knowing the names helps you read those menus and understand why one tool feels smarter than another.",
        links: [{ label: "See chats", category: "chats" }],
      },
      {
        name: "Bigger or faster",
        body: "Each family comes in sizes. The largest thinks harder and costs more. The small ones answer fast and cheap, which is fine for simple edits.",
        links: [],
      },
      {
        name: "Paying per use",
        body: "Some tools ask for an API key and charge for each word the model reads and writes, counted in tokens. A model gateway gives you one key for many models.",
        links: [{ label: "Show gateways", category: "utilities", tag: "model-gateway" }],
      },
    ],
    choose:
      "Starting out? Use whatever model your tool picks by default. Compare models only when the answers are not good enough, or the bill is too high.",
  },
  // Desktop Apps (VIB-191). The question a reader actually has here is not
  // "which one is best" but "why would I install anything when the website
  // works?", so the explainer answers that first.
  desktop_apps: {
    title: "What is a desktop AI app?",
    intro:
      "The same assistant you use in a browser, installed on your computer, which lets it do things a web page cannot: open your files, see your screen, run commands and keep working while you do something else.",
    kinds: [
      {
        name: "Works with your files",
        body: "Point it at a folder and it reads and edits the real files, instead of you copying text into a chat box and the answer back out again.",
        links: [{ label: "Show file access", category: "desktop_apps", tag: "local-files" }],
      },
      {
        name: "Connects to your other apps",
        body: "Desktop apps can run MCP servers, which plug the assistant into things like GitHub, Notion or your database, usually in one click.",
        links: [{ label: "See MCP servers", category: "mcp_servers" }],
      },
      {
        name: "Runs agents on your machine",
        body: "The newer ones take a whole task and work through it on your computer, sometimes several at once, and tell you when they are done.",
        links: [{ label: "Show coding agents", category: "desktop_apps", tag: "coding-agent" }],
      },
    ],
    choose:
      "Start in a chat. Install the desktop app when you are tired of copying files into it, and want the AI working where your work already lives.",
  },

  chats: {
    title: "What is an AI chat?",
    intro:
      "The simplest way in: a website or app where you type a question and the AI answers. Chats are great for planning an idea, explaining an error or drafting a small piece of code, but you copy the result into your project yourself.",
    kinds: [
      {
        name: "Plan and learn",
        body: "Describe what you want to build and ask for a plan, or paste an error and ask what it means. No setup, and a free tier to start.",
        links: [{ label: "Show free chats", category: "chats", tag: "free-tier" }],
      },
      {
        name: "Build small things",
        body: "Most chats can write and preview a single page or a small tool right in the conversation. A good first taste of building with AI.",
        links: [],
      },
      {
        name: "When to move on",
        body: "Once you are copying files back and forth, an app builder or an agent in your editor will do that work for you.",
        links: [
          { label: "See app builders", category: "app_builders" },
          { label: "See agents", category: "agents" },
        ],
      },
    ],
    choose:
      "Use a chat to think and learn. Use an app builder or an agent once you want the AI to change your project directly.",
  },
  app_builders: {
    title: "What is an app builder?",
    intro:
      "You describe an app in plain English and get a working one in your browser, with a live preview you can click through. No install and no code required, though most let you see and export the code when you are ready.",
    kinds: [
      {
        name: "Websites and web apps",
        body: "Lovable, Bolt and v0 build sites and apps that run in the browser. Many connect to a database for logins and saved data.",
        links: [{ label: "Show web app builders", category: "app_builders", tag: "web-apps" }],
      },
      {
        name: "Mobile apps",
        body: "Some builders make phone apps you can test on your own device and later publish to the app stores.",
        links: [{ label: "Show mobile builders", category: "app_builders", tag: "mobile-apps" }],
      },
      {
        name: "Keeping your code",
        body: "Look for GitHub sync or code export. It means you own the code and can move it to an editor or a host later, rather than being locked in.",
        links: [{ label: "Show builders with export", category: "app_builders", tag: "code-export" }],
      },
    ],
    choose:
      "New to building? Start here. When you outgrow the builder, export the code and carry on with an agent in your editor.",
  },
  hosting: {
    title: "What is hosting?",
    intro:
      "Hosting puts your project on the internet with a real link anyone can open. Your code runs on the host's computers, which keep it online day and night. Most hosts watch your GitHub repo and publish every change you push.",
    kinds: [
      {
        name: "Websites and front ends",
        body: "Vercel, Netlify and GitHub Pages publish a site in minutes and have free plans. The easiest start for most vibe coders.",
        links: [{ label: "Show static site hosts", category: "hosting", tag: "static-sites" }],
      },
      {
        name: "Apps with a server",
        body: "If your app runs its own backend or database, you need a host that keeps a server running, such as Render, Railway or Fly.io.",
        links: [{ label: "Show backend hosts", category: "hosting", tag: "backend" }],
      },
      {
        name: "Free to start",
        body: "Free plans are enough to share a project. Watch the limits on traffic and sleep times, and add a card only when you need more.",
        links: [{ label: "Show free tiers", category: "hosting", tag: "free-tier" }],
      },
    ],
    choose:
      "Built with an app builder? It probably hosts for you already. Otherwise, start on a free plan with a host that supports your framework.",
  },
  ides: {
    title: "What is an IDE?",
    intro:
      "An IDE is a code editor: the app where your project's files live, with a file list on one side and the code in the middle. AI IDEs add a chat panel and an agent that can read and change your whole project while you watch.",
    kinds: [
      {
        name: "AI-first editors",
        body: "Cursor and Antigravity are built around the agent. Most are based on VS Code, so guides and extensions for VS Code work there too.",
        links: [{ label: "Show VS Code based", category: "ides", tag: "vs-code-based" }],
      },
      {
        name: "Classic editors plus AI",
        body: "VS Code, JetBrains and Xcode are the long-standing editors. Add AI to them with a plugin such as GitHub Copilot.",
        links: [{ label: "See plugins", category: "plugins" }],
      },
      {
        name: "Bring your own key",
        body: "Some editors let you plug in your own API key or run a model on your computer, so you control which model you use and what it costs.",
        links: [{ label: "Show BYOK editors", category: "ides", tag: "byok" }],
      },
    ],
    choose:
      "Moving on from an app builder? An AI-first editor with a free tier is the gentlest next step.",
  },
  clis: {
    title: "What is an AI CLI?",
    intro:
      "CLI means command-line interface: a program you run by typing in a terminal. AI CLIs are coding agents that live there. You describe the task in words, and the agent reads files, runs commands and edits code, asking before anything risky.",
    kinds: [
      {
        name: "Coding agents",
        body: "Claude Code, Codex and Gemini CLI. The same kind of agent as in AI editors, without the editor. They run in any terminal, including the one inside your IDE.",
        links: [{ label: "Show coding agents", category: "clis", tag: "coding-agent" }],
      },
      {
        name: "Open source",
        body: "Aider and OpenCode are free to install and work with many models. You pay the model provider directly through an API key.",
        links: [{ label: "Show open source", category: "clis", tag: "open-source" }],
      },
      {
        name: "Skill installers",
        body: "Small CLIs that add skills to your agent with one command.",
        links: [{ label: "See skills", category: "skills" }],
      },
    ],
    choose:
      "Comfortable typing a command? A CLI agent is one of the most capable ways to build. New to terminals? Read the Terminals guide first.",
  },
  skills: {
    title: "What is a skill?",
    intro:
      "A skill is a folder of written instructions your agent loads when a task calls for it, such as how to review code or design a page. It turns a general agent into one that follows a proven method, without you pasting the same prompt every time.",
    kinds: [
      {
        name: "How they work",
        body: "Each skill has a short description. Your agent reads the descriptions and loads the full instructions only when one matches the task, so installing several costs little.",
        links: [],
      },
      {
        name: "Where they run",
        body: "Claude Code, Claude.ai, Codex and a growing list of other agents understand the same skill format. Each card shows where it works.",
        links: [{ label: "See CLIs", category: "clis" }],
      },
      {
        name: "Installing one",
        body: "Copy the folder into your agent's skills folder, or use a skill installer. Read what a skill does first: it can tell your agent to run commands.",
        links: [{ label: "See skill directories", category: "utilities", tag: "skills-ecosystem" }],
      },
    ],
    choose:
      "Start with one skill for the job you do most, such as design or debugging. Add more once you see the difference it makes.",
  },
  plugins: {
    title: "What is a plugin?",
    intro:
      "A plugin adds AI to an editor you already use. Install it from the editor's extension store and you get a chat panel and code suggestions without switching apps.",
    kinds: [
      {
        name: "For VS Code",
        body: "The widest choice. These also work in editors built on VS Code.",
        links: [{ label: "Show VS Code plugins", category: "plugins", tag: "vs-code" }],
      },
      {
        name: "For JetBrains",
        body: "IntelliJ, WebStorm and PyCharm users can add the same kind of AI help.",
        links: [{ label: "Show JetBrains plugins", category: "plugins", tag: "jetbrains" }],
      },
      {
        name: "Open source",
        body: "Continue and Kilo Code are free and let you pick the model, including one running on your own computer.",
        links: [{ label: "Show open source", category: "plugins", tag: "open-source" }],
      },
    ],
    choose:
      "Happy with your editor? Add a plugin. Starting fresh? An AI-first IDE may be simpler.",
  },
  frameworks: {
    title: "What is a framework?",
    intro:
      "A framework is a ready-made structure for your code, such as Next.js for web apps. It decides where files go and how pages, data and logins fit together, so the AI follows a known pattern instead of inventing its own.",
    kinds: [
      {
        name: "Why it helps with AI",
        body: "Models have seen popular frameworks countless times. Ask for Next.js and you get code that matches the docs and the tutorials you will find.",
        links: [],
      },
      {
        name: "Web frameworks",
        body: "The structure for a website or web app. Next.js is the most common choice with React.",
        links: [{ label: "Show web frameworks", category: "frameworks", tag: "web-apps" }],
      },
      {
        name: "Agent frameworks",
        body: "Libraries for building your own AI features into an app. You will write code, usually Python or TypeScript.",
        links: [{ label: "Show agent frameworks", category: "agents", tag: "agent-framework" }],
      },
    ],
    choose:
      "Tell your agent which framework to use at the start. Picking one early saves a rewrite later.",
  },
  templates: {
    title: "What is a template?",
    intro:
      "A template is a starter project that already works: pages, styling and often logins and a database, wired together. You copy it and change it, rather than asking the AI to build everything from nothing.",
    kinds: [
      {
        name: "Starter apps",
        body: "A full project you copy and run, such as create-t3-app. Good when you know the stack you want.",
        links: [{ label: "Show Next.js starters", category: "templates", tag: "nextjs" }],
      },
      {
        name: "Component kits",
        body: "Ready-made buttons, forms and layouts you add to your own project, such as shadcn/ui. Your app looks finished sooner.",
        links: [{ label: "Show design kits", category: "templates", tag: "design" }],
      },
      {
        name: "With your agent",
        body: "Give your agent the template and ask it to change things. It is far easier to edit something that works than to debug something new.",
        links: [{ label: "See agents", category: "agents" }],
      },
    ],
    choose:
      "Pick a template that already does most of what you need, then change the rest.",
  },
  workflows: {
    title: "What is a workflow tool?",
    intro:
      "Workflow tools connect apps so work happens on its own: when a form is filled in, add a row to a sheet and send an email. You build the steps visually, and many now let an AI step decide what happens next.",
    kinds: [
      {
        name: "No-code automation",
        body: "Zapier and n8n join thousands of apps with drag-and-drop steps. No programming needed.",
        links: [{ label: "Show no-code tools", category: "workflows", tag: "no-code" }],
      },
      {
        name: "Self-hosted",
        body: "Some can run on your own server, so your data stays with you and there is no bill per task.",
        links: [{ label: "Show self-hosted", category: "workflows", tag: "self-hosted" }],
      },
      {
        name: "Versus an agent",
        body: "A workflow runs the same steps every time. An agent decides its own steps. Use a workflow when you know exactly what should happen.",
        links: [{ label: "See agents", category: "agents" }],
      },
    ],
    choose:
      "Doing the same task by hand every week? That is a workflow. Start with one trigger and one action.",
  },
  tools: {
    title: "What is in Tools?",
    intro:
      "Focused services you build with, each doing one job well: a database, a design tool, a place to plan the work. Your AI writes the code, and these are the parts it connects to.",
    kinds: [
      {
        name: "Backend and data",
        body: "Databases and logins, such as Supabase. Most app builders and agents know how to set these up for you.",
        links: [{ label: "Show backend tools", category: "tools", tag: "backend" }],
      },
      {
        name: "Design and media",
        body: "Tools that make images, video and layouts to use in your project.",
        links: [{ label: "Show design tools", category: "tools", tag: "design" }],
      },
      {
        name: "Planning and teamwork",
        body: "Where you keep the to-do list and talk to your team. Many connect to your agent through an MCP server.",
        links: [{ label: "See MCP servers", category: "mcp_servers" }],
      },
    ],
    choose:
      "Add a tool when your project needs that job done. Check its free tier first.",
  },
  utilities: {
    title: "What is in Utilities?",
    intro:
      "Small helpers that make everyday AI coding smoother: places to find skills and prompts, one key for many models, and services like email sending that most apps end up needing.",
    kinds: [
      {
        name: "Finding skills",
        body: "Directories and marketplaces for agent skills, some with security checks on what they list.",
        links: [{ label: "Show skill directories", category: "utilities", tag: "skills-ecosystem" }],
      },
      {
        name: "Model gateways",
        body: "One account and one API key for many models, so you can switch without signing up everywhere.",
        links: [{ label: "Show gateways", category: "utilities", tag: "model-gateway" }],
      },
      {
        name: "App services",
        body: "Services an app needs behind the scenes, such as sending email or search.",
        links: [{ label: "Show backend services", category: "utilities", tag: "backend" }],
      },
    ],
    choose:
      "You do not need these on day one. Come back when a task feels harder than it should.",
  },
};
