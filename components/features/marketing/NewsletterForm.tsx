"use client";

import { IconArrowUpRight } from "@tabler/icons-react";
import { useActionState } from "react";

import { subscribeAction, type NewsletterFormState } from "@/app/(site)/actions";
import { ButtonIcon, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/** The mockup's closing capture (screen 1). Rendered only when VIB-91's flag is on. */
export function NewsletterForm() {
  const [state, formAction, pending] = useActionState<NewsletterFormState, FormData>(
    subscribeAction,
    {},
  );

  return (
    <form action={formAction} className="mx-auto mt-8 max-w-2xl">
      {/*
        v3's pill field: 56px tall to match the pill button beside it, so the
        pair reads as one control rather than two stacked shapes.
      */}
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <div className="text-left sm:min-w-[340px]">
          <Label htmlFor="newsletter-email" className="sr-only">
            Email address
          </Label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            className="border-input bg-card placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-14 w-full rounded-full border px-6 text-[0.9375rem] outline-none focus-visible:ring-3"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className={buttonVariants({ variant: "pill", size: "pill" })}
        >
          <ButtonIcon>
            <IconArrowUpRight />
          </ButtonIcon>
          {pending ? "Subscribing…" : "Subscribe"}
        </button>
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

      {/*
        One line, not two sentences stacked: the promise and the escape hatch
        belong together, and "no account required" already sits below in the
        section itself.
      */}
      <p className="text-muted-foreground mt-5 text-sm">
        One email a week · Unsubscribe any time, every email carries the link
      </p>
    </form>
  );
}
