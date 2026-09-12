import type { Metadata } from "next";
import Link from "next/link";

import { signUpAction } from "@/app/(auth)/actions";
import { AuthDivider } from "@/components/features/auth/AuthDivider";
import { AuthForm } from "@/components/features/auth/AuthForm";
import { OAuthButtons } from "@/components/features/auth/OAuthButtons";
import { Panel } from "@/components/ui/panel";
import { SectionHead } from "@/components/ui/section-head";

export const metadata: Metadata = { title: "Create an account" };

export default function SignUpPage() {
  return (
    <Panel size="lg" className="w-full max-w-md p-8 lg:p-10">
      <SectionHead
        level="h1"
        align="center"
        title="Create your account"
        lede="Free. Browsing needs no account; saving does."
        className="mb-8"
      />
      {/*
        Email form first, providers second (mockup screen 7). The earlier order
        led with OAuth, which reads as the intended path — it is the shortcut,
        not the default.
      */}
      <div className="space-y-6">
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
      </div>
    </Panel>
  );
}
