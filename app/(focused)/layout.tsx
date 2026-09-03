import Link from "next/link";

import { Logo } from "@/components/features/nav/Logo";

/**
 * Logo-only chrome for single-purpose screens (handoff §4 screens 7–8).
 *
 * Onboarding shares the auth screens' framing in the mockup: the brand mark
 * above a centred card, no top nav and no sidebar. Same reason as /login —
 * a full nav mid-flow is an invitation to wander off before finishing, and
 * the sidebar in particular advertises a product this person has not been
 * shown yet.
 *
 * The `(auth)` group keeps its own copy of this: those screens are reachable
 * signed out and this one is not, and merging them would mean one layout
 * with a condition in it rather than two layouts with none.
 */
export default function FocusedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex justify-center p-6">
        <Link href="/" aria-label="Viberation home" className="text-foreground">
          <Logo className="h-6" />
        </Link>
      </header>

      <main className="flex flex-1 justify-center px-6 pb-16">{children}</main>
    </div>
  );
}
