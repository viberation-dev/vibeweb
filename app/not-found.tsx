import Link from "next/link";

/**
 * 404 for URLs that match no route group at all (VIB-96).
 *
 * Rendered inside the root layout, which is the document shell only — no
 * header, no footer — so this page carries its own way out rather than
 * relying on chrome that is not there. The site-chrome 404 lives at
 * `(site)/not-found.tsx`.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-center p-6 text-center">
      <h1 className="font-heading text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground mt-3">
        That page does not exist, or it moved.
      </p>
      <Link href="/" className="mt-6 underline underline-offset-4">
        Go home
      </Link>
    </main>
  );
}
