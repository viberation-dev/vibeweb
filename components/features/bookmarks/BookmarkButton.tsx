import { IconBookmark } from "@tabler/icons-react";

import { toggleBookmarkAction } from "@/app/(site)/account/bookmarks/actions";
import { Button } from "@/components/ui/button";
import type { BookmarkTarget } from "@/lib/queries/bookmarks";

type Props = BookmarkTarget & {
  /** Whether it is bookmarked right now — decides which way the toggle flips. */
  bookmarked: boolean;
  /** Path to come back to after a signed-out visitor logs in. */
  returnTo: string;
};

/**
 * Save / unsave one item.
 *
 * A plain form posting to a Server Action, not a client component: it works
 * without JavaScript, ships no client bundle, and the pages it sits on stay
 * Server Components. Signed-out visitors get bounced to /login and land back
 * here — clicking it is how a lot of people discover accounts exist.
 */
export function BookmarkButton({ targetType, targetId, bookmarked, returnTo }: Props) {
  return (
    <form action={toggleBookmarkAction}>
      <input type="hidden" name="target_type" value={targetType} />
      <input type="hidden" name="target_id" value={targetId} />
      <input type="hidden" name="return_to" value={returnTo} />
      <input type="hidden" name="intent" value={bookmarked ? "remove" : "add"} />
      <Button type="submit" variant={bookmarked ? "secondary" : "outline"}>
        <IconBookmark aria-hidden className={bookmarked ? "fill-current" : undefined} />
        {bookmarked ? "Saved" : "Save"}
      </Button>
    </form>
  );
}
