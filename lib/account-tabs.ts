/**
 * The /account tab strip (VIB-69).
 *
 * Kept apart from the component so the active-state rule is testable under
 * plain `node --test` — no alias imports, no React.
 */
export const ACCOUNT_TABS = [
  { href: "/account", label: "Overview" },
  { href: "/account/bookmarks", label: "Bookmarks" },
  { href: "/account/history", label: "History" },
  { href: "/account/settings", label: "Settings" },
] as const;

/**
 * Overview lives at the shell's own path, so a plain startsWith would light
 * it up on every tab. It matches exactly; the rest match their subtree.
 */
export function isActiveTab(pathname: string, href: string): boolean {
  if (href === "/account") return pathname === "/account";
  return pathname === href || pathname.startsWith(`${href}/`);
}
