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
};
