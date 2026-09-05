"use client";

import { ErrorScreen } from "@/components/features/error/ErrorScreen";

/**
 * Fallback for the auth screens (VIB-96).
 *
 * Deliberately says nothing about whether an account, email or password was
 * recognised — an error page is not a place to leak what the forms
 * themselves are careful not to.
 */
export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorScreen
      title="Something went wrong"
      description="We could not finish that. Try again, or head back and start over."
      reset={reset}
      digest={error.digest}
      homeHref="/login"
      homeLabel="Back to sign in"
    />
  );
}
