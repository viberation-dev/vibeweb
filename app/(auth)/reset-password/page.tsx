import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { resetPasswordAction } from "@/app/(auth)/actions";
import { ResetPasswordForm } from "@/components/features/auth/ResetPasswordForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/integrations/supabase/server";

export const metadata: Metadata = { title: "Set a new password — Viberation" };

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * Reaching this page means /auth/confirm already exchanged the recovery
   * token for a session. No session means the link was never followed, or has
   * expired — send them back to ask for a fresh one rather than showing a form
   * that cannot save. Not in middleware's PROTECTED_PREFIXES on purpose: that
   * bounces to /login, which is a dead end for someone who cannot sign in.
   */
  if (!user) {
    redirect("/forgot-password?error=expired-link");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Set a new password</CardTitle>
        <CardDescription>Signing in elsewhere will need this new password.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm action={resetPasswordAction} />
      </CardContent>
    </Card>
  );
}
