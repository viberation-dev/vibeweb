import { NextResponse } from "next/server";
import { after } from "next/server";

import { createClient } from "@/lib/integrations/supabase/server";
import { recordClick } from "@/lib/queries/clicks";
import { safeOutboundUrl } from "@/lib/outbound";
import { getToolBySlug } from "@/lib/queries/tools";

type Context = { params: Promise<{ slug: string }> };

/**
 * Tracked affiliate redirect (§06, §31).
 *
 * Every outbound link goes through here rather than straight out — "no plain
 * links" (§06) — so that a click is measurable. Migration 06 added the
 * destination and migration 12 the log; this is the only thing that reads
 * one and writes the other.
 *
 * A route handler, not a page: there is nothing to render, and a page would
 * ship a document to the visitor just to bounce them out of it.
 */
export async function GET(_request: Request, { params }: Context) {
  const { slug } = await params;
  const supabase = await createClient();

  const tool = await getToolBySlug(supabase, slug);
  const destination = safeOutboundUrl(tool?.outbound_url);

  /*
   * Unknown slug and unset destination are the same answer on purpose.
   * outbound_url is `not null default ''` (migration 06), so most tools have
   * no destination yet — redirecting those to the site root would look like
   * a working link that quietly goes nowhere.
   */
  if (!tool || !destination) {
    return new NextResponse("Not found", { status: 404 });
  }

  // after() so the log never sits between the visitor and the destination.
  after(() => recordClick(supabase, tool.id));

  const response = NextResponse.redirect(destination, 302);

  /*
   * Load-bearing. A cached redirect is served by the browser without ever
   * reaching this handler again, so the second and every later click on the
   * same link would go uncounted — the one thing this route exists to do.
   */
  response.headers.set("Cache-Control", "no-store, must-revalidate");
  return response;
}
