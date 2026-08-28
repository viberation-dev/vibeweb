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

/**
 * The `rel` for an outbound tool link.
 *
 * `sponsored` is a factual claim to search engines that the link is paid, so
 * it belongs only on links that actually are. Applying it to every outbound
 * link — as this page did until VIB-57 — mislabels the whole directory, and
 * a signal that means "paid" on all 26 links means nothing on any of them.
 *
 * Pairs with the visible disclosure on the tool page: same `is_affiliate`
 * flag drives both, so the machine-readable and human-readable halves can
 * never disagree.
 */
export function outboundRel(isAffiliate: boolean): string {
  return isAffiliate ? "noopener noreferrer sponsored" : "noopener noreferrer";
}
