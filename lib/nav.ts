/*
 * Relative, with the extension, not the @/ alias: these are value imports,
 * and node --test resolves ESM by real filename. The same reason
 * lib/role-level.ts and lib/search-query.ts stay alias-free.
 */
import { TOOL_CATEGORIES } from "./tool-categories.ts";
import { toolsHref } from "./tools-url.ts";

/**
 * The two nav structures (VIB-76, handoff §2).
 *
 * They are deliberately different shapes, not one list rendered twice:
 * visitors get a flat top nav on the marketing pages, signed-in users get
 * the app-shell sidebar. Flattening them into one source loses that.
 */

export type NavItem = {
  href: string;
  label: string;
  /** Renders dimmed and unclickable — signals direction, links nowhere. */
  disabled?: boolean;
};

/** Logged-out top nav. Four items, no sidebar. */
export const TOP_NAV: readonly NavItem[] = [
  { href: "/tools", label: "Explore" },
  { href: "/learn", label: "Learn" },
  { href: "/collections", label: "Collections" },
];

/**
 * Logged-in sidebar.
 *
 * The Directory group is derived from TOOL_CATEGORIES rather than restated,
 * so the 13 categories have exactly one definition and the database enum
 * stays the only source of truth for what exists.
 */
export const SIDEBAR_GROUPS: ReadonlyArray<{ label?: string; items: readonly NavItem[] }> = [
  {
    items: [
      { href: "/", label: "Home" },
      // VIB-69 moved this out of the top-level /bookmarks route.
      { href: "/account/bookmarks", label: "Saved" },
    ],
  },
  {
    label: "Directory",
    items: TOOL_CATEGORIES.map((category) => ({
      href: toolsHref({ category: category.value }),
      label: category.label,
    })),
  },
  {
    label: "Learn",
    items: [
      /*
       * The handoff calls the first item "Walkthroughs", but no such content
       * type exists — the listable types are guide/article/cheatsheet/
       * course_link/help_article. Linking real destinations under the real
       * label rather than inventing a taxonomy to match the doc; the pillar
       * naming question belongs to the Learn hub issue.
       */
      { href: "/learn?type=guide", label: "Guides" },
      { href: "/learn?type=article", label: "Articles" },
      // Grouped under Learn but routed top-level, on purpose (§27 vs §31).
      { href: "/wizards", label: "Wizards" },
      { href: "/collections", label: "Collections" },
      { href: "#", label: "Setups", disabled: true },
      { href: "#", label: "Paths", disabled: true },
    ],
  },
  {
    label: "Later",
    items: [
      { href: "#", label: "Prompts", disabled: true },
      { href: "#", label: "Jobs", disabled: true },
      { href: "#", label: "Communities", disabled: true },
      { href: "#", label: "Channels", disabled: true },
      { href: "#", label: "Top profiles", disabled: true },
    ],
  },
];

/**
 * Whether a nav item points at what is currently on screen.
 *
 * Two traps this exists to avoid. Home is a prefix of every path, so it
 * matches exactly and never by prefix. And the category links differ only
 * by query string — `/tools?category=models` and `/tools?category=agents`
 * share a pathname, so a pathname-only check lights all thirteen at once.
 *
 * An item with no query matches its whole subtree; an item with one also
 * requires each of its params to match.
 */
export function isActiveNavItem(
  pathname: string,
  search: URLSearchParams,
  href: string,
): boolean {
  const [path, query] = href.split("?");

  if (path === "#") return false;
  if (path === "/") return pathname === "/";
  if (pathname !== path && !pathname.startsWith(`${path}/`)) return false;
  if (!query) return true;

  for (const [key, value] of new URLSearchParams(query)) {
    if (search.get(key) !== value) return false;
  }
  return true;
}
