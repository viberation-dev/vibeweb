import type { Metadata } from "next";

import { signInAction } from "@/app/(auth)/actions";
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

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const { redirectTo, error } = await searchParams;
  const safeTarget = safeRedirect(redirectTo);
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Welcome back to Viberation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {errorMessage ? (
          <p role="alert" className="text-destructive text-sm">
            {errorMessage}
          </p>
        ) : null}

        <OAuthButtons redirectTo={safeTarget} />

        <div className="flex items-center gap-3">
          <span className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs">or</span>
          <span className="bg-border h-px flex-1" />
        </div>

        <AuthForm mode="signin" action={signInAction} redirectTo={safeTarget} />
      </CardContent>
    </Card>
  );
}
