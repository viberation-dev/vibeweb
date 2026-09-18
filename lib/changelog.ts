/*
 * Alias-free and dependency-free so it runs under plain `node --test`, for
 * the same reason lib/theme.ts and lib/nav.ts are.
 */

export type ChangelogEntry = {
  /** ISO date, YYYY-MM-DD. What shipped that day, not what was written. */
  date: string;
  title: string;
  /** One or two sentences a visitor would understand. No issue IDs. */
  body: string;
  kind: ChangelogKind;
};

export const CHANGELOG_KINDS = ["added", "improved", "fixed"] as const;
export type ChangelogKind = (typeof CHANGELOG_KINDS)[number];

export const CHANGELOG_KIND_LABELS: Record<ChangelogKind, string> = {
  added: "Added",
  improved: "Improved",
  fixed: "Fixed",
};

/**
 * What has actually shipped, newest first (VIB-104).
 *
 * A repo constant rather than a table, deliberately. A changelog records
 * changes to the software, which happen in pull requests — so the honest
 * place to write the entry is the pull request that causes it, by the person
 * causing it. A database-backed one would need somebody to remember to go
 * and write the row afterwards, which is how changelogs die.
 *
 * The trade-off, stated plainly: Ali cannot add an entry without a developer.
 * If that becomes the wrong shape, this moves to a table and an admin screen
 * the way testimonials did (VIB-102) — the page below does not care where
 * the entries come from.
 *
 * **Every entry must correspond to something that really shipped.** These are
 * drawn from the merge history, not from plans. Dates are merge dates.
 */
