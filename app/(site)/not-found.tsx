import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

/**
 * 404 under the site chrome (VIB-96).
 *
 * Reached both by an unmatched URL and by an explicit `notFound()` — the tool
 * and article detail pages, the admin editor, and `requireStaff()` when a
 * signed-in member hits a staff route. That last one is why this page does
 * not offer to help find the missing thing: for a member, /admin genuinely
 * does not exist, and a sympathetic "we could not find that page" is the
 * right answer rather than a hint that it is there but forbidden.
 */
export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-md p-6 text-center">
      <h1 className="font-heading text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground mt-3">
        That page does not exist, or it moved. The directory and the guides are
        both still where you left them.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/tools" className={buttonVariants()}>
          Browse tools
        </Link>
        <Link href="/learn" className={buttonVariants({ variant: "outline" })}>
          Read the guides
        </Link>
      </div>
    </main>
  );
}
