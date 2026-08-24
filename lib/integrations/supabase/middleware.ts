import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { supabasePublishableKey, supabaseUrl } from "./env";

/**
 * Route prefixes that require a signed-in user. Everything else is public —
 * the directory and Learn content are readable by visitors by design.
 */
const PROTECTED_PREFIXES = ["/profile", "/bookmarks"] as const;

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Refreshes the Supabase auth token on every request and gates protected
 * routes.
 *
 * Server Components cannot write cookies, so without this the access token
 * would expire and never renew. Two things here are load-bearing and easy to
 * break while tidying:
 *
 *  1. `supabaseResponse` must be returned largely as-is. Building a fresh
 *     NextResponse without copying its cookies across drops the refreshed
 *     session and silently signs the user out.
 *  2. Nothing must run between createServerClient() and getUser(). getUser()
 *     is what actually revalidates the token against Supabase; anything
 *     awaited in between risks racing the cookie write.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    // Send them back where they were heading once they have signed in.
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
