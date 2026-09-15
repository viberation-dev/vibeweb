import { timingSafeEqual } from "node:crypto";

import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/integrations/supabase/server";
import { emailOrigin, sendDueWelcomeEmails } from "@/lib/welcome-emails";

/**
 * Daily welcome-sequence run (VIB-155), scheduled in vercel.json.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET`. The same secret is what
 * claim_welcome_emails checks in the database, so this route holds no power
 * of its own: without the secret it can neither pass here nor there.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });
  }

  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const supabase = await createClient();
  const result = await sendDueWelcomeEmails(supabase, secret, emailOrigin(request.nextUrl.origin));

  console.log("welcome emails", result);
  return NextResponse.json(result);
}
