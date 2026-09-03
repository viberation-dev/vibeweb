import type { Metadata } from "next";
import Link from "next/link";

import { signInAction } from "@/app/(auth)/actions";
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
import { safeRedirect } from "@/lib/validation/auth";

export const metadata: Metadata = { title: "Sign in — Viberation" };

/** Error codes the auth routes redirect back with. */
const ERROR_MESSAGES: Record<string, string> = {
  "oauth-cancelled": "That sign-in was cancelled. Try again when you are ready.",
  "oauth-failed": "We could not complete that sign-in. Please try again.",
  "unknown-provider": "That sign-in method is not supported.",
  "invalid-link": "That confirmation link was not valid.",
  "expired-link": "That confirmation link has expired. Request a new one by signing up again.",
};

/** Confirmations the auth flows redirect back with. */
const NOTICE_MESSAGES: Record<string, string> = {
  "password-updated": "Your password has been updated. Sign in with it below.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string; notice?: string }>;
}) {
  const { redirectTo, error, notice } = await searchParams;
  const safeTarget = safeRedirect(redirectTo);
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;
  const noticeMessage = notice ? NOTICE_MESSAGES[notice] : undefined;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to sync your library.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {errorMessage ? (
          <p role="alert" className="text-destructive text-sm">
            {errorMessage}
          </p>
        ) : null}

        {noticeMessage ? (
          <p role="status" className="text-sm">
            {noticeMessage}
          </p>
        ) : null}

        {/* Email form first, providers second — see the note on /signup. */}
        <AuthForm mode="signin" action={signInAction} redirectTo={safeTarget} />

        <AuthDivider />

        <OAuthButtons redirectTo={safeTarget} />

        <p className="text-muted-foreground text-center text-sm">
          New here?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Create account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
