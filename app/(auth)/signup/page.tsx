import type { Metadata } from "next";
import Link from "next/link";

import { signUpAction } from "@/app/(auth)/actions";
import { AuthDivider } from "@/components/features/auth/AuthDivider";
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Free — browse without one, save with one.</CardDescription>
      </CardHeader>
      {/*
        Email form first, providers second (mockup screen 7). The earlier order
        led with OAuth, which reads as the intended path — it is the shortcut,
        not the default.
      */}
      <CardContent className="space-y-6">
        <AuthForm mode="signup" action={signUpAction} />

        <AuthDivider />

        {/*
          Signing up goes to onboarding; signing in does not. The distinction
          is already encoded in which page you are on, so this needs no
          "is this their first session" flag on the profile (§31: onboarding
          runs once, post-signup).
        */}
        <OAuthButtons redirectTo="/onboarding" />

        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
