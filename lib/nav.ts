/*
 * Relative, with the extension, not the @/ alias: these are value imports,
 * and node --test resolves ESM by real filename. The same reason
 * lib/role-level.ts and lib/search-query.ts stay alias-free.
 */
import { CONTENT_PILLARS, learnHref } from "./learn.ts";
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
  /** Which phase it lands in — "1.5", "2", "sep". Shown after the label. */
  note?: string;
  /**
   * Params that must be *absent* for this item to count as active.
   *
   * "All tools" is /tools with no category, and every category link shares
   * that pathname — without this it would light up alongside whichever
   * category is selected.
   */
  exclusive?: readonly string[];
  /** Renders dimmed and unclickable — signals direction, links nowhere. */
  disabled?: boolean;
};

/** Logged-out top nav. Four items, no sidebar. */
export const TOP_NAV: readonly NavItem[] = [
  { href: "/tools", label: "Explore" },
  { href: "/skills", label: "Skills" },
  { href: "/learn", label: "Learn" },
  { href: "/collections", label: "Collections" },
];

/**
 * Logged-in sidebar.
 *
 * The Directory group is derived from TOOL_CATEGORIES rather than restated,
 * so the 15 categories have exactly one definition and the database enum
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
    label: "Directory · 15",
    items: [
      { href: "/tools", label: "All tools", exclusive: ["category"] },
      ...TOOL_CATEGORIES.map((category) => ({
        href: toolsHref({ category: category.value }),
        label: category.label,
      })),
    ],
  },
  {
    /*
     * The mockup's `PILLARS · 6` group (VIB-95). The count is the size of the
     * taxonomy, not of what is published in it — two pillars are empty, and
     * the hub's chips are where that shows, with a 0 beside the label.
     *
     * These replace the earlier "Walkthroughs → ?type=guide" stand-in, which
     * pointed the mockup's pillar label at the closest content type because
     * pillars had no column yet. That pillar is real now, and labelled
     * "Build logs" so it does not collide with the guided builds (VIB-120).
     */
    label: "Pillars",
    items: CONTENT_PILLARS.map((pillar) => ({
      href: learnHref({ pillar: pillar.value }),
      label: pillar.label,
    })),
  },
  {
    label: "Learn",
    items: [
      { href: "/learn", label: "Everything" },
      // Grouped under Learn but routed top-level, on purpose (§27 vs §31).
      { href: "/walkthroughs", label: "Walkthroughs" },
      { href: "/collections", label: "Collections" },
      // The skills hub (VIB-130): skills plus how to install and find more.
      { href: "/skills", label: "Skills hub" },
      { href: "#", label: "Setups", note: "1.5", disabled: true },
      { href: "#", label: "Paths", note: "1.5", disabled: true },
    ],
  },
  {
    label: "Later",
    items: [
      { href: "#", label: "Prompts", note: "sep", disabled: true },
      { href: "#", label: "Jobs", note: "1.5", disabled: true },
      { href: "#", label: "Communities", note: "2", disabled: true },
      { href: "#", label: "Channels", note: "2", disabled: true },
      { href: "#", label: "Top profiles", note: "2", disabled: true },
    ],
  },
];

/**
 * The sidebar a given viewer sees. Roadmap items (the disabled ones) are for
 * super admins only (VIB-151); a group left empty by that is dropped.
 */
export function sidebarGroupsFor(showRoadmap: boolean): typeof SIDEBAR_GROUPS {
  if (showRoadmap) return SIDEBAR_GROUPS;
  return SIDEBAR_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.disabled),
  })).filter((group) => group.items.length);
}

/**
 * Whether a nav item points at what is currently on screen.
 *
 * Two traps this exists to avoid. Home is a prefix of every path, so it
 * matches exactly and never by prefix. And the category links differ only
 * by query string — `/tools?category=models` and `/tools?category=agents`
 * share a pathname, so a pathname-only check lights all fifteen at once.
 *
 * An item with no query matches its whole subtree; an item with one also
 * requires each of its params to match.
 */
export function isActiveNavItem(
  pathname: string,
  search: URLSearchParams,
  href: string,
  exclusive: readonly string[] = [],
): boolean {
  const [path, query] = href.split("?");

  if (path === "#") return false;
  if (path === "/") return pathname === "/";
  if (pathname !== path && !pathname.startsWith(`${path}/`)) return false;
  if (exclusive.some((key) => search.has(key))) return false;
  if (!query) return true;

  for (const [key, value] of new URLSearchParams(query)) {
    if (search.get(key) !== value) return false;
  }
  return true;
}
