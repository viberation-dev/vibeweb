"use client";

import Link from "next/link";
import { useActionState } from "react";

import { IconArrowUpRight } from "@tabler/icons-react";

import { CheckEmail } from "@/components/features/auth/CheckEmail";

import { Button, ButtonIcon } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthFormState } from "@/app/(auth)/actions";

type Props = {
  mode: "signin" | "signup";
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  redirectTo?: string;
  /** Above the form. Hidden with the rest once signup has sent its email. */
  heading?: React.ReactNode;
  /** Below the form (providers, the sign-in link). Hidden the same way. */
  children?: React.ReactNode;
};

const COPY = {
  signin: {
    submit: "Sign in",
    pending: "Signing in…",
    autoComplete: "current-password",
  },
  signup: {
    submit: "Create account",
    pending: "Creating account…",
    autoComplete: "new-password",
  },
} as const;

export function AuthForm({
  mode,
  action,
  redirectTo,
  heading,
  children,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const copy = COPY[mode];

  /*
   * Signup succeeded: swap the whole card for the check-your-email screen
   * (VIB-152). A one-line notice above a still-filled form read as nothing
   * having happened, and invited pressing the button again.
   */
  if (state.sentTo) {
    return <CheckEmail email={state.sentTo} />;
  }

  return (
    <>
      {heading}
      <div className="space-y-6">
        <form action={formAction} className="space-y-4">
          {redirectTo ? (
            <input type="hidden" name="redirectTo" value={redirectTo} />
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
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
              <p className="text-muted-foreground text-sm">
                At least 8 characters.
              </p>
            ) : (
              /* Sits with the password field it belongs to, right-aligned, as in
             the mockup — not stranded under the submit button. */
              <p className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-primary text-sm hover:underline"
                >
                  Forgot?
                </Link>
              </p>
            )}
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

          {/* The pill CTA, as on the marketing pages: same shape, same badge. */}
          <Button
            type="submit"
            variant="pill"
            size="pill"
            className="w-full"
            disabled={pending}
          >
            <ButtonIcon>
              <IconArrowUpRight />
            </ButtonIcon>
            {pending ? copy.pending : copy.submit}
          </Button>
        </form>
        {children}
      </div>
    </>
  );
}
