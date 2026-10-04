"use client";

import { IconArrowUpRight } from "@tabler/icons-react";
import { useActionState } from "react";

import {
  submitFeedbackAction,
  type FeedbackFormState,
} from "@/app/(site)/feedback/actions";
import { ButtonIcon, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KIND_LABELS } from "@/lib/emails/feedback";
import { FEEDBACK_KINDS } from "@/lib/validation/feedback";

/** Native select and textarea, same as ContentForm: keyboard and screen-reader behaviour for free. */
const fieldClass =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-3";

export function FeedbackForm() {
  const [state, formAction, pending] = useActionState<FeedbackFormState, FormData>(
    submitFeedbackAction,
    {},
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="kind">What kind of feedback is this?</Label>
        <select id="kind" name="kind" required defaultValue="" className={fieldClass}>
          <option value="" disabled>
            Pick one
          </option>
          {FEEDBACK_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {KIND_LABELS[kind]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Your feedback</Label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={8}
          placeholder="What would you change, add, or fix?"
          className={`${fieldClass} leading-relaxed`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Your email</Label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={fieldClass}
        />
        <p className="text-muted-foreground text-sm">
          Optional, and only used to reply to you. Leave it blank to stay anonymous.
        </p>
      </div>

      {/*
        Honeypot, identical to NewsletterForm's. Hidden from sight and from
        screen readers, and skipped by tab order, so only a form-filling bot
        ever puts anything in it. aria-hidden + tabIndex rather than
        display:none, which some bots check.
      */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className={buttonVariants({ variant: "pill", size: "pill" })}
      >
        <ButtonIcon>
          <IconArrowUpRight />
        </ButtonIcon>
        {pending ? "Sending…" : "Send it"}
      </button>

      {state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}

      {state.notice ? (
        <p role="status" className="text-sm font-semibold">
          {state.notice}
        </p>
      ) : null}
    </form>
  );
}
