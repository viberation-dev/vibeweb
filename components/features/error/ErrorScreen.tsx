"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";

type Props = {
  title: string;
  /** What the reader should understand, in their terms — not the exception. */
  description: string;
  /** Next's own retry. Re-renders the segment rather than reloading the page. */
  reset: () => void;
  /**
   * Next attaches this to production errors and logs the same value
   * server-side. Showing it is the only way someone reporting a problem can
   * point at the exact occurrence — the message itself is deliberately
   * withheld in production.
   */
  digest?: string;
  /** Where "go back" should lead when the current page is the broken one. */
  homeHref?: string;
  homeLabel?: string;
};

/**
 * The shared body of every error boundary (VIB-96).
 *
 * One component, several thin `error.tsx` files: each route group has its own
 * chrome, so the fallback has to live inside that group to keep the header it
 * belongs under. What differs between them is the copy, not the markup.
 *
 * No stack trace, and no "try again later" — a button that actually retries,
 * because the most common cause is a connection that dropped for a second.
 */
export function ErrorScreen({
  title,
  description,
  reset,
  digest,
  homeHref = "/",
  homeLabel = "Go home",
}: Props) {
  return (
    <div className="mx-auto w-full max-w-md p-6 text-center">
      <h1 className="font-heading text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground mt-3">{description}</p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href={homeHref} className={buttonVariants({ variant: "outline" })}>
          {homeLabel}
        </Link>
      </div>

      {digest ? (
        <p className="text-muted-foreground mt-6 text-xs">
          Reference: <code>{digest}</code>
        </p>
      ) : null}
    </div>
  );
}
