"use client";

import { IconSend } from "@tabler/icons-react";
import { useRef, useState } from "react";

import { addCommentAction } from "@/app/(site)/discussion-actions";
import { Button } from "@/components/ui/button";
import type { CommentTarget } from "@/lib/queries/comments";

const MAX = 4000;

/**
 * The box you type a comment into (VIB-199).
 *
 * A client component only for the character counter and for clearing itself
 * after a successful post. The form still posts to the Server Action, so it
 * works with JavaScript off — you just lose the counter.
 *
 * Validation here is UX. `commentSchema` on the server is the control, and
 * the check constraint on `comments.body` is the backstop.
 */
export function CommentForm({
  target,
  returnTo,
  parentId,
  placeholder = "Ask a question or share what worked...",
  autoFocus,
}: {
  target: CommentTarget;
  returnTo: string;
  /** Set on a reply box. Absent means a new top-level comment. */
  parentId?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [length, setLength] = useState(0);
  const form = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={form}
      action={async (formData) => {
        await addCommentAction(formData);
        form.current?.reset();
        setLength(0);
      }}
      className="grid gap-2.5"
    >
      <input type="hidden" name="target_type" value={target.targetType} />
      <input type="hidden" name="target_id" value={target.targetId} />
      <input type="hidden" name="return_to" value={returnTo} />
      {parentId ? <input type="hidden" name="parent_id" value={parentId} /> : null}

      <textarea
        name="body"
        rows={parentId ? 2 : 3}
        required
        maxLength={MAX}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(event) => setLength(event.target.value.length)}
        className="border-border bg-card focus-visible:ring-ring w-full rounded-xl border p-3.5 text-base focus-visible:ring-3 focus-visible:outline-none"
      />

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm">
          <IconSend aria-hidden />
          {parentId ? "Reply" : "Post comment"}
        </Button>
        {/*
          Only once it is worth knowing. A counter sitting at 0 / 4000 under
          an empty box tells the reader the limit is the point of the field.
        */}
        {length > MAX * 0.8 ? (
          <span className="text-muted-foreground text-sm">
            {MAX - length} characters left
          </span>
        ) : null}
      </div>
    </form>
  );
}
