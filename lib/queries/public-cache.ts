import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

import { createAnonClient } from "@/lib/integrations/supabase/anon";
import type { Database } from "@/types/supabase";

type Client = SupabaseClient<Database>;

/**
 * Caches a public-read query, keyed by its arguments, for 5 minutes.
 *
 * Only for data that is the same for every visitor: it runs with the anon
 * client, so RLS shows exactly what a signed-out reader sees. The listings
 * on /tools, /learn and /blog used to run these on every request, which is
 * most of what used up Vercel's CPU allowance.
 *
 * revalidatePath() on a route also clears the entries that route read, so an
 * admin edit shows up straight away; the 5 minutes is only a backstop.
 *
 * Results go through JSON, so a query that returns a Map must be cached as
 * entries and rebuilt by the caller.
 */
export function publicCached<A extends unknown[], R>(
  name: string,
  query: (client: Client, ...args: A) => Promise<R>,
): (...args: A) => Promise<R> {
  return unstable_cache((...args: A) => query(createAnonClient(), ...args), [name], {
    revalidate: 300,
  });
}
