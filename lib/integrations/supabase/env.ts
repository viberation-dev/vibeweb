/**
 * Supabase environment access.
 *
 * Only the URL and the anon key are readable from here. The service-role
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

export function supabaseAnonKey(): string {
  return required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
