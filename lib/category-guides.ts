/**
 * Plain-English explainers shown at the top of a directory category
 * (VIB-145).
 *
 * "Agent" is the word vibe coders find most confusing: the same word covers
 * the thing inside Cursor, a service that opens pull requests while you
 * sleep, and a Python library. A category whose name needs explaining gets
 * an entry here; the rest render without one.
 *
 * Links are written as `{ category, tag }` rather than URLs so the page
 * builds them with toolsHref, and a tag link filters this same category.
 */
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

export const CATEGORY_GUIDES: Readonly<Record<string, CategoryGuide>> = {
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
};
