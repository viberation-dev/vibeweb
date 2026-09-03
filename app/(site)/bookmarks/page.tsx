import { permanentRedirect } from "next/navigation";

/**
 * Moved under the /account shell (VIB-69). Kept as a redirect rather than
 * deleted: these paths are in browser histories, bookmarks and old
 * ?redirectTo= links, and a 404 for a signed-in user reads as data loss.
 */
export default function BookmarksPage() {
  permanentRedirect("/account/bookmarks");
}
