import type { SupabaseClient } from "@supabase/supabase-js";

import { renderWelcomeEmail, unsubscribeUrl, creatingCategory, type WelcomeStep } from "@/lib/emails/welcome";
import { sendEmail } from "@/lib/integrations/resend";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { listTools } from "@/lib/queries/tools";
import { listWalkthroughs } from "@/lib/queries/walkthroughs";
import { claimWelcomeEmails, startWelcomeEmails } from "@/lib/queries/welcome-emails";
import type { Database } from "@/types/supabase";

type Client = SupabaseClient<Database>;

/**
 * Where email links point. The production domain when Vercel says there is
 * one, so a welcome triggered from a preview still links to the real site;
 * otherwise the request's own origin (local dev).
 */
export function emailOrigin(fallback: string): string {
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return production ? `https://${production}` : fallback;
}

/**
 * Email 1, straight after a confirmed sign-in (VIB-155).
 *
 * Never throws: a failed welcome must not turn into a failed sign-in, so
 * callers run this inside after() and problems go to the log. The database
 * decides whether this person gets one at all, so calling it on every
 * sign-in is safe.
 */
export async function sendFirstWelcomeEmail(client: Client, fallbackOrigin: string): Promise<void> {
  try {
    const signature = await startWelcomeEmails(client);
    if (!signature) return;

    const [{ data: auth }, profile, walkthroughs] = await Promise.all([
      client.auth.getUser(),
      getCurrentProfile(client),
      listWalkthroughs(client),
    ]);
    const user = auth.user;
    if (!user?.email || !profile) return;

    const origin = emailOrigin(fallbackOrigin);
    const link = unsubscribeUrl(origin, user.id, signature);
    const walkthrough = walkthroughs[0];
    const email = renderWelcomeEmail({
      step: 1,
      name: (user.user_metadata?.full_name as string | undefined) ?? profile.username,
      level: profile.role_level,
      creating: [],
      origin,
      unsubscribeUrl: link,
      walkthrough: walkthrough ? { title: walkthrough.title, slug: walkthrough.slug } : undefined,
    });

    const result = await sendEmail({ to: user.email, ...email, unsubscribeUrl: link });
    if (result.status !== "sent") {
      console.error("welcome email 1 not sent", result);
    }
  } catch (error) {
    console.error("welcome email 1 failed", error);
  }
}

/**
 * Emails 2-4, from the daily cron. Returns counts for the cron log.
 *
 * ponytail: claims at most 90 a run to stay under Resend's free daily cap;
 * a backlog simply rolls to the next day. Raise the limit in the SQL function
 * alongside a paid Resend plan.
 */
export async function sendDueWelcomeEmails(
  client: Client,
  secret: string,
  origin: string,
): Promise<{ claimed: number; sent: number; failed: number }> {
  const due = await claimWelcomeEmails(client, secret);
  let sent = 0;
  let failed = 0;

  for (const row of due) {
    const step = row.step as WelcomeStep;
    const tools =
      step === 2
        ? (
            await listTools(client, {
              category: creatingCategory(row.creating),
              bestFor: row.role_level,
              sort: "popular",
              pageSize: 3,
            })
          ).tools.map(({ name, slug, tagline }) => ({ name, slug, tagline }))
        : undefined;

    const link = unsubscribeUrl(origin, row.user_id, row.unsubscribe_sig);
    const email = renderWelcomeEmail({
      step,
      name: row.display_name,
      level: row.role_level,
      creating: row.creating,
      origin,
      unsubscribeUrl: link,
      tools,
    });

    const result = await sendEmail({ to: row.email, ...email, unsubscribeUrl: link });
    if (result.status === "sent") {
      sent += 1;
    } else {
      failed += 1;
      console.error(`welcome email ${step} not sent`, row.user_id, result);
    }
  }

  return { claimed: due.length, sent, failed };
}
