import Link from "next/link";
import type { ReactNode } from "react";

import { ShareChips } from "@/components/features/resource/ShareChips";
import { SITE_BYLINE } from "@/lib/byline";

/**
 * Everything below the body of a long-form page (VIB-198).
 *
 * Share row, tags, save, and who wrote it — the same four in the same order
 * on /learn, /blog and /docs, because a reader who finishes a piece on one
 * of them should not have to re-learn where the share buttons went.
 *
 * The canonical URL comes from the page, not from `window.location`, so a
 * link shared out of a page reached with a `?ref=` query is still the clean
 * address of the piece.
 */
export function ArticleFooter({
  url,
  title,
  tags,
  action,
}: {
  url: string;
  title: string;
  tags?: { id: string; name: string; slug: string }[];
  /** The save control — a Server Action form, so it is passed in, not built here. */
  action?: ReactNode;
}) {
  return (
    <footer className="mt-12">
      {action ? (
        <div className="border-border flex flex-wrap items-center gap-3 border-t pt-7">
          {action}
        </div>
      ) : null}

      <div className="bg-secondary mt-6 flex flex-wrap items-center gap-2.5 rounded-[1.125rem] p-5">
        <span className="font-heading mr-1 font-bold">Share this</span>
        <ShareChips url={url} title={title} />
      </div>

      {tags?.length ? (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm">Tagged</span>
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="border-border bg-secondary hover:border-primary hover:text-primary rounded-full border px-3 py-1 text-sm font-medium transition-colors"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="bg-secondary mt-6 flex gap-4 rounded-[1.125rem] p-5">
        <span
          aria-hidden
          className="bg-primary text-primary-foreground font-heading flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
        >
          {SITE_BYLINE.initials}
        </span>
        <div>
          <p className="font-semibold">{SITE_BYLINE.name}</p>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            {SITE_BYLINE.bio}
          </p>
        </div>
      </div>
    </footer>
  );
}
