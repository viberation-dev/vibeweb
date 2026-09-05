"use client";

import { ErrorScreen } from "@/components/features/error/ErrorScreen";

/**
 * Fallback for onboarding (VIB-96).
 *
 * The tier is written as step 1 is submitted, so an interruption later does
 * not lose it — say so, or someone assumes they have to start over.
 */
export default function FocusedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorScreen
      title="Something went wrong"
      description="Your answers so far are saved. Try again to pick up where you were, or skip ahead and set this up later in Account settings."
      reset={reset}
      digest={error.digest}
    />
  );
}
