"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { ContentFormState } from "@/app/(site)/admin/content/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contentTypeLabel, CONTENT_TYPES } from "@/lib/learn";
import type { Content } from "@/lib/queries/content";

type Props = {
  /** Null when creating. Its presence is what makes this an edit form. */
  content: Content | null;
  action: (state: ContentFormState, formData: FormData) => Promise<ContentFormState>;
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

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={content?.title ?? ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={content?.slug ?? ""} required />
        <p className="text-muted-foreground text-sm">
          The URL: <code>/learn/{content?.slug ?? "your-slug"}</code>. Changing it breaks
          existing links.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            defaultValue={content?.type ?? "article"}
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
          Markdown, rendered by <code>/learn/[slug]</code>.
        </p>
      </div>

      {state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : content ? "Save changes" : "Create article"}
        </Button>
        <Link href="/admin/content" className={buttonVariants({ variant: "ghost" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
