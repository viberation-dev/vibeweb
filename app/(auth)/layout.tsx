import Link from "next/link";

import { Logo } from "@/components/features/nav/Logo";

/**
 * Auth chrome — logo only (handoff §4 screen 7).
 *
 * No top nav and no sidebar on purpose: these three screens have one job, and
 * a full nav invites someone mid-signup to wander off. The logo stays a link
 * home so it is not a dead end.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex justify-center p-6">
        <Link href="/" aria-label="Viberation home" className="text-foreground">
          <Logo className="h-6" />
        </Link>
      </header>

      <main className="flex flex-1 items-start justify-center px-6 pb-16">
        {children}
      </main>
    </div>
  );
}
