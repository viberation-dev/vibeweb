"use client";

import Link from "next/link";
import { useActionState } from "react";

import { IconMailCheck } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthFormState } from "@/app/(auth)/actions";

type Props = {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  /** Above the form. Hidden with the rest once the link is sent, as on signup. */
  heading?: React.ReactNode;
};

export function ForgotPasswordForm({ action, heading }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  /*
   * Sent: swap the card for a check-your-email screen, as signup does
   * (VIB-152, VIB-168). The wording stays conditional on purpose, so the page
   * never says whether the address has an account.
   */
  if (state.sentTo) {
    return (
      <div className="text-center" role="status">
        <div className="flex justify-center">
          <IconTile>
            <IconMailCheck className="size-5" aria-hidden />
          </IconTile>
        </div>

        <h1 className="font-heading mt-5 text-3xl font-bold tracking-[-0.04em]">
          Check your email
        </h1>

        <p className="text-muted-foreground mt-3">
          If <span className="text-foreground font-semibold break-all">{state.sentTo}</span>{" "}
          has an account, we sent it a link to set a new password.
        </p>

        <p className="text-muted-foreground mt-3 text-sm">
          Nothing after a few minutes? Check your spam folder, or send it again.
        </p>

        <form action={formAction} className="mt-6">
          <input type="hidden" name="email" value={state.sentTo} />
          <Button type="submit" variant="pill-soft" size="pill-sm" disabled={pending}>
            {pending ? "Sending…" : "Resend the link"}
          </Button>
        </form>

        <p className="text-muted-foreground mt-8 text-sm">
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
          {" · "}
          <a href="/forgot-password" className="text-primary hover:underline">
            Use a different email
          </a>
        </p>
      </div>
    );
  }

  return (
    <>
      {heading}
      <div className="space-y-6">
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>

          {state.error ? (
            <p role="alert" className="text-destructive text-sm">
              {state.error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </Button>
        </form>

        <p className="text-muted-foreground text-center text-sm">
          Remembered it?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
