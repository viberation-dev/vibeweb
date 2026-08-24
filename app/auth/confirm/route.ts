import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/integrations/supabase/server";
import { safeRedirect } from "@/lib/validation/auth";

/**
 * Handles the link Supabase emails after sign-up.
 *
 * The link carries a one-time token which is exchanged for a session here.
 * `next` is passed through safeRedirect so a crafted confirmation link cannot
 * bounce a freshly authenticated user to another origin.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeRedirect(searchParams.get("next"));

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/login?error=invalid-link`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=expired-link`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