export const CHANGELOG: readonly ChangelogEntry[] = [
  {
    date: "2026-09-18",
    kind: "improved",
    title: "A slimmer sidebar",
    body: "The sidebar is now a row of icons that opens out when you hover it. Pick Expanded, Collapsed or Expand on hover from the button at its foot, and fold away the sections you do not use. The directory is grouped into Build, AI, Extend, Start from and Ship.",
  },
  {
    date: "2026-09-18",
    kind: "fixed",
    title: "Home page no longer hangs",
    body: "When a service we pull skill stats from was slow, the home page could fail to load at all. Now it loads anyway and skips the numbers it could not get.",
  },
  {
    date: "2026-09-17",
    kind: "improved",
    title: "Link previews",
    body: "Links to Viberation shared on X, LinkedIn or Slack now show a proper preview card instead of plain text.",
  },
  {
    date: "2026-09-17",
    kind: "improved",
    title: "Easier to find in search",
    body: "The site now tells search engines which pages exist and which to skip, so tools, guides and walkthroughs can turn up in search results.",
  },
  {
    date: "2026-09-16",
    kind: "added",
    title: "Add a database with Supabase",
    body: "A new beginner walkthrough for projects that need to save things. You build a guestbook: create a free Supabase project, make a table with the security rules switched on, show and add notes from a Next.js page, then put it live on Vercel, Netlify or Cloudflare.",
  },
  {
    date: "2026-09-16",
    kind: "improved",
    title: "Ship your first web project, from a blank computer",
    body: "The walkthrough now starts with setting up your computer: opening a terminal, installing Node.js and Git, and where to keep your projects, with steps for Windows, Mac or Linux. A new GitHub step walks through your first push, and Deploy lets you pick Vercel, Netlify or Cloudflare.",
  },
  {
    date: "2026-09-16",
    kind: "added",
    title: "Terminals category",
    body: "A new directory category for the window you type commands in. It explains terminal and shell in plain words, shows how to open the one already on your computer, and lists Windows Terminal, PowerShell, Git Bash, WSL, the Mac Terminal, iTerm2, Ptyxis, Konsole, Warp, Wave, Ghostty, WezTerm, Kitty, Alacritty and Tabby.",
  },
  {
    date: "2026-09-16",
    kind: "improved",
    title: "Pick a prompt, then open your AI tool",
    body: "Every step of Ship your first web project now has plainer wording, example ideas, and three prompts to choose from. One click copies the prompt and opens Claude, ChatGPT or another AI tool, with ChatGPT and Grok filled in for you, or opens Cursor, VS Code or Antigravity if they are installed.",
  },
  {
    date: "2026-09-16",
    kind: "improved",
    title: "Clearer tool cards everywhere",
    body: "Cards for models, chat apps, frameworks, templates, workflow tools, utilities and everyday tools now lead with what matters: whether a coding agent comes included, if you can self-host it, or if a skills site checks skills for risks.",
  },
  {
    date: "2026-09-16",
    kind: "improved",
    title: "Key info on every tool page",
    body: "Models, chat apps, frameworks, templates, workflow tools, utilities and everyday tools now show Key info too: free plans, starting prices, what they work with and what each one is good for.",
  },
  {
    date: "2026-09-16",
    kind: "added",
    title: "Welcome emails",
    body: "New members get a short series of emails after joining: where to start, tools picked for what they want to build, how to save tools, and a check-in they can reply to. Each one has an unsubscribe link.",
  },
  {
    date: "2026-09-16",
    kind: "improved",
    title: "Proper confirmation and reset emails",
    body: "The emails that confirm a new account and reset a password now carry the Viberation look, a clear button and a backup link if the button does not work.",
  },
  {
    date: "2026-09-15",
    kind: "fixed",
    title: "Tighter profile privacy",
    body: "We tightened which profile details can be read and changed, so your account information stays private to you.",
  },
  {
    date: "2026-09-15",
    kind: "improved",
    title: "A shorter start on your home page",
    body: "Your home page now leads with the tool types most people start with. All tools opens every type, grouped so related ones sit together.",
  },
  {
    date: "2026-09-15",
    kind: "improved",
    title: "Clearer signup and a short setup",
    body: "After creating an account you now see exactly where the confirmation email went, with a way to resend it. Setup then asks a few quick questions so we can point you at the right tools.",
  },
  {
    date: "2026-09-15",
    kind: "improved",
    title: "Tool types explained on the homepage",
    body: "The directory section on the homepage now gives every tool type a one-line description, so you can tell an agent from a CLI before you click.",
  },
  {
    date: "2026-09-14",
    kind: "improved",
    title: "Plugin cards say where they work",
    body: "Plugin cards now show which editors each plugin works in and whether you can use your own API key or local models. Each plugin's page lists its free plan, starting price, models and how to install it. Continue is marked as no longer updated, since Cursor acquired it.",
  },
  {
    date: "2026-09-14",
    kind: "improved",
    title: "MCP servers, explained",
    body: "The MCP Servers category now opens with a plain-English guide to what an MCP server is, remote versus local servers, and how to use them safely. Cards show whether a server is official, where it runs and how you sign in, and each server's page gives the address or command to add it and what your agent can do with it.",
  },
  {
    date: "2026-09-14",
    kind: "improved",
    title: "Skill cards say who made them and where they work",
    body: "Skill cards now show when a skill is official, the stack it is for, and when it only works in coding agents rather than Claude.ai or ChatGPT. Each skill's page lists its category, where it works, who made it, when to use it and anything it needs, such as an AWS account.",
  },
  {
    date: "2026-09-14",
    kind: "added",
    title: "Agents, explained",
    body: "The Agents category now opens with a plain-English guide to what an AI agent is, the three kinds, and which one you need. Cloud agents Devin, Jules and GitHub Copilot's coding agent join, along with the OpenAI Agents SDK, LangGraph, CrewAI, Mastra, Google ADK and Microsoft Agent Framework. Each agent's page says what it is, whether you need to code, what it costs and what you get back.",
  },
  {
    date: "2026-09-14",
    kind: "improved",
    title: "CLI cards say what each tool is",
    body: "CLI cards now show pricing, whether a tool is a coding agent or a skills manager, and whether it runs your own API key or local models. Each CLI's page lists how to install it, what it costs to use, its models and the agents it works with.",
  },
  {
    date: "2026-09-14",
    kind: "added",
    title: "Seven more IDEs, with useful tags",
    body: "Google Antigravity, Kiro, Zed, Trae, IntelliJ IDEA, Android Studio and Xcode join the IDEs category. IDE cards now show pricing and what sets each apart, such as whether it is built on VS Code or JetBrains and whether you can use your own API key or local models. Each IDE's page lists its free plan, starting price, models and what it is best for.",
  },
  {
    date: "2026-09-14",
    kind: "improved",
    title: "App Builder cards say what each builder makes",
    body: "App Builder cards now show pricing and what each builder makes, such as web apps, mobile apps or websites, and whether you can take the code with you. Each builder's page lists its free plan, starting price, the code it writes, its backend, hosting and custom domains. Mocha is removed, as it shut down on 1 August.",
  },
  {
    date: "2026-09-14",
    kind: "improved",
    title: "Hosting cards say what each host runs",
    body: "Hosting cards now show pricing, free trials and what each host runs, such as VPS, containers, static sites, Next.js or email. Each host's page lists its free plan, starting price, frameworks, databases, domains and email hosting. Tag filters on a category page only offer tags that category uses.",
  },
  {
    date: "2026-09-14",
    kind: "improved",
    title: "App builders on the homepage",
    body: "The homepage now introduces App Builders, the tools that turn a description into a working app, with three to try. Signed in, they sit in the side rail beside Trending tools.",
  },
  {
    date: "2026-09-14",
    kind: "added",
    title: "Hosting category",
    body: "A new directory category for putting what you build online. Vercel moves into it, joined by Netlify, Cloudflare Workers, GitHub Pages, Hostinger, Firebase Hosting, Render, Railway, Fly.io, DigitalOcean App Platform and AWS Amplify. ChatGPT Sites joins App Builders.",
  },
  {
    date: "2026-09-14",
    kind: "added",
    title: "Five skills in every category",
    body: "Every skill category now has five to choose from, including the official Supabase skill, Emil Kowalski's design engineering, Superpowers' planning and verification skills, and AWS, Azure and Cloudflare deployment skills. Skills built for one stack say so up front.",
  },
  {
    date: "2026-09-14",
    kind: "added",
    title: "App Builders category",
    body: "A new directory category for tools that build an app or website from a description. Lovable and Replit move into it, joined by Bolt, Base44, v0, Figma Make, Google AI Studio, Emergent, Mocha, Rork, Bubble, FlutterFlow, Softr, Relume, Framer, Webflow and Durable.",
  },
  {
    date: "2026-09-14",
    kind: "added",
    title: "More skills in every category",
    body: "Every skill category now has three to choose from, including Anthropic's Frontend Design, the official shadcn/ui and FastAPI skills, Cloudflare's Wrangler and security audit, and Superpowers' test-driven development and systematic debugging.",
  },
  {
    date: "2026-09-14",
    kind: "added",
    title: "A skill in every category",
    body: "The Skills page now has at least one skill in every category, from Vercel's React Best Practices and Supabase's Postgres rules to Trail of Bits' security review and an SEO audit.",
  },
  {
    date: "2026-09-13",
    kind: "improved",
    title: "Filter skills, install them anywhere, download them",
    body: "The Skills page filters by category, by the agent you use and by who made each skill. Every skill page now has install steps for Claude Code, Claude.ai, ChatGPT, Codex, Cursor, GitHub Copilot, Antigravity and Gemini CLI, plus a ZIP download. The Skills page also links to marketplaces where you can sell skills you write.",
  },
  {
    date: "2026-09-13",
    kind: "improved",
    title: "Skills on the homepage",
    body: "The homepage now points to the Skills page, with the most installed skills up front. Signed in, they sit beside Trending tools, and Skills joins the hubs row.",
  },
  {
    date: "2026-09-13",
    kind: "added",
    title: "A home for agent skills",
    body: "The new Skills page ranks skills by real installs, and each skill's page now shows its install command, GitHub stars, independent security checks and the files inside. It also lists the package managers, directories and guides for going further.",
  },
  {
    date: "2026-09-12",
    kind: "improved",
    title: "Wizards are now Walkthroughs",
    body: "The guided builds are called walkthroughs everywhere now, which is what the homepage already called them. Old /wizards links still work and land in the right place.",
  },
  {
    date: "2026-09-11",
    kind: "improved",
    title: "A clearer homepage",
    body: "The homepage now says plainly what Viberation is for, shows how it works in three steps, and answers the common questions — starting with whether you need to code (you don't).",
  },
  {
    date: "2026-09-11",
    kind: "added",
    title: "Save a single model",
    body: "On a model family page like Gemini or Claude you can now save the exact model you are looking at, as well as the whole family. Saved models show up in your bookmarks and open straight to that model.",
  },
  {
    date: "2026-09-11",
    kind: "added",
    title: "Starter prompts on model pages",
    body: "Claude, GPT and Gemini pages now have starter prompts to copy — for planning, context files, design and debugging — and tool pages link to the walkthroughs and Learn reading that cover them.",
  },
  {
    date: "2026-09-11",
    kind: "added",
    title: "GPT and 24 new tools in the directory",
    body: "GPT now has its own model page with live specs, and the directory adds the apps, MCP servers and skills people pair with Claude, GPT and Gemini — from Codex, Gemini CLI and Devin Desktop (formerly Windsurf) to the GitHub, Linear and Notion MCP servers.",
  },
  {
    date: "2026-09-11",
    kind: "added",
    title: "See what a tool works with",
    body: "Tool pages now show where you can use a tool and what pairs well with it — Claude links to Claude Code, Cursor, the Supabase MCP server and more — and each linked page shows what it works with in return.",
  },
  {
    date: "2026-09-11",
    kind: "improved",
    title: "Model families that help you choose",
    body: "Model pages now list every model in a family — each Claude, GPT or Gemini, newest first — with live cost, memory, what it can read and do, how it scores at coding, and uptime. Providers, limits and benchmarks sit one click away under Advanced details.",
  },
  {
    date: "2026-09-11",
    kind: "fixed",
    title: "Header fits on phones and tablets",
    body: "The header no longer pushes the page sideways on smaller screens. The colour mode switch now lives in the menu there.",
  },
  {
    date: "2026-09-11",
    kind: "added",
    title: "Testimonials",
    body: "The homepage can now carry quotes from real people, managed in the staff area. Until there are any, it keeps describing who the product is for instead.",
  },
  {
    date: "2026-09-11",
    kind: "improved",
    title: "Homepage polish and a full-screen menu",
    body: "The redesigned homepage got a pass for spacing, weight and buttons, and the hamburger now opens a full-screen menu with the whole navigation in it.",
  },
  {
    date: "2026-09-10",
    kind: "added",
    title: "Redesigned homepage",
    body: "A new layout for the signed-out homepage: a split hero with a live look at the directory, a category index with real counts, and a clearer route into the Learn hub and the walkthrough.",
  },
  {
    date: "2026-09-10",
    kind: "fixed",
    title: "Dark mode contrast",
    body: "Small text in the brand blue was below the accessibility contrast bar in dark mode. The blue was lifted and button labels adjusted to match.",
  },
  {
    date: "2026-09-05",
    kind: "improved",
    title: "Friendlier error pages",
    body: "Pages that go wrong, and addresses that do not exist, now explain themselves instead of showing a blank default.",
  },
  {
    date: "2026-09-04",
    kind: "added",
    title: "A starter set after onboarding",
    body: "Finishing onboarding now ends on three tools and a collection chosen for the level you picked, rather than an empty feed.",
  },
  {
    date: "2026-09-04",
    kind: "added",
    title: "Learn hub pillars",
    body: "Articles and guides are filed into six sections — fundamentals, context engineering, prompt engineering, tool reviews, walkthroughs and the founder playbook — and the hub can be filtered by them.",
  },
  {
    date: "2026-09-04",
    kind: "added",
    title: "Platform and best-for on tool pages",
    body: "Tool pages say which platforms a tool runs on and which experience level it suits, where that is actually known.",
  },
  {
    date: "2026-09-03",
    kind: "added",
    title: "Newsletter signup",
    body: "A weekly email you can subscribe to from the homepage, with an unsubscribe link in every send.",
  },
  {
    date: "2026-09-03",
    kind: "added",
    title: "Filter the directory by pricing",
    body: "The tools directory can be narrowed to free or paid, read from each tool's stated pricing rather than guessed from a tag.",
  },
] as const;

/** Newest first, then by title so same-day entries have a stable order. */
export function sortedChangelog(
  entries: readonly ChangelogEntry[] = CHANGELOG,
): ChangelogEntry[] {
  return [...entries].sort(
    (a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title),
  );
}

/**
 * Entries grouped under their date, newest date first.
 *
 * Returns an array rather than an object: object key order is only
 * insertion-ordered for non-integer keys, and "2026-09-11" is close enough to
 * looking numeric that relying on that is a trap not worth setting.
 */
export function changelogByDate(
  entries: readonly ChangelogEntry[] = CHANGELOG,
): { date: string; entries: ChangelogEntry[] }[] {
  const groups: { date: string; entries: ChangelogEntry[] }[] = [];

  for (const entry of sortedChangelog(entries)) {
    const last = groups[groups.length - 1];
    if (last && last.date === entry.date) {
      last.entries.push(entry);
    } else {
      groups.push({ date: entry.date, entries: [entry] });
    }
  }
  return groups;
}

/** "11 September 2026". Fixed locale so server and client agree. */
export function formatChangelogDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}
