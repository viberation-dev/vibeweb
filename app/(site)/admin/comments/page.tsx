import type { Metadata } from "next";

import { moderateCommentAction } from "@/app/(site)/discussion-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/integrations/supabase/server";
import { listCommentsForModeration } from "@/lib/queries/comments";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "Comments" };

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

/**
 * The moderation queue (VIB-199).
 *
 * Newest first, hidden ones included and marked — a moderation screen that
 * hides what was hidden is a screen you cannot undo anything from.
 *
 * Hiding is reversible and leaves the row in place, so a mistake here costs
 * one click to fix. There is deliberately no delete: a comment removed by
 * staff with no record is the thing an accusation of censorship has no answer
 * to. Authors can delete their own.
 */
export default async function AdminCommentsPage() {
  await requireStaff("/admin/comments");

  const supabase = await createClient();
  const comments = await listCommentsForModeration(supabase);
  const hidden = comments.filter((comment) => comment.hiddenAt !== null).length;

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-[clamp(1.25rem,4vw,2.5rem)] py-10">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-[-0.04em]">
          Comments
        </h1>
        <p className="text-muted-foreground text-sm">
          The {comments.length} most recent, {hidden} hidden. Hiding keeps the
          comment and its replies — it only stops readers seeing it.
        </p>
      </div>

      {comments.length === 0 ? (
        <p className="text-muted-foreground">Nobody has commented yet.</p>
      ) : (
        <ul className="bg-secondary divide-border/60 divide-y overflow-hidden rounded-[1.125rem]">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="flex items-start justify-between gap-4 p-5"
            >
              <div className="min-w-0">
                <p className="font-heading font-bold tracking-tight">
                  {comment.authorName}
                  {comment.hiddenAt ? (
                    <Badge variant="secondary" className="ml-2.5">
                      Hidden
                    </Badge>
                  ) : null}
                </p>
                <p className="mt-1 text-sm whitespace-pre-line">{comment.body}</p>
                <p className="text-muted-foreground mt-1.5 text-xs">
                  <time dateTime={comment.createdAt}>
                    {dateFormat.format(new Date(comment.createdAt))}
                  </time>
                  {" · "}
                  {comment.targetType}
                </p>
              </div>

              <form action={moderateCommentAction} className="shrink-0">
                <input type="hidden" name="comment_id" value={comment.id} />
                <input type="hidden" name="return_to" value="/admin/comments" />
                <input
                  type="hidden"
                  name="intent"
                  value={comment.hiddenAt ? "restore" : "hide"}
                />
                <Button
                  type="submit"
                  size="sm"
                  variant={comment.hiddenAt ? "secondary" : "outline"}
                >
                  {comment.hiddenAt ? "Restore" : "Hide"}
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
