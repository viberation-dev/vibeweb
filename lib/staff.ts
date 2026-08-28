import { notFound, redirect } from "next/navigation";

import { isStaff } from "@/lib/app-role";
import { createClient } from "@/lib/integrations/supabase/server";
import { getCurrentProfile, type Profile } from "@/lib/queries/profiles";

/**
 * Server-side staff gate for any page or action under a staff-only route.
 *
 * Not the security boundary — RLS is (migration 02's `is_staff()` backs every
 * staff-write policy, so a member who got past this would still read and
 * write nothing). This exists so a staff area answers correctly instead of
 * rendering a shell full of empty queries.
 *
 * Two different answers on purpose:
 *   - signed out    → /login, like every other gated route. The realistic
 *                     case is a staff member whose session expired, and
 *                     404ing them would be a bad way to say "sign in again".
 *   - signed in, not staff → notFound(). A member has no business learning
 *                     that the route exists, and a redirect would tell them.
 *
 * Reads the profile through getCurrentProfile, which calls getUser() — the
 * token is revalidated against Supabase rather than trusted from the cookie.
 */
export async function requireStaff(returnTo: string): Promise<Profile> {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) {
    redirect(`/login?redirectTo=${encodeURIComponent(returnTo)}`);
  }
  if (!isStaff(profile.app_role)) {
    notFound();
  }
  return profile;
}
