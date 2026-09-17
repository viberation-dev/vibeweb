import { after, type NextRequest, NextResponse } from "next/server";

import { exchangeCodeForSession } from "@/lib/integrations/supabase/auth";
import { createClient } from "@/lib/integrations/supabase/server";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { safeRedirect } from "@/lib/validation/auth";
import { sendFirstWelcomeEmail } from "@/lib/welcome-emails";

/**
 * Where the OAuth provider sends the user back to.
 *
 * `next` goes through safeRedirect so a crafted callback link cannot bounce a
 * freshly authenticated user to another origin. An error from the provider
 * (for example the user pressing cancel) arrives as ?error= rather than ?code=.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const providerError = searchParams.get("error");
  const next = safeRedirect(searchParams.get("next"));

  if (providerError) {
    return NextResponse.redirect(`${origin}/login?error=oauth-cancelled`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth-failed`);
  }

  const supabase = await createClient();
  const result = await exchangeCodeForSession(supabase, code);

  if (!result.ok) {
    return NextResponse.redirect(`${origin}/login?error=oauth-failed`);
  }

  // First provider sign-in starts the welcome sequence (VIB-155); every
  // later one is a no-op in the database.
  after(() => sendFirstWelcomeEmail(supabase, origin));

  /*
   * A brand-new account goes through onboarding wherever the button was
   * pressed (VIB-169). Only /signup asked for it before, so choosing Google on
   * /login created an account that skipped setup. An abandoned run is left to
   * the home nudge rather than forced on every later sign-in.
   *
   * ponytail: "new" means the profile row is under ten minutes old; a stored
   * first-sign-in flag would be exact if that ever proves too loose.
   */
  const profile = await getCurrentProfile(supabase);
  const isNew =
    profile && !profile.onboarding_completed && Date.now() - Date.parse(profile.created_at) < 10 * 60_000;

  return NextResponse.redirect(`${origin}${isNew ? "/onboarding" : next}`);
}
