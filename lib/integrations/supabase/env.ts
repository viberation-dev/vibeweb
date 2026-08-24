/**
 * Supabase environment access.
 *
 * Only the URL and the publishable key are readable from here. The secret
 * key is deliberately absent: it must never reach client code, and no MVP
 * feature needs it — RLS is the security boundary (Bible §34).
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill in the values from the Supabase dashboard (Project Settings → API).`,
    );
  }
  return value;
}

export function supabaseUrl(): string {
  return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

/**
 * Supabase is mid-rename on its API keys: older projects issue an `anon` JWT,
 * current ones issue `sb_publishable_...`. Either variable name is accepted so
 * the Vercel dashboard, CI and .env.local don't have to agree on which era
 * they came from. PUBLISHABLE wins when both are set.
 *
 * Both names are read as literal `process.env.X` expressions on purpose:
 * Next.js inlines NEXT_PUBLIC_* at build time by static analysis, so a
 * computed lookup like process.env[name] would come back undefined in the
 * browser bundle.
 */
export function supabasePublishableKey(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
