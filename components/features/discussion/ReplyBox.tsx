"use client";

import { IconCornerDownRight } from "@tabler/icons-react";
import { useState } from "react";

import { CommentForm } from "@/components/features/discussion/CommentForm";
import type { CommentTarget } from "@/lib/queries/comments";

/**
 * A Reply button that opens one reply box (VIB-199).
 *
 * A `<details>` would do this without JavaScript, but it cannot autofocus the
 * textarea it reveals, and a reply box you have to go and click into is a
 * reply box people abandon. With JavaScript off the thread still renders and
 * a reader can comment through the main form — the reply *affordance* is the
 * only thing lost.
 */
export function ReplyBox({
  target,
  returnTo,
  parentId,
}: {
  target: CommentTarget;
  returnTo: string;
  parentId: string;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm transition-colors"
      >
        <IconCornerDownRight aria-hidden className="size-4" />
        Reply
      </button>
    );
  }

  return (
    <div className="mt-2 w-full">
      <CommentForm
        target={target}
        returnTo={returnTo}
        parentId={parentId}
        placeholder="Write a reply..."
        autoFocus
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-muted-foreground hover:text-foreground mt-2 text-sm"
      >
        Cancel
      </button>
    </div>
  );
}
