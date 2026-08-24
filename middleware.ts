import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/integrations/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Every path except static assets and image files. Auth cookies only
     * matter for documents, and running this on every icon request would
     * burn Supabase calls for nothing.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
