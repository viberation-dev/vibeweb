"use client";

import { ErrorScreen } from "@/components/features/error/ErrorScreen";

/** Fallback for anything under the site chrome (VIB-96). */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorScreen
      title="Something went wrong"
      description="This page failed to load. It is often a connection that dropped for a moment, so trying again usually works."
      reset={reset}
      digest={error.digest}
    />
  );
}
