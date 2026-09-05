"use client";

import { ErrorScreen } from "@/components/features/error/ErrorScreen";

/**
 * Fallback for the staff editors (VIB-96).
 *
 * The wording is the whole point of this file existing separately. What
 * prompted the issue was a save that **succeeded** — the row was written and
 * the redirect then lost the network — while the screen said an error had
 * occurred. Someone believing that retypes the article, and the unique slug
 * turns the retry into "that slug is already taken", which reads like a
 * second unrelated bug.
 *
 * So this says what is actually true: the write may or may not have landed,
 * and the list is the place to find out. Claiming either outcome would be a
 * guess, and one of the two guesses costs someone their work.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorScreen
      title="Something went wrong"
      description="If you were saving, the change may already have gone through — check the list before entering it again."
      reset={reset}
      digest={error.digest}
      homeHref="/admin"
      homeLabel="Back to the staff area"
    />
  );
}
