/**
 * Whether a stored outbound URL is safe to redirect a visitor to.
 *
 * `tools.outbound_url` is staff-written under RLS, so this is not guarding
 * against a hostile visitor — it is guarding against a typo or a paste
 * becoming a redirect the app performs on someone's behalf. A redirect is a
 * trust boundary whoever wrote the value: `javascript:` and `data:` URLs
 * execute in the visitor's context, and a relative or empty value would
 * bounce them somewhere inside the site with no explanation.
 *
 * Returns the URL when it is a plain http(s) destination, otherwise null.
 */
export function safeOutboundUrl(raw: string | null | undefined): string | null {
  if (!raw) {
    return null;
  }

  let parsed: URL;
  try {
    // Absolute only: the second argument is deliberately omitted, so a
    // relative value throws here rather than resolving against the site.
    parsed = new URL(raw);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return null;
  }
  return parsed.toString();
}
