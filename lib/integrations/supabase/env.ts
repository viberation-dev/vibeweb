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

export function supabasePublishableKey(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
