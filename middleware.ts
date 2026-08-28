import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/integrations/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Every path except static assets, image files and /go. Auth cookies
     * only matter for documents, and running this on every icon request
     * would burn Supabase calls for nothing.
     *
     * /go is excluded because it is the outbound redirect: it never reads a
     * session, and the visitor is standing still until it answers. Refreshing
     * an auth token first would put a Supabase round trip in front of every
     * affiliate click for no one's benefit.
     */
    "/((?!_next/static|_next/image|favicon.ico|go/|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
