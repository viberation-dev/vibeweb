import { redirect } from "next/navigation";

import { AccountTabs } from "@/components/features/account/AccountTabs";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/integrations/supabase/server";
import { getCurrentProfile } from "@/lib/queries/profiles";

/** Two letters for the avatar, from whatever identity exists. */
function initialsFor(name: string): string {
  const parts = name.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return letters.toUpperCase() || "?";
}

/**
 * The /account shell (VIB-69, styled for VIB-84 to mockup screen 9).
 *
 * The header card and tab strip live here so all four tabs share one
 * identity block rather than each repeating it.
 *
 * **This is still not a gate.** Every page underneath keeps its own session
 * check — middleware handles the signed-out half at the edge, and a layout
 * that redirects is not a substitute for either. The redirect below exists
 * only so the header has a profile to render; removing it would not open
 * anything up.
 *
 * getCurrentProfile is cache()d, so this shares one revalidation with the
 * root layout and the page rather than adding a third round trip.
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) {
    redirect("/login?redirectTo=/account");
  }

  const name = profile.username ?? profile.email ?? "Your account";

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="rounded-xl border">
        <div className="flex flex-wrap items-center gap-4 p-6">
          <span
            aria-hidden
            className="bg-accent text-accent-foreground flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-medium"
          >
            {initialsFor(name)}
          </span>
          <div className="min-w-0">
            <h1 className="font-heading truncate text-xl font-semibold">{name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {/*
                Both read straight off `profiles`. Plan is `free` or `pro`
                and capitalised for display only — the stored value is the
                enum, not this string.
              */}
              <Badge variant="secondary" className="capitalize">
                {profile.plan} plan
              </Badge>
              <Badge variant="outline" className="capitalize">
                {profile.role_level}
              </Badge>
            </div>
          </div>
        </div>

        <AccountTabs />
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
