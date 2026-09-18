"use client";

import {
  IconBookmark,
  IconBooks,
  IconBrain,
  IconChevronDown,
  IconCircleDashed,
  IconFolders,
  IconGridDots,
  IconHome,
  IconLayoutList,
  IconLayoutSidebar,
  IconNotebook,
  IconPrompt,
  IconRocket,
  IconSparkles,
  IconStairsUp,
  IconStar,
  type Icon,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import { CATEGORY_ICONS } from "@/components/features/tools/CategoryIcon";
import { learnHref } from "@/lib/learn";
import {
  isActiveNavItem,
  SIDEBAR_CLOSED_COOKIE,
  SIDEBAR_MODE_COOKIE,
  sidebarGroupId,
  sidebarGroupsFor,
  type SidebarMode,
} from "@/lib/nav";
import { TOOL_CATEGORIES } from "@/lib/tool-categories";
import { toolsHref } from "@/lib/tools-url";
import { cn } from "@/lib/utils";

/**
 * One icon per link, keyed by href. The icon rail (VIB-174) needs every item
 * to have one; anything unlisted (the roadmap stubs) gets a dashed circle.
 */
const ICONS: Record<string, Icon> = {
  "/": IconHome,
  "/account/bookmarks": IconBookmark,
  "/tools": IconGridDots,
  ...Object.fromEntries(
    TOOL_CATEGORIES.map((c) => [toolsHref({ category: c.value }), CATEGORY_ICONS[c.value]]),
  ),
  [learnHref({ pillar: "fundamentals" })]: IconBooks,
  [learnHref({ pillar: "context_engineering" })]: IconBrain,
  [learnHref({ pillar: "prompt_engineering" })]: IconPrompt,
  [learnHref({ pillar: "tool_reviews" })]: IconStar,
  [learnHref({ pillar: "walkthroughs" })]: IconNotebook,
  [learnHref({ pillar: "founder_playbook" })]: IconRocket,
  "/learn": IconLayoutList,
  "/walkthroughs": IconStairsUp,
  "/collections": IconFolders,
  "/skills": IconSparkles,
};

const MODE_LABELS: Record<SidebarMode, string> = {
  expanded: "Expanded",
  collapsed: "Collapsed",
  hover: "Expand on hover",
};

const YEAR = 60 * 60 * 24 * 365;

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${YEAR}; samesite=lax`;
}

/**
 * The signed-in app shell's left rail (VIB-76, reworked in VIB-174).
 *
 * Supabase-style: an icon rail that is narrow by default and widens to show
 * labels on hover, over the page rather than pushing it. The member picks
 * Expanded / Collapsed / Expand on hover from the control at the bottom, and
 * can fold each labelled group. Both are cookies, read by the server layout,
 * so the first paint is already the right width.
 */
export function AppSidebar({
  showRoadmap,
  initialMode,
  initialClosed,
}: {
  showRoadmap: boolean;
  initialMode: SidebarMode;
  initialClosed: readonly string[];
}) {
  const [mode, setMode] = useState(initialMode);
  const [closed, setClosed] = useState(initialClosed);
  const menu = useRef<HTMLDetailsElement>(null);

  function toggleGroup(id: string) {
    const next = closed.includes(id) ? closed.filter((c) => c !== id) : [...closed, id];
    setClosed(next);
    setCookie(SIDEBAR_CLOSED_COOKIE, next.join(","));
  }

  function chooseMode(next: SidebarMode) {
    setMode(next);
    setCookie(SIDEBAR_MODE_COOKIE, next);
    menu.current?.removeAttribute("open");
  }

  /*
   * Labels fade rather than unmount, so screen readers always get them and
   * the icons never move when the rail widens. `wide`/`narrow` are the class
   * sets for "only when showing labels" and "only when icons-only".
   */
  const wide =
    mode === "expanded"
      ? ""
      : mode === "collapsed"
        ? "opacity-0"
        : "opacity-0 group-hover/nav:opacity-100 group-focus-within/nav:opacity-100";
  const narrow =
    mode === "expanded"
      ? "hidden"
      : mode === "collapsed"
        ? ""
        : "group-hover/nav:opacity-0 group-focus-within/nav:opacity-0";

  return (
    <>
      {/* Reserves the rail's width in the row; the nav itself may grow past it on hover. */}
      <div className={cn("hidden shrink-0 md:block", mode === "expanded" ? "w-56" : "w-14")}>
        <nav
          aria-label="Main"
          className={cn(
            "group/nav bg-background sticky top-14 z-40 flex h-[calc(100dvh-3.5rem)] flex-col border-r transition-[width,box-shadow] duration-200",
            mode === "expanded" ? "w-56" : "w-14",
            mode === "hover" && "hover:w-56 hover:shadow-lg focus-within:w-56",
          )}
        >
          <div className="flex-1 overflow-x-hidden overflow-y-auto px-2 py-3 [scrollbar-width:none]">
            <NavGroups
              showRoadmap={showRoadmap}
              closed={closed}
              onToggle={toggleGroup}
              wide={wide}
              narrow={narrow}
              tooltips={mode === "collapsed"}
            />
          </div>

          <div className="border-t px-2 py-2">
            {/* Native <details>, like the header menus: Escape and focus handled by the browser. */}
            <details ref={menu} className="relative">
              <summary
                aria-label="Sidebar control"
                title="Sidebar control"
                className="text-muted-foreground hover:bg-accent/50 hover:text-foreground flex size-10 cursor-pointer list-none items-center justify-center rounded-md"
              >
                <IconLayoutSidebar aria-hidden className="size-4" />
              </summary>
              <div className="bg-background absolute bottom-full left-0 z-50 mb-2 w-48 rounded-md border p-1 shadow-md">
                <p className="text-muted-foreground border-b px-2 pt-1 pb-2 text-xs">Sidebar control</p>
                <ul className="pt-1">
                  {(Object.keys(MODE_LABELS) as SidebarMode[]).map((option) => (
                    <li key={option}>
                      <button
                        type="button"
                        aria-pressed={mode === option}
                        onClick={() => chooseMode(option)}
                        className="hover:bg-accent flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm"
                      >
                        <span
                          aria-hidden
                          className={cn("size-1.5 rounded-full", mode === option ? "bg-foreground" : "bg-transparent")}
                        />
                        {MODE_LABELS[option]}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </div>
        </nav>
      </div>

      {/*
        Below md the rail is hidden, and without this a signed-in phone user
        has no nav at all. Always the labelled list; folding still applies.
      */}
      <details className="border-b md:hidden">
        <summary className="cursor-pointer px-6 py-3 text-sm font-medium">Menu</summary>
        <nav aria-label="Main" className="px-3 pb-4">
          <NavGroups
            showRoadmap={showRoadmap}
            closed={closed}
            onToggle={toggleGroup}
            wide=""
            narrow="hidden"
            tooltips={false}
          />
        </nav>
      </details>
    </>
  );
}

function NavGroups({
  showRoadmap,
  closed,
  onToggle,
  wide,
  narrow,
  tooltips,
}: {
  showRoadmap: boolean;
  closed: readonly string[];
  onToggle: (id: string) => void;
  wide: string;
  narrow: string;
  tooltips: boolean;
}) {
  const pathname = usePathname();
  const search = useSearchParams();

  return (
    <>
      {sidebarGroupsFor(showRoadmap).map((group, index) => {
        const id = group.label ? sidebarGroupId(group.label) : String(index);
        const open = !closed.includes(id);

        return (
          <div key={id} className={index ? "mt-4" : undefined}>
            {group.label ? (
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`nav-group-${id}`}
                onClick={() => onToggle(id)}
                title={tooltips ? group.label : undefined}
                className="text-muted-foreground hover:text-foreground relative flex h-7 w-full items-center rounded-md px-3 text-xs font-medium tracking-wide whitespace-nowrap uppercase"
              >
                {/* Icons-only: a rule stands in for the heading, still clickable to fold. */}
                <span aria-hidden className={cn("absolute inset-x-3 top-1/2 border-t transition-opacity", narrow)} />
                <span className={cn("flex-1 text-left transition-opacity", wide)}>{group.label}</span>
                <IconChevronDown
                  aria-hidden
                  className={cn("size-3.5 shrink-0 transition-[transform,opacity]", !open && "-rotate-90", wide)}
                />
              </button>
            ) : null}

            <ul id={`nav-group-${id}`} hidden={!open}>
              {group.items.map((item, i) => {
                const Icon = ICONS[item.href] ?? IconCircleDashed;
                const active = isActiveNavItem(pathname, search, item.href, item.exclusive);
                const heading = item.section && item.section !== group.items[i - 1]?.section;

                return (
                  <li key={item.label}>
                    {heading ? (
                      <p
                        className={cn(
                          "text-muted-foreground/70 truncate px-3 pt-2 pb-0.5 text-[11px] font-medium transition-opacity",
                          wide,
                        )}
                      >
                        {item.section}
                      </p>
                    ) : null}
                    {item.disabled ? (
                      /*
                       * Rendered, dimmed, and not a link. These signal where the
                       * product is going; making them clickable would send people
                       * to a 404, and hiding them loses the signal.
                       */
                      <span
                        aria-disabled="true"
                        title={tooltips ? item.label : undefined}
                        className="text-muted-foreground/50 flex cursor-default items-center gap-3 rounded-md px-3 py-1.5 text-sm whitespace-nowrap"
                      >
                        <Icon aria-hidden className="size-4 shrink-0" />
                        <span className={cn("transition-opacity", wide)}>
                          {item.label}
                          {item.note ? <span className="ml-1 text-xs">·{item.note}</span> : null}
                        </span>
                      </span>
                    ) : (
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        title={tooltips ? item.label : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm whitespace-nowrap",
                          active
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                        )}
                      >
                        <Icon aria-hidden className="size-4 shrink-0" />
                        <span className={cn("transition-opacity", wide)}>{item.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </>
  );
}
