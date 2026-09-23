import { IconHeart, IconTrash } from "@tabler/icons-react";
import Link from "next/link";

import {
  deleteCommentAction,
  toggleCommentAppreciationAction,
} from "@/app/(site)/discussion-actions";
import { CommentForm } from "@/components/features/discussion/CommentForm";
import { ReplyBox } from "@/components/features/discussion/ReplyBox";
import { countCommentNodes, type CommentNode } from "@/lib/comment-tree";
import type { CommentTarget } from "@/lib/queries/comments";
import { cn } from "@/lib/utils";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * The discussion under an article or a walkthrough (VIB-199).
 *
 * Server-rendered, with every control a form posting to a Server Action, so
 * the thread is in the HTML: it is readable with JavaScript off, and it is
 * there for a crawler, which is most of the reason to have comments on a
 * guide at all.
 */
export function CommentThread({
  target,
  returnTo,
  comments,
  signedIn,
}: {
  target: CommentTarget;
  returnTo: string;
  comments: CommentNode[];
  signedIn: boolean;
}) {
  const total = countCommentNodes(comments);

  return (
    <section id="comments" className="article-measure mt-14 scroll-mt-24">
      <h2 className="font-heading border-border border-t pt-8 text-2xl font-bold">
        {total === 0 ? "Comments" : `Comments (${total})`}
      </h2>

      {signedIn ? (
        <div className="mt-5">
          <CommentForm target={target} returnTo={returnTo} />
        </div>
      ) : (
        <p className="text-muted-foreground mt-3">
          <Link
            href={`/login?redirectTo=${encodeURIComponent(returnTo)}`}
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </Link>{" "}
          to join the discussion.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-muted-foreground mt-8">
          Nothing here yet. If something in this piece worked, or did not, say so.
        </p>
      ) : (
        <ol className="mt-8">
          {comments.map((comment) => (
            <li key={comment.id} className="border-border border-t py-5">
              <Comment
                comment={comment}
                target={target}
                returnTo={returnTo}
                signedIn={signedIn}
              />
              {comment.replies.length ? (
                <ol className="border-border mt-4 ml-5 border-l-2 pl-4">
                  {comment.replies.map((reply) => (
                    <li key={reply.id} className="py-3">
                      <Comment
                        comment={reply}
                        target={target}
                        returnTo={returnTo}
                        signedIn={signedIn}
                        isReply
                      />
                    </li>
                  ))}
                </ol>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Comment({
  comment,
  target,
  returnTo,
  signedIn,
  isReply,
}: {
  comment: CommentNode;
  target: CommentTarget;
  returnTo: string;
  signedIn: boolean;
  isReply?: boolean;
}) {
  return (
    <article className="flex gap-3.5">
      <span
        aria-hidden
        className="bg-secondary font-heading mt-1 flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
      >
        {comment.author.initials}
      </span>

      <div className="min-w-0 flex-1">
        <p>
          <span className="font-semibold">{comment.author.name}</span>
          <time
            dateTime={comment.createdAt}
            className="text-muted-foreground ml-2.5 text-sm"
          >
            {dateFormat.format(new Date(comment.createdAt))}
          </time>
        </p>

        {/*
          whitespace-pre-line, not a Markdown parser: an author's paragraph
          breaks survive and nothing a commenter types becomes HTML. The same
          call the guide bodies make, and it matters more here — this is text
          from the public.
        */}
        <p className="mt-1.5 leading-relaxed whitespace-pre-line">{comment.body}</p>

        <div className="mt-2 flex flex-wrap items-center gap-1">
          <form action={toggleCommentAppreciationAction}>
            <input type="hidden" name="comment_id" value={comment.id} />
            <input type="hidden" name="return_to" value={returnTo} />
            <input
              type="hidden"
              name="intent"
              value={comment.mine ? "remove" : "add"}
            />
            <button
              type="submit"
              aria-pressed={comment.mine}
              className={cn(
                "hover:bg-secondary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm transition-colors",
                comment.mine
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <IconHeart
                aria-hidden
                className={cn("size-4", comment.mine && "fill-current")}
              />
              {comment.appreciations}
              <span className="sr-only">
                {comment.mine ? "Remove your appreciation" : "Appreciate this comment"}
              </span>
            </button>
          </form>

          {/*
            Replies only hang off a top-level comment — the schema allows one
            level and the trigger enforces it, so offering Reply on a reply
            would be a button that fails.
          */}
          {signedIn && !isReply ? (
            <ReplyBox target={target} returnTo={returnTo} parentId={comment.id} />
          ) : null}

          {comment.isAuthor ? (
            <form action={deleteCommentAction}>
              <input type="hidden" name="comment_id" value={comment.id} />
              <input type="hidden" name="return_to" value={returnTo} />
              <button
                type="submit"
                className="text-muted-foreground hover:bg-secondary hover:text-destructive inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm transition-colors"
              >
                <IconTrash aria-hidden className="size-4" />
                Delete
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </article>
  );
}
