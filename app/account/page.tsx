import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/integrations/supabase/server";
import { getCurrentProfile } from "@/lib/queries/profiles";

export const metadata: Metadata = { title: "Your account — Viberation" };

const ROLE_LEVELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  expert: "Expert",
} as const;

const LAYOUT_MODES = {
  essentials: "Essentials",
  advanced: "Advanced",
} as const;

/**
 * Overview (VIB-69) — read-only summary of what Settings can change.
 *
 * Deliberately not a second copy of the form: one editor for these fields,
 * on the Settings tab, so there is no question of which one won.
 */
export default async function AccountOverviewPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  /*
   * Middleware already gates /account. This is a second, independent check:
   * middleware can be misconfigured by a matcher change, and a page that
   * renders account data should not depend on routing config alone.
   */
  if (!profile) {
    redirect("/login?redirectTo=/account");
  }

  const rows = [
    { label: "Email", value: profile.email ?? "Not set" },
    { label: "Username", value: profile.username ?? "Not set" },
    { label: "Experience level", value: ROLE_LEVELS[profile.role_level] },
    { label: "Layout", value: LAYOUT_MODES[profile.layout_mode] },
    { label: "Plan", value: profile.plan },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your account</CardTitle>
          <CardDescription>
            Change any of this on the{" "}
            <Link href="/account/settings" className="underline">
              Settings
            </Link>{" "}
            tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.label}>
                <dt className="text-muted-foreground text-sm">{row.label}</dt>
                <dd className="mt-1 text-sm">{row.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </>
  );
}
