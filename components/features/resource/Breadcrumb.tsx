import Link from "next/link";

/**
 * Where you are, and the way back up (VIB-200).
 *
 * Replaces the single "← All of Learn" link the article pages opened with.
 * That link answered "how do I go back" but not "where am I" — on a guide
 * reached from search, which is most of them, the reader arrives with no
 * sense of the section they landed in.
 *
 * The last crumb is the page itself: marked `aria-current` and not a link,
 * because a link to the page you are on is a control that does nothing.
 */
export type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="pt-6">
      <ol className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-sm">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-x-2">
              {item.href && !last ? (
                <Link href={item.href} className="hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={
                    last
                      ? "text-foreground decoration-primary font-semibold underline decoration-2 underline-offset-4"
                      : undefined
                  }
                >
                  {item.label}
                </span>
              )}
              {last ? null : <span aria-hidden>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
