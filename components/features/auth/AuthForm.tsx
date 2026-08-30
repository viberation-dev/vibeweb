"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthFormState } from "@/app/(auth)/actions";

type Props = {
  mode: "signin" | "signup";
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  redirectTo?: string;
};

const COPY = {
  signin: {
    submit: "Sign in",
    pending: "Signing in…",
    switchText: "Need an account?",
    switchHref: "/signup",
    switchLabel: "Create one",
    autoComplete: "current-password",
  },
  signup: {
    submit: "Create account",
    pending: "Creating account…",
    switchText: "Already have an account?",
    switchHref: "/login",
    switchLabel: "Sign in",
    autoComplete: "new-password",
  },
} as const;

export function AuthForm({ mode, action, redirectTo }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const copy = COPY[mode];

  return (
    <form action={formAction} className="space-y-4">
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={copy.autoComplete}
          required
          minLength={mode === "signup" ? 8 : undefined}
        />
        {mode === "signup" ? (
          <p className="text-muted-foreground text-sm">At least 8 characters.</p>
        ) : null}
      </div>

      {state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}

      {state.notice ? (
        <p role="status" className="text-sm">
          {state.notice}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? copy.pending : copy.submit}
      </Button>

      {mode === "signin" ? (
        <p className="text-center text-sm">
          <Link href="/forgot-password" className="underline underline-offset-4">
            Forgot your password?
          </Link>
        </p>
      ) : null}

      <p className="text-muted-foreground text-center text-sm">
        {copy.switchText}{" "}
        <Link href={copy.switchHref} className="underline underline-offset-4">
          {copy.switchLabel}
        </Link>
      </p>
    </form>
  );
}
