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
    body: "A new layout for the signed-out homepage: a split hero with a live look at the directory, a category index with real counts, and a clearer route into the Learn hub and the wizard.",
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
