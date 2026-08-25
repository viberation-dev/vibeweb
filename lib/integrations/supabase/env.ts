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

/**
 * Rejects a URL that points at the Supabase *dashboard* rather than a project's
 * API origin.
 *
 * This is the easy mistake: the dashboard URL is what is in the address bar
 * while you are copying the values out, and it looks plausible. Nothing
 * downstream catches it — supabase-js happily requests
 * `supabase.com/rest/v1/...`, gets an HTML 404 back, and every call fails as
 * "Unexpected token '<', "<!DOCTYPE "... is not valid JSON", which names
 * neither the variable nor the cause. Cost us a broken preview deploy.
 *
 * Deliberately narrow: it rejects the two shapes that cannot possibly be an
 * API origin — a supabase.com host, or any URL carrying a path — and lets
 * everything else through, so a custom domain or a local `supabase start`
 * origin still works.
 */
export function assertSupabaseApiUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`NEXT_PUBLIC_SUPABASE_URL is not a valid URL: ${value}`);
  }

  const hint =
    "Use the Project URL from Project Settings → API (https://<project-ref>.supabase.co), not the dashboard address.";

  if (url.hostname === "supabase.com" || url.hostname.endsWith(".supabase.com")) {
    throw new Error(`NEXT_PUBLIC_SUPABASE_URL points at the Supabase dashboard (${value}). ${hint}`);
  }

  if (url.pathname !== "/") {
    throw new Error(`NEXT_PUBLIC_SUPABASE_URL must be an origin with no path (${value}). ${hint}`);
  }

  return value;
}

export function supabaseUrl(): string {
  return assertSupabaseApiUrl(
    required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  );
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
