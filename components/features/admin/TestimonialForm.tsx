"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { TestimonialFormState } from "@/app/(site)/admin/testimonials/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Testimonial } from "@/lib/queries/testimonials";

type Props = {
  /** Null when creating. Its presence is what makes this an edit form. */
  testimonial: Testimonial | null;
  action: (
    state: TestimonialFormState,
    formData: FormData,
  ) => Promise<TestimonialFormState>;
};

const ROLE_LEVELS = [
  { value: "", label: "Not tied to a level" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
] as const;

/** Native selects, same as ContentForm: keyboard and screen-reader behaviour for free. */
const selectClass =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-3";

/** `consent_at` is a timestamptz; the date input wants YYYY-MM-DD. */
function toDateInput(value: string | null): string {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toISOString().slice(0, 10);
}

export function TestimonialForm({ testimonial, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="quote">Quote</Label>
        <textarea
          id="quote"
          name="quote"
          defaultValue={testimonial?.quote ?? ""}
          rows={5}
          required
          className={`${selectClass} h-auto leading-relaxed`}
        />
        <p className="text-muted-foreground text-sm">
          Their words, not a paraphrase. The homepage adds the quote marks.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="author_name">Name</Label>
          <Input
            id="author_name"
            name="author_name"
            defaultValue={testimonial?.author_name ?? ""}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            defaultValue={testimonial?.location ?? ""}
            placeholder="Austin, TX"
          />
          <p className="text-muted-foreground text-sm">
            Optional. Leave it blank rather than guessing.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="initials">Initials</Label>
          <Input
            id="initials"
            name="initials"
            maxLength={2}
            defaultValue={testimonial?.initials ?? ""}
            placeholder="Auto"
          />
          <p className="text-muted-foreground text-sm">
            For the avatar. Blank derives them from the name — set it for names
            where that guesses wrong.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role_level">Speaking as</Label>
          <select
            id="role_level"
            name="role_level"
            defaultValue={testimonial?.role_level ?? ""}
            className={selectClass}
          >
            {ROLE_LEVELS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="source_url">Source</Label>
        <Input
          id="source_url"
          name="source_url"
          type="url"
          defaultValue={testimonial?.source_url ?? ""}
          placeholder="https://…"
        />
        <p className="text-muted-foreground text-sm">
          Where they said it — a post, an email thread, a call recording. Not
          shown to visitors; it is what makes this checkable in a year.
        </p>
      </div>

      {/*
        The field this table exists for. Required in the schema too, so a row
        cannot exist without it.
      */}
      <div className="border-border space-y-2 rounded-lg border p-4">
        <Label htmlFor="consent_at">Consent given on</Label>
        <Input
          id="consent_at"
          name="consent_at"
          type="date"
          defaultValue={toDateInput(testimonial?.consent_at ?? null)}
          required
          className="max-w-xs"
        />
        <p className="text-muted-foreground text-sm">
          When this person agreed to be quoted by name on the site. Required —
          this is a real person&rsquo;s words on a page that carries affiliate
          links, and &ldquo;did they agree?&rdquo; should not rest on memory.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sort_order">Order</Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            min={0}
            step={1}
            defaultValue={testimonial?.sort_order ?? 0}
            required
          />
          <p className="text-muted-foreground text-sm">
            Lowest first. The homepage shows the first three published.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="published">Visibility</Label>
          <label className="flex items-center gap-2 text-sm">
            <input
              id="published"
              name="published"
              type="checkbox"
              defaultChecked={testimonial?.published ?? false}
              className="size-4"
            />
            Published — publicly visible on the homepage
          </label>
          <p className="text-muted-foreground text-sm">
            Unpublished quotes are staff-only, by RLS as well as by this flag.
          </p>
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="pill" size="pill-sm" disabled={pending}>
          {pending
            ? "Saving…"
            : testimonial
              ? "Save changes"
              : "Add testimonial"}
        </Button>
        <Link
          href="/admin/testimonials"
          className={buttonVariants({ variant: "ghost" })}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
