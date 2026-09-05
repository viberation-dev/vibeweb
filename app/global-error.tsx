"use client";

/**
 * The last boundary (VIB-96).
 *
 * Only reached when the root layout itself throws — a segment `error.tsx`
 * lives *inside* that layout and cannot catch its own parent failing. It
 * therefore has to render its own <html> and <body>, and it cannot use the
 * app's components: the fonts and globals.css are applied by the very layout
 * that just failed.
 *
 * Hence the inline styles. They are not laziness; anything imported here
 * risks depending on what is already broken. System fonts and two colours
 * that read on both a white and a dark browser default.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <main style={{ maxWidth: "28rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
            Viberation could not load
          </h1>
          <p style={{ marginTop: "0.75rem", lineHeight: 1.6, opacity: 0.75 }}>
            Something failed before the page could start. Reloading usually
            fixes it.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              borderRadius: "0.5rem",
              border: "1px solid currentColor",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest ? (
            <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", opacity: 0.6 }}>
              Reference: <code>{error.digest}</code>
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
