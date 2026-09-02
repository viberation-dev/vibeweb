import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";
import { cache } from "react";

import type { Database } from "@/types/supabase";

import { supabasePublishableKey, supabaseUrl } from "./env";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * Server Components cannot write cookies, so the setAll failure is swallowed
 * there; session refresh is handled by middleware instead.
 */
/*
 * Request-scoped: React cache() returns the same client for every caller in
 * one request, so the root layout, a nested layout and the page share it
 * instead of building three. That also makes getCurrentProfile's own cache
 * effective, since its key is the client it is handed.
 */
export const createClient = cache(async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — middleware refreshes the session.
        }
      },
    },
  });
})
