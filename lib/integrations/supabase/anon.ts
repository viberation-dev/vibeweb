import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import { supabasePublishableKey, supabaseUrl } from "./env";

/**
 * Supabase client with no session: reads exactly what `anon` can read.
 *
 * It exists for values that are the same for every visitor and so can sit in
 * `unstable_cache`, which cannot read cookies. Never use it for anything
 * member-scoped; use the server client.
 */
export function createAnonClient() {
  return createClient<Database>(supabaseUrl(), supabasePublishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
