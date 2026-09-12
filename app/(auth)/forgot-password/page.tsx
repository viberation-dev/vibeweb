import type { Metadata } from "next";
import Link from "next/link";

import { forgotPasswordAction } from "@/app/(auth)/actions";
import { ForgotPasswordForm } from "@/components/features/auth/ForgotPasswordForm";
import { Panel } from "@/components/ui/panel";
import { SectionHead } from "@/components/ui/section-head";

export const metadata: Metadata = { title: "Reset your password" };

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
    <Panel size="lg" className="w-full max-w-md p-8 lg:p-10">
      <SectionHead
        level="h1"
        align="center"
        title="Reset your password"
        lede="We will email you a link to set a new one."
        className="mb-8"
      />
      <div className="space-y-6">
        {errorMessage ? (
          <p role="alert" className="text-destructive text-sm">
            {errorMessage}
          </p>
        ) : null}

        <ForgotPasswordForm action={forgotPasswordAction} />

        <p className="text-muted-foreground text-center text-sm">
          Remembered it?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </Panel>
  );
}
