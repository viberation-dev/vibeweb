import type { Metadata } from "next";

import { signInAction } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/features/auth/AuthForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { safeRedirect } from "@/lib/validation/auth";

export const metadata: Metadata = { title: "Sign in — Viberation" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Welcome back to Viberation.</CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm mode="signin" action={signInAction} redirectTo={safeRedirect(redirectTo)} />
      </CardContent>
    </Card>
  );
}
