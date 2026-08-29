import type { Metadata } from "next";

import { signUpAction } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/features/auth/AuthForm";
import { OAuthButtons } from "@/components/features/auth/OAuthButtons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Create an account — Viberation" };

export default function SignUpPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Start building your library of AI tools.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/*
          Signing up goes to onboarding; signing in does not. The distinction
          is already encoded in which page you are on, so this needs no
          "is this their first session" flag on the profile (§31: onboarding
          runs once, post-signup).
        */}
        <OAuthButtons redirectTo="/onboarding" />

        <div className="flex items-center gap-3">
          <span className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs">or</span>
          <span className="bg-border h-px flex-1" />
        </div>

        <AuthForm mode="signup" action={signUpAction} />
      </CardContent>
    </Card>
  );
}
