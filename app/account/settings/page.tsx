import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { updateProfileAction } from "@/app/account/settings/actions";
import { ProfileForm } from "@/components/features/profile/ProfileForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/integrations/supabase/server";
import { getCurrentProfile } from "@/lib/queries/profiles";

export const metadata: Metadata = { title: "Settings — Viberation" };

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
    <main className="mx-auto w-full max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>{profile.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} action={updateProfileAction} />
        </CardContent>
      </Card>
    </main>
  );
}
