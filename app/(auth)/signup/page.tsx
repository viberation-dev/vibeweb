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
      {/*
        Email form first, providers second (mockup screen 7). The earlier order
        led with OAuth, which reads as the intended path — it is the shortcut,
        not the default.

        The heading and everything below the form live inside AuthForm so the
        whole card can give way to "Check your email" once signup succeeds
        (VIB-152).
      */}
      <AuthForm
        mode="signup"
        action={signUpAction}
        heading={
          <SectionHead
            level="h1"
            align="center"
            title="Create your account"
            lede="Free forever. Save tools, track your progress and get picks for your level."
            className="mb-8"
          />
        }
      >
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
      </AuthForm>
    </Panel>
  );
}
