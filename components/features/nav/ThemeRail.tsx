import { ThemeToggle } from "@/components/features/nav/ThemeToggle";

/**
 * Fixed left rail housing the mode control (VIB-98 §14 item 6).
 *
 * A placement, not a new control — ThemeToggle is VIB-73's and unchanged.
 *
 * The rail hides below 1280px, which VIB-99 flags as a gap: hidden rail, no
 * toggle. Signed-out visitors had no toggle at all before this (it lived in
 * the signed-in SiteHeader and account settings), so the header renders the
 * same component below `xl` and the rail takes over above it. The two are
 * mutually exclusive, so there is never a second copy on screen.
 */
export function ThemeRail() {
  return (
    <div className="fixed top-1/2 left-4 z-40 hidden -translate-y-1/2 xl:block">
      {/* v3's `.tgl`: a bordered pill, not a card — the buttons inside are
          round, so a rounded-full shell keeps the silhouette consistent. */}
      <div className="bg-card rounded-full border p-1.5 shadow-lg">
        <ThemeToggle orientation="vertical" />
      </div>
    </div>
  );
}
