"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ACCOUNT_TABS, isActiveTab } from "@/lib/account-tabs";

/**
 * Client only because it needs usePathname for the active tab — the pages
 * themselves stay server components.
 *
 * Real links rather than buttons over client state: each tab is its own
 * route, so deep links, back/forward and "open in new tab" all work, and the
 * bookmark and history queries keep running on the server.
 */
export function AccountTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="border-b">
      <ul className="mx-auto flex w-full max-w-6xl gap-1 px-6">
        {ACCOUNT_TABS.map((tab) => {
          const active = isActiveTab(pathname, tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "-mb-px block border-b-2 border-primary px-3 py-3 text-sm font-medium"
                    : "-mb-px block border-b-2 border-transparent px-3 py-3 text-sm text-muted-foreground hover:text-foreground"
                }
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
