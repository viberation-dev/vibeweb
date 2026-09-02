import Link from "next/link";

import { SignOutButton } from "@/components/features/auth/SignOutButton";
import { buttonVariants } from "@/components/ui/button";
import type { Profile } from "@/lib/queries/profiles";

/**
 * Auth state in the header.
 *
 * Takes the profile as a prop rather than fetching it: the layout already
 * needs the session to decide between the marketing top nav and the app
 * shell, and two components asking independently is two auth round trips
 * per request.
 *
 * Signed in, this is only the account link and sign-out — Saved and the
 * rest of the app nav live in the sidebar (VIB-76), and duplicating them
 * here gives two controls for the same destination.
 *
 * Links are styled with buttonVariants rather than wrapped in <Button>: this
 * shadcn style sits on Base UI, which composes via a `render` prop instead of
 * asChild, and a plain anchor keeps middle-click and "open in new tab" working.
 */
export function AuthStatus({ profile }: { profile: Profile | null }) {
  if (!profile) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Sign in
        </Link>
        <Link href="/signup" className={buttonVariants({ size: "sm" })}>
          Get started
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/account" className="text-sm underline underline-offset-4">
        {profile.username ?? profile.email ?? "Account"}
      </Link>
      <SignOutButton />
    </div>
  );
}
