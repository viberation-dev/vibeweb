import { type NextRequest, NextResponse } from "next/server";

import { exchangeCodeForSession } from "@/lib/integrations/supabase/auth";
import { createClient } from "@/lib/integrations/supabase/server";
import { safeRedirect } from "@/lib/validation/auth";

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

  return NextResponse.redirect(`${origin}${next}`);
}
