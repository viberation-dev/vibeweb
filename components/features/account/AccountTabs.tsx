"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ACCOUNT_TABS, isActiveTab } from "@/lib/account-tabs";
import { cn } from "@/lib/utils";

/**
 * Client only because it needs usePathname for the active tab — the pages
 * themselves stay server components.
 *
 * Real links rather than buttons over client state: each tab is its own
 * route, so deep links, back/forward and "open in new tab" all work, and the
 * bookmark and history queries keep running on the server.
 *
 * Drawn as a segmented pill (VIB-126) rather than the underlined strip it
 * was: the v3 system has no hairline rules, and the active tab reading as a
 * raised chip matches how the pill buttons elsewhere say "this one".
 */
export function AccountTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account">
      <ul className="bg-secondary inline-flex flex-wrap gap-1 rounded-full p-1.5">
        {ACCOUNT_TABS.map((tab) => {
          const active = isActiveTab(pathname, tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-full px-4 py-2 text-sm font-bold transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-card",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
