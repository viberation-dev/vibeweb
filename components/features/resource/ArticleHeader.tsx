import { IconClock, IconEye, IconMessageCircle } from "@tabler/icons-react";
import type { ReactNode } from "react";

import { SITE_BYLINE } from "@/lib/byline";
import { preferredSourceUrl } from "@/lib/share";
import { siteUrl } from "@/lib/site-url";

/**
 * The hero every long-form page opens with (VIB-198, re-laid out in VIB-200).
 *
 * One component for /learn, /blog and /docs: they are three views over the
 * same `content` table, and three hand-built headers would be three places
 * to forget the updated date.
 *
 * Left-aligned, not centred. A centred headline over a left-aligned body
 * gives the page two different left edges, and the eye has to find the
 * second one at the moment it starts reading. Prototype A had this right.
 */
export type ArticleHeaderProps = {
  /** Small pill above the title — the pillar, or the content type. */
  kicker: string;
  title: string;
  /** One-line standfirst. The card preview, where a piece has no lede. */
  lede?: string | null;
  /** Defaults to the site byline — `content` has no author column yet. */
  author?: { name: string; initials: string; bio?: string };
  publishedAt: string;
  /** Only shown when it is a real revision, not the row's creation write. */
  updatedAt?: string | null;
  readingTime: string;
  viewCount?: number | null;
  /** Links to the thread when there is one. Absent where comments are off. */
  commentCount?: number | null;
  /** Rendered after the stats — difficulty, audience, tags. */
  badges?: ReactNode;
};

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** The site's bare domain, which is what Google's preferences page expects. */
function siteDomain(): string {
  try {
    return new URL(siteUrl).hostname;
  } catch {
    return "viberation.dev";
  }
}

/**
 * Whether the row has genuinely been revised since it was written.
 *
 * Every insert sets `updated_at` to the same instant as `created_at`, so a
 * naive check prints "Updated" on a piece that has never been touched. A
 * minute of slack covers a migration that writes the body and the tags in
 * two statements.
 */
function isRevised(publishedAt: string, updatedAt: string | null | undefined): boolean {
  if (!updatedAt) return false;
  return new Date(updatedAt).getTime() - new Date(publishedAt).getTime() > 60_000;
}

export function ArticleHeader({
  kicker,
  title,
  lede,
  author = SITE_BYLINE,
  publishedAt,
  updatedAt,
  readingTime,
  viewCount,
  commentCount,
  badges,
}: ArticleHeaderProps) {
  const revised = isRevised(publishedAt, updatedAt);

  return (
    <header className="pt-8">
      <span className="bg-highlight text-highlight-foreground inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-bold tracking-widest uppercase">
        {kicker}
      </span>

      {/*
        The headline is capped at 20 characters' worth of line even though
        the column is now much wider (VIB-200 item 8). A 1200px headline is
        one the eye has to track across rather than take in.
      */}
      <h1 className="font-heading mt-5 max-w-[22ch] text-4xl leading-[1.08] font-extrabold tracking-[-0.035em] lg:text-5xl">
        {title}
      </h1>

      {lede ? (
        <p className="text-muted-foreground mt-5 max-w-[62ch] text-lg leading-relaxed lg:text-xl">
          {lede}
        </p>
      ) : null}

      <div className="mt-7 flex items-center gap-3">
        <span
          aria-hidden
          className="bg-primary text-primary-foreground font-heading flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
        >
          {author.initials}
        </span>
        <span>
          <span className="block text-base leading-tight font-semibold">
            {author.name}
          </span>
          <span className="text-muted-foreground block text-sm">
            <time dateTime={publishedAt}>
              Published {dateFormat.format(new Date(publishedAt))}
            </time>
            {revised ? (
              <>
                {" · "}
                <time dateTime={updatedAt!}>
                  Updated {dateFormat.format(new Date(updatedAt!))}
                </time>
              </>
            ) : null}
          </span>
        </span>
      </div>

      {/*
        Stats left, Google's button pushed to the far edge of the column
        (VIB-200 items 3 and 6). One row rather than two: they are both
        "facts and actions about this piece", and the button has nothing to
        sit beside on a line of its own.
      */}
      <div className="text-muted-foreground mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-[0.9375rem]">
        <span className="inline-flex items-center gap-1.5">
          <IconClock aria-hidden className="size-[1.0625rem]" />
          {readingTime}
        </span>
        {/*
          Only once a piece has actually been read. "0 views" on a guide
          published this morning is a fact nobody needed and reads as
          neglect — the counter earns its place after it has something to say.
        */}
        {viewCount && viewCount > 0 ? (
          <span className="inline-flex items-center gap-1.5">
            <IconEye aria-hidden className="size-[1.0625rem]" />
            <span className="text-foreground font-semibold">
              {viewCount.toLocaleString("en-GB")}
            </span>{" "}
            views
          </span>
        ) : null}
        {commentCount !== null && commentCount !== undefined ? (
          <a
            href="#comments"
            className="hover:text-foreground inline-flex items-center gap-1.5"
          >
            <IconMessageCircle aria-hidden className="size-[1.0625rem]" />
            <span className="text-foreground font-semibold">{commentCount}</span>{" "}
            {commentCount === 1 ? "comment" : "comments"}
          </a>
        ) : null}
      </div>

      {/*
        The pills and Google's button share a row, bottoms aligned
        (VIB-202). The button was on the stats line above, which left it
        floating over a row of small grey text with nothing to line up
        against; against the pills it has an edge to sit on.

        `items-end` rather than `items-center`: the two are different
        heights, and it is the bottoms that read as a line.

        The pills also need room on three sides, not just above (VIB-201):
        at 20px tall with 8px of padding they read as a caption glued to the
        line above rather than as something you can click. `size="lg"` on
        the badges does the inside; the gaps here do the outside.
      */}
      <div className="mt-7 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="flex flex-wrap items-center gap-2.5">{badges}</div>
        {/*
          Google's own preferences page. It opts the reader into seeing more
          of this site in Top Stories; it is a link to Google, not a claim
          that we are already a preferred source.
        */}
        <a
          href={preferredSourceUrl(siteDomain())}
          target="_blank"
          rel="noopener noreferrer"
          className="border-border bg-card hover:border-primary inline-flex items-center gap-2 rounded-full border py-1.5 pr-4 pl-2 text-sm font-medium transition-colors"
        >
          <span
            aria-hidden
            className="border-border font-heading flex size-6 items-center justify-center rounded-full border bg-white text-sm font-bold text-[#4285F4]"
          >
            G
          </span>
          Add as preferred source on Google
        </a>
      </div>

      <hr className="border-border mt-10" />
    </header>
  );
}
