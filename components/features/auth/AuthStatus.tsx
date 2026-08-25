import Link from "next/link";

import { SignOutButton } from "@/components/features/auth/SignOutButton";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/integrations/supabase/server";
import { getCurrentProfile } from "@/lib/queries/profiles";

/**
 * Minimal auth state in the header.
 *
 * Placeholder chrome so the sign-in/sign-out loop is reachable and testable.
 * Design will replace this wholesale when the approved header lands — it is
 * not an attempt at the real navigation.
 *
 * Links are styled with buttonVariants rather than wrapped in <Button>: this
 * shadcn style sits on Base UI, which composes via a `render` prop instead of
 * asChild, and a plain anchor keeps middle-click and "open in new tab" working.
 */
export async function AuthStatus() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Sign in
        </Link>
        <Link href="/signup" className={buttonVariants({ size: "sm" })}>
          Create account
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/bookmarks" className="text-sm text-muted-foreground hover:text-foreground">
        Bookmarks
      </Link>
      <Link href="/profile" className="text-sm underline underline-offset-4">
        {profile.username ?? profile.email ?? "Profile"}
      </Link>
      <SignOutButton />
    </div>
  );
}
