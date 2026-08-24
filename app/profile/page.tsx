import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { updateProfileAction } from "@/app/profile/actions";
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

export const metadata: Metadata = { title: "Your profile — Viberation" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  /*
   * Middleware already gates this route. This is a second, independent check:
   * middleware can be misconfigured by a matcher change, and a page that
   * renders account data should not depend on routing config alone.
   */
  if (!profile) {
    redirect("/login?redirectTo=/profile");
  }

  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
          <CardDescription>{profile.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} action={updateProfileAction} />
        </CardContent>
      </Card>
    </main>
  );
}
