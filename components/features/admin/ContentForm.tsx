"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import type { ContentFormState } from "@/app/(site)/admin/content/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contentTypeLabel, CONTENT_PILLARS, CONTENT_TYPES } from "@/lib/learn";
import type { Content } from "@/lib/queries/content";
import { dateLabel } from "@/lib/whats-new";

type Props = {
  /** Null when creating. Its presence is what makes this an edit form. */
  content: Content | null;
  action: (
    state: ContentFormState,
    formData: FormData,
  ) => Promise<ContentFormState>;
};

const ROLE_LEVELS = [
  { value: "", label: "Everyone" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
] as const;

const AUDIENCES = [
  { value: "", label: "None — not a role guide" },
  { value: "enduser", label: "End user" },
  { value: "author", label: "Author" },
  { value: "admin", label: "Admin" },
  { value: "seller", label: "Seller" },
] as const;

/** Native selects, same as ProfileForm: keyboard and screen-reader behaviour for free. */
const selectClass =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-3";

export function ContentForm({ content, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  /*
   * Follows the select rather than the saved row, so switching the type to
   * Announcement updates the hint before saving rather than after.
   */
  const [type, setType] = useState<string>(content?.type ?? "article");
  const urlPrefix = type === "announcement" ? "/blog" : "/learn";

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={content?.title ?? ""}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={content?.slug ?? ""}
          required
        />
        <p className="text-muted-foreground text-sm">
          The URL:{" "}
          <code>
            {urlPrefix}/{content?.slug ?? "your-slug"}
          </code>{" "}
          — announcements live under <code>/blog</code>, everything else under{" "}
          <code>/learn</code>. Changing a slug breaks existing links.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            defaultValue={content?.type ?? "article"}
            onChange={(event) => setType(event.target.value)}
            className={selectClass}
          >
            {CONTENT_TYPES.map((value) => (
              <option key={value} value={value}>
                {contentTypeLabel(value)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={content?.status ?? "draft"}
            className={selectClass}
          >
            <option value="draft">Draft — staff only</option>
            <option value="published">Published — publicly readable</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pillar">Pillar</Label>
          <select
            id="pillar"
            name="pillar"
            defaultValue={content?.pillar ?? ""}
            className={selectClass}
          >
            <option value="">Unfiled</option>
            {CONTENT_PILLARS.map((pillar) => (
              <option key={pillar.value} value={pillar.value}>
                {pillar.label}
              </option>
            ))}
          </select>
          <p className="text-muted-foreground text-sm">
            The Learn hub&rsquo;s six sections. Help articles stay unfiled.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role_level">Experience level</Label>
          <select
            id="role_level"
            name="role_level"
            defaultValue={content?.role_level ?? ""}
            className={selectClass}
          >
            {ROLE_LEVELS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="audience">Audience</Label>
          <select
            id="audience"
            name="audience"
            defaultValue={content?.audience ?? ""}
            className={selectClass}
          >
            {AUDIENCES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Body</Label>
        <textarea
          id="body"
          name="body"
          defaultValue={content?.body ?? ""}
          rows={20}
          className={`${selectClass} h-auto font-mono leading-relaxed`}
        />
        <p className="text-muted-foreground text-sm">
          Plain text, rendered as written by the page this appears on.
        </p>
      </div>

      {/* Create has nothing to announce: ticking it would stamp revised_at on a brand-new row. */}
      {content ? (
        <>
          {/*
           * Unticked on every load, even when `revised_at` is already set: ticking
           * means "announce this edit, now", not "this row was revised before".
           */}
          <div className="flex items-start gap-3">
            <input
              id="announce_revision"
              name="announce_revision"
              type="checkbox"
              className="border-input mt-0.5 size-4 rounded border"
            />
            <div className="space-y-1">
              <Label htmlFor="announce_revision">Announce this change</Label>
              <p className="text-muted-foreground text-sm">
                Puts it in What&rsquo;s new, dated today. Leave unticked for a
                typo, a tag change or anything a reader would not care about.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="revision_note">What changed</Label>
            <Input
              id="revision_note"
              name="revision_note"
              defaultValue=""
              placeholder="Added Opus 5.5 pricing"
            />
            <p className="text-muted-foreground text-sm">
              Used only when Announce this change is ticked.
            </p>
          </div>

          {/*
           * Only when there is something to take back (VIB-232). Its own
           * control, not an unticked announce box: unticking means "this edit
           * is not worth announcing" and must leave an earlier announcement
           * alone, which is why the two cannot be the same checkbox.
           */}
          {content.revised_at ? (
            <div className="flex items-start gap-3">
              <input
                id="clear_announcement"
                name="clear_announcement"
                type="checkbox"
                className="border-input mt-0.5 size-4 rounded border"
              />
              <div className="space-y-1">
                <Label htmlFor="clear_announcement">
                  Clear the announcement
                </Label>
                <p className="text-muted-foreground text-sm">
                  Takes it out of What&rsquo;s new. Announced{" "}
                  {dateLabel(content.revised_at)}: &ldquo;{content.revision_note}
                  &rdquo;.
                </p>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="pill" size="pill-sm" disabled={pending}>
          {pending ? "Saving…" : content ? "Save changes" : "Create article"}
        </Button>
        <Link
          href="/admin/content"
          className={buttonVariants({ variant: "ghost" })}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
