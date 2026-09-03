"use client";

import { useActionState } from "react";

import { subscribeAction, type NewsletterFormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** The mockup's closing capture (screen 1). Rendered only when VIB-91's flag is on. */
export function NewsletterForm() {
  const [state, formAction, pending] = useActionState<NewsletterFormState, FormData>(
    subscribeAction,
    {},
  );

  return (
    <form action={formAction} className="mx-auto mt-6 max-w-md">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 text-left">
          <Label htmlFor="newsletter-email" className="sr-only">
            Email address
          </Label>
          <Input
            id="newsletter-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Subscribing…" : "Subscribe"}
        </Button>
      </div>

      {/*
        Honeypot. Hidden from sight and from screen readers, and skipped by
        tab order, so only a form-filling bot ever puts anything in it.
        aria-hidden + tabIndex rather than display:none, which some bots check.
      */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.error ? (
        <p role="alert" className="text-destructive mt-3 text-sm">
          {state.error}
        </p>
      ) : null}

      {state.notice ? (
        <p role="status" className="mt-3 text-sm">
          {state.notice}
        </p>
      ) : null}

      <p className="text-muted-foreground mt-3 text-sm">
        One email a week. Unsubscribe any time — every email carries the link.
      </p>
    </form>
  );
}
