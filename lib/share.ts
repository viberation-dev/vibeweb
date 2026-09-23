/**
 * Share targets for a page (VIB-198).
 *
 * One list, used by the chips at the end of an article and by the dock's
 * menu, so the two can never offer different networks. Each entry is a pure
 * function of url + title, which is what makes this testable without a DOM.
 *
 * Instagram is deliberately absent. It has no web share intent — every
 * "share to Instagram" button on the web is a copy-link button wearing a
 * logo — so it is offered as `copy` rather than as a link that would open a
 * login wall and lose the reader.
 *
 * Alias-free imports: share.test.ts runs under
 * `node --experimental-strip-types`.
 */

export type ShareNetwork = {
  key: string;
  label: string;
  /** Tabler icon name, without the `Icon` prefix — see ShareChips. */
  icon: string;
  href: (url: string, title: string) => string;
};

const encode = (value: string) => encodeURIComponent(value);

export const SHARE_NETWORKS: ShareNetwork[] = [
  {
    key: "x",
    label: "X",
    icon: "BrandX",
    href: (url, title) => `https://x.com/intent/post?url=${encode(url)}&text=${encode(title)}`,
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: "BrandFacebook",
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encode(url)}`,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: "BrandLinkedin",
    href: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encode(url)}`,
  },
  {
    key: "threads",
    label: "Threads",
    icon: "BrandThreads",
    href: (url, title) =>
      `https://www.threads.net/intent/post?url=${encode(url)}&text=${encode(title)}`,
  },
  {
    key: "pinterest",
    label: "Pinterest",
    icon: "BrandPinterest",
    href: (url, title) =>
      `https://pinterest.com/pin/create/button/?url=${encode(url)}&description=${encode(title)}`,
  },
];

/**
 * The Google "preferred source" preferences page for a domain.
 *
 * Google expects the site's bare domain as the query, not a full URL — a
 * URL there searches for the string and the toggle never appears.
 */
export function preferredSourceUrl(domain: string): string {
  return `https://www.google.com/preferences/source?q=${encode(domain)}`;
}
