import type { Metadata } from "next";

import { forgotPasswordAction } from "@/app/(auth)/actions";
import { ForgotPasswordForm } from "@/components/features/auth/ForgotPasswordForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Reset your password — Viberation" };

/** Sent here by /reset-password when the recovery session is missing or expired. */
const ERROR_MESSAGES: Record<string, string> = {
  "expired-link": "That reset link has expired. Request a new one below.",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          We will email you a link to set a new one.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {errorMessage ? (
          <p role="alert" className="text-destructive text-sm">
            {errorMessage}
          </p>
        ) : null}

        <ForgotPasswordForm action={forgotPasswordAction} />
      </CardContent>
    </Card>
  );
}
