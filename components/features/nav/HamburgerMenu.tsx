"use client";

import { IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "@/components/features/nav/ThemeToggle";
import { TOP_NAV } from "@/lib/nav";

/**
 * The full-screen overlay menu behind the header's hamburger (VIB-102).
 *
 * Structural match to Ohio demo5's `hamburger-nav`, rebuilt in Viberation's
 * own routes and content — no markup, styles or copy taken from the demo.
 * What that pattern actually is, having inspected it: the `-left` modifier
 * only positions the *button*; the panel itself is a near-opaque full-screen
 * overlay, not a left drawer. Close sits top-left under the button, the nav
 * items are display-size and numbered, and contact plus social links run
 * along the bottom.
 *
 * Built on native <dialog> + showModal() rather than a div with state:
 * Escape-to-close, focus trapping, and inerting the page behind are all
 * things the platform already does correctly and are easy to do badly by
 * hand. Only the body scroll lock is ours, since <dialog> does not cover it.
 *
 * The overlay carries more than the header nav — contact and socials too —
 * so it is not merely a duplicate of the links already on screen, which is
 * why it earns its place at desktop widths as well as mobile.
 */
export function HamburgerMenu() {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function openMenu() {
    ref.current?.showModal();
    setOpen(true);
  }

  /* close() only calls .close(); `onClose` is what clears the state, so the
     Escape key and the backdrop path land in exactly the same place. */
  function close() {
    ref.current?.close();
  }

  // Navigating away leaves the dialog open over the new page otherwise —
  // the route changes underneath it without React unmounting this.
  useEffect(() => {
    if (ref.current?.open) ref.current.close();
  }, [pathname]);

  /*
   * Scroll lock. Tied to the dialog's own open state rather than set in the
   * click handler, so the Escape key and the backdrop path unlock it too.
   */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={openMenu}
        className="bg-secondary hover:bg-primary/10 hover:text-primary flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors"
      >
        <IconMenu2 aria-hidden className="size-5" />
      </button>

      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        /*
         * <dialog> renders in the top layer, so it is not subject to the
         * header's stacking context. backdrop:bg-transparent because the
         * panel itself is the near-opaque ground — a second dimmed layer
         * underneath only muddies it.
         */
        className="bg-foreground text-background dark:bg-background dark:text-foreground m-0 h-full max-h-none w-full max-w-none p-0 backdrop:bg-transparent"
        onClick={(event) => {
          // Clicking the ground closes; clicking the content does not.
          if (event.target === ref.current) close();
        }}
        /*
          A modal dialog closes on Escape by itself, so this is belt and
          braces — but a full-screen menu that cannot be dismissed from the
          keyboard is a focus trap, and that is not a failure worth risking
          on the assumption that the native path always fires. Harmless when
          it does: the dialog is already closing and close() is idempotent.
        */
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            close();
          }
        }}
      >
        <div
          className="mx-auto flex h-full max-w-[1320px] flex-col px-[clamp(1.25rem,4vw,3.75rem)] py-8"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="hover:bg-background/10 dark:hover:bg-foreground/10 -ml-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors"
          >
            <IconX aria-hidden className="size-6" />
          </button>

          <nav
            aria-label="Menu"
            className="flex flex-1 flex-col justify-center py-10"
          >
            <ul>
              {MENU.map((item, i) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className="group flex items-baseline gap-5 py-2"
                  >
                    <span
                      aria-hidden
                      className="w-6 shrink-0 font-mono text-xs opacity-50"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-heading text-4xl font-extrabold tracking-[-0.04em] transition-opacity group-hover:opacity-60 sm:text-5xl lg:text-6xl">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="grid gap-8 border-t border-current/15 pt-8 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase opacity-50">
                Questions?
              </p>
              <a
                href="mailto:hello@viberation.dev"
                className="mt-2 block text-sm font-semibold hover:underline"
              >
                hello@viberation.dev
              </a>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase opacity-50">
                Start here
              </p>
              <Link
                href="/signup"
                onClick={close}
                className="mt-2 block text-sm font-semibold hover:underline"
              >
                Create a free account
              </Link>
              {/*
                The header hides "Sign in" below 640px, and the <details>
                menu this replaced was carrying it there. Without this line
                a phone visitor has no route to the login screen.
              */}
              <Link
                href="/login"
                onClick={close}
                className="mt-1 block text-sm font-semibold hover:underline"
              >
                Sign in
              </Link>
            </div>
            {/* The header has no theme switch; ThemeRail covers xl and up. */}
            <div className="xl:hidden">
              <p className="text-xs font-bold tracking-widest uppercase opacity-50">
                Colour mode
              </p>
              <div className="-ml-1 mt-1">
                <ThemeToggle />
              </div>
            </div>
            <div className="flex items-end gap-5 text-sm font-semibold">
              <a
                href="https://x.com/viberation"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                X
              </a>
              <a
                href="https://github.com/viberation-dev"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}

/**
 * The overlay's own list. TOP_NAV plus Walkthroughs — the header keeps three
 * links for room, but the overlay has space for the full set, which is part
 * of why it exists at desktop as well.
 */
const MENU = [...TOP_NAV, { href: "/walkthroughs", label: "Walkthroughs" }] as const;
