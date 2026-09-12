import { permanentRedirect } from "next/navigation";

/**
 * Renamed to /walkthroughs (VIB-120). Kept as a redirect rather than deleted,
 * for the same reason /bookmarks is: the old path is in browser histories,
 * bookmarks, old ?redirectTo= links and anything already indexed.
 */
export default function WizardsPage() {
  permanentRedirect("/walkthroughs");
}
