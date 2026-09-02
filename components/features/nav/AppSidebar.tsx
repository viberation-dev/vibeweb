"use client";

import { BookmarkIcon, HomeIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { isActiveNavItem, SIDEBAR_GROUPS } from "@/lib/nav";

/** The mockup gives only the top group icons; the rest are plain text. */
const ICONS: Record<string, typeof HomeIcon> = {
  "/": HomeIcon,
  "/account/bookmarks": BookmarkIcon,
};

/**
 * The signed-in app shell's left rail (VIB-76, handoff §2).
 *
 * Client only because the active item depends on the current URL. The pages
 * it wraps stay server components.
 *
 * Deliberately calm: the hover-lift and scroll-reveal treatment is scoped to
 * the marketing homepage and Learn hub, not the app shell.
 */
export function AppSidebar() {
  return (
    <>
      <nav
        aria-label="Main"
        className="hidden w-56 shrink-0 overflow-y-auto border-r px-3 py-4 md:block"
      >
        <NavGroups />
      </nav>

      {/*
        Below md the rail is hidden, and without this a signed-in phone user
        has no nav at all. A native <details> disclosure rather than a drawer
        component: same list, no state, no library, keyboard and screen
        readers handled by the browser.
      */}
      <details className="border-b md:hidden">
        <summary className="cursor-pointer px-6 py-3 text-sm font-medium">Menu</summary>
        <nav aria-label="Main" className="px-3 pb-4">
          <NavGroups />
        </nav>
      </details>
    </>
  );
}

function NavGroups() {
  const pathname = usePathname();
  const search = useSearchParams();

  return (
    <>
      {SIDEBAR_GROUPS.map((group, index) => (
        <div key={group.label ?? index} className={index ? "mt-6" : undefined}>
          {group.label ? (
            <h2 className="text-muted-foreground px-3 pb-1 text-xs font-medium tracking-wide uppercase">
              {group.label}
            </h2>
          ) : null}
          <ul>
            {group.items.map((item) => (
              <li key={item.label}>
                {item.disabled ? (
                  /*
                   * Rendered, dimmed, and not a link. These signal where the
                   * product is going; making them clickable would send people
                   * to a 404, and hiding them loses the signal.
                   */
                  <span
                    aria-disabled="true"
                    className="text-muted-foreground/50 block cursor-default rounded-md px-3 py-1.5 text-sm"
                  >
                    {item.label}
                    {item.note ? <span className="ml-1 text-xs">·{item.note}</span> : null}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    aria-current={
                      isActiveNavItem(pathname, search, item.href) ? "page" : undefined
                    }
                    className={
                      isActiveNavItem(pathname, search, item.href)
                        ? "bg-accent text-accent-foreground block rounded-md px-3 py-1.5 text-sm font-medium"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground block rounded-md px-3 py-1.5 text-sm"
                    }
                  >
                    {(() => {
                      const Icon = ICONS[item.href];
                      return Icon ? <Icon aria-hidden className="mr-2 inline size-4 align-text-bottom" /> : null;
                    })()}
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
