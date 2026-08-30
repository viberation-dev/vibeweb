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

  /*
   * A recovery token only exists so someone can set a new password, so that is
   * where it lands unless the link says otherwise. The destination lives in a
   * Supabase email template, which is edited in a dashboard and not covered by
   * anything in this repo — defaulting on the type here means a template that
   * omits `next` still works instead of dropping the user on the home page
   * holding a recovery session and no way to use it.
   */
  const fallback = type === "recovery" ? "/reset-password" : "/";
  const next = safeRedirect(searchParams.get("next"), fallback);

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
