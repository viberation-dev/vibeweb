"use client";

import {
  IconBell,
  IconBookmark,
  IconChevronDown,
  IconSearch,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { SignOutButton } from "@/components/features/auth/SignOutButton";
import { Logo } from "@/components/features/nav/Logo";
import { ThemeToggle } from "@/components/features/nav/ThemeToggle";
import { TOOL_CATEGORIES } from "@/lib/tool-categories";
import { toolsHref } from "@/lib/tools-url";

/**
 * The app-shell header (VIB-78, handoff Screen 2).
 *
 * Client only for the ⌘K shortcut. The search itself stays a plain GET form
 * pointing at /search, so it works without JavaScript and produces a real
 * shareable URL — the shortcut focuses the box rather than opening a command
 * palette, which is a feature nobody has asked for yet. The badge is
 * therefore true rather than decorative.
 */
/** Mirrors the /account tab strip, so the menu and the shell agree. */
const ACCOUNT_MENU = [
  { href: "/account", label: "Overview" },
  { href: "/account/bookmarks", label: "Bookmarks" },
  { href: "/account/history", label: "History" },
  { href: "/account/settings", label: "Settings" },
] as const;

export function SiteHeader({ initials }: { initials: string }) {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        input.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex items-center gap-4 border-b px-6 py-3">
      <Link href="/" aria-label="Viberation — home" className="shrink-0">
        <Logo className="h-5" />
      </Link>

      {/*
        Native <details> rather than a menu library: it opens on click and on
        Enter, closes on Escape, and is announced without any ARIA of ours.
      */}
      <details className="relative">
        <summary className="text-muted-foreground hover:text-foreground flex cursor-pointer list-none items-center gap-1 text-sm">
          Browse
          <IconChevronDown aria-hidden className="size-3.5" />
        </summary>
        <div className="bg-background absolute left-0 z-20 mt-2 w-56 rounded-md border p-2 shadow-md">
          <ul className="grid grid-cols-2 gap-0.5">
            {TOOL_CATEGORIES.map((category) => (
              <li key={category.value}>
                <Link
                  href={toolsHref({ category: category.value })}
                  className="hover:bg-accent block rounded px-2 py-1 text-xs"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </details>

      <form
        method="get"
        action="/search"
        role="search"
        className="flex flex-1 items-center"
      >
        <label htmlFor="search-header" className="sr-only">
          Search tools and guides
        </label>
        <div className="focus-within:border-ring flex w-full items-center gap-2 rounded-md border px-3 py-1.5">
          <IconSearch
            aria-hidden
            className="text-muted-foreground size-4 shrink-0"
          />
          <input
            ref={input}
            id="search-header"
            type="search"
            name="q"
            placeholder="Search tools, guides, paths…"
            className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
          />
          <kbd className="text-muted-foreground hidden shrink-0 text-[10px] sm:block">
            ⌘K
          </kbd>
        </div>
      </form>

      <Link
        href="/account/bookmarks"
        aria-label="Saved"
        className="text-muted-foreground hover:text-foreground"
      >
        <IconBookmark className="size-4" />
      </Link>

      {/*
        Notifications do not exist. Dimmed and inert rather than omitted, the
        same treatment the sidebar's Later group gets: it signals direction
        without being a control that lies about working.
      */}
      <IconBell aria-hidden className="text-muted-foreground/40 size-4" />

      {/*
        The avatar is a menu, not a link. It was a bare link to /account,
        which left a signed-in user with no way to sign out anywhere in the
        app — SignOutButton lives in AuthStatus, and AuthStatus only renders
        on the signed-out header.
      */}
      <details className="relative">
        <summary
          aria-label="Your account"
          className="bg-accent text-accent-foreground flex size-7 shrink-0 cursor-pointer list-none items-center justify-center rounded-full text-[10px] font-medium"
        >
          {initials}
        </summary>
        <div className="bg-background absolute right-0 z-20 mt-2 w-48 rounded-md border p-1 shadow-md">
          <ul>
            {ACCOUNT_MENU.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="hover:bg-accent block rounded px-2 py-1.5 text-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-1 border-t pt-1">
            <ThemeToggle />
          </div>
          <div className="mt-1 border-t pt-1">
            <SignOutButton />
          </div>
        </div>
      </details>
    </div>
  );
}
