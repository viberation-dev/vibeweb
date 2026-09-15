"use client";

import Link from "next/link";
import { useActionState } from "react";

import { IconMailCheck } from "@tabler/icons-react";

import { resendConfirmationAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";

/**
 * What signup shows once the confirmation email is on its way (VIB-152).
 *
 * Modelled on Netlify's screen: say plainly that it worked, name the address
 * so a typo is visible, and say what happens next. The link signs you in and
 * lands on onboarding, so "sign in" here is the fallback, not the next step.
 */
export function CheckEmail({ email }: { email: string }) {
  const [state, resend, pending] = useActionState(resendConfirmationAction, {});

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
        We sent a confirmation link to{" "}
        <span className="text-foreground font-semibold break-all">{email}</span>.
        Click it to activate your account. It signs you in and takes you to a
        short setup.
      </p>

      <p className="text-muted-foreground mt-3 text-sm">
        Nothing after a few minutes? Check your spam folder, or send it again.
      </p>

      <form action={resend} className="mt-6">
        <input type="hidden" name="email" value={email} />
        <Button type="submit" variant="pill-soft" size="pill-sm" disabled={pending}>
          {pending ? "Sending…" : "Resend the link"}
        </Button>
      </form>

      {state.error ? (
        <p role="alert" className="text-destructive mt-3 text-sm">
          {state.error}
        </p>
      ) : null}
      {state.notice ? <p className="mt-3 text-sm">{state.notice}</p> : null}

      <p className="text-muted-foreground mt-8 text-sm">
        Already confirmed?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
        {" · "}
        <a href="/signup" className="text-primary hover:underline">
          Use a different email
        </a>
      </p>
    </div>
  );
}
