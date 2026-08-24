import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/supabase";

import { supabasePublishableKey, supabaseUrl } from "./env";

/**
 * Supabase client for Client Components. Carries the user's session from
 * cookies, so RLS applies as that user.
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl(), supabasePublishableKey());
}
