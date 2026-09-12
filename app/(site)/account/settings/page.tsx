import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { updateProfileAction } from "@/app/(site)/account/settings/actions";
import { ThemeToggle } from "@/components/features/nav/ThemeToggle";
import { ProfileForm } from "@/components/features/profile/ProfileForm";
import { Panel } from "@/components/ui/panel";
import { createClient } from "@/lib/integrations/supabase/server";
import { getCurrentProfile } from "@/lib/queries/profiles";

export const metadata: Metadata = { title: "Settings" };

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  /*
   * Middleware already gates /account. This is a second, independent check:
   * middleware can be misconfigured by a matcher change, and a page that
   * renders account data should not depend on routing config alone.
   */
  if (!profile) {
    redirect("/login?redirectTo=/account/settings");
  }

  return (
    <div className="grid gap-5">
      <Panel>
        <h2 className="font-heading text-xl font-bold tracking-tight">
          Your profile
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">{profile.email}</p>
        <div className="mt-7">
          <ProfileForm profile={profile} action={updateProfileAction} />
        </div>
      </Panel>

      {/*
        Appearance sits outside the profile form because it is not a profile
        field: the mode lives in this browser's localStorage, not in
        `profiles` (VIB-72 — with one member-facing theme there is nothing
        to persist server-side). Putting it inside a form with a Save button
        would imply it is written with the rest, and it is not — it applies
        the moment you press it.
      */}
      <Panel>
        <h2 className="font-heading text-xl font-bold tracking-tight">
          Appearance
        </h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Applies to this browser. System follows your device setting.
        </p>
        <div className="mt-7">
          <ThemeToggle />
        </div>
      </Panel>
    </div>
  );
}
