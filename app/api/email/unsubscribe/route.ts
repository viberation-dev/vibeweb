import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/integrations/supabase/server";
import { unsubscribeWelcomeEmails } from "@/lib/queries/welcome-emails";

const paramsSchema = z.object({
  u: z.string().uuid(),
  s: z.string().regex(/^[0-9a-f]{64}$/),
});

/**
 * Unsubscribe from the welcome sequence (VIB-155).
 *
 * POST only. Mail clients' one-click button (RFC 8058) posts here directly
 * and expects a 2xx. The page at /email/unsubscribe posts here too, with
 * `from=page`, and gets sent back to a confirmation. A GET link is never
 * enough on its own, because link scanners in corporate mail open every link
 * and would unsubscribe people who never asked.
 */
export async function POST(request: NextRequest) {
  const parsed = paramsSchema.safeParse({
    u: request.nextUrl.searchParams.get("u"),
    s: request.nextUrl.searchParams.get("s"),
  });

  const form = await request.formData().catch(() => null);
  const fromPage = form?.get("from") === "page";

  const ok = parsed.success
    ? await unsubscribeWelcomeEmails(await createClient(), parsed.data.u, parsed.data.s)
    : false;

  if (fromPage) {
    const outcome = ok ? "done" : "invalid";
    return NextResponse.redirect(new URL(`/email/unsubscribe?${outcome}=1`, request.nextUrl.origin), 303);
  }

  return NextResponse.json({ ok }, { status: ok ? 200 : 400 });
}
