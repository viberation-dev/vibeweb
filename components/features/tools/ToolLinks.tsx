import Link from "next/link";

import { CategoryIcon } from "@/components/features/tools/CategoryIcon";
import { groupByCategory, sortLinks, type ToolLink } from "@/lib/tool-links";

/**
 * "Works with" sections on a tool page (VIB-109): the vendor's own apps,
 * third-party apps that run it, what pairs with it (grouped by category), and
 * — from the other end — what links here. Sections with nothing in them are
 * not rendered, and neither is the component when every one is empty.
 *
 * Chips rather than cards: a model can carry thirty links, and a wall of
 * cards would push Key info off the page.
 */
export function ToolLinks({
  outgoing,
  incoming,
}: {
  outgoing: readonly ToolLink[];
  incoming: readonly ToolLink[];
}) {
  const official = sortLinks(outgoing.filter((link) => link.kind === "official"));
  const runsIn = sortLinks(outgoing.filter((link) => link.kind === "runs_in"));
  const pairs = groupByCategory(outgoing.filter((link) => link.kind === "pairs_with"));
  const worksWith = sortLinks(incoming);

  return (
    <>
      {official.length ? (
        <Section title="Official apps">
          <LinkList links={official} />
        </Section>
      ) : null}
      {runsIn.length ? (
        <Section title="Use it in">
          <LinkList links={runsIn} />
        </Section>
      ) : null}
      {pairs.length ? (
        <Section title="Pairs well with">
          {pairs.map((group) => (
            <div key={group.category} className="mt-3">
              <h3 className="text-muted-foreground text-sm font-medium">{group.label}</h3>
              <LinkList links={group.links} />
            </div>
          ))}
        </Section>
      ) : null}
      {worksWith.length ? (
        <Section title="Works with">
          <LinkList links={worksWith} />
        </Section>
      ) : null}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-heading mt-8 text-lg font-medium">{title}</h2>
      {children}
    </section>
  );
}

function LinkList({ links }: { links: readonly ToolLink[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {links.map((link) => (
        <li key={link.tool.slug} className="max-w-full">
          <Link
            href={`/tools/${link.tool.slug}`}
            className="hover:bg-muted/60 inline-flex max-w-full items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors"
          >
            <CategoryIcon category={link.tool.category} className="text-primary size-4 shrink-0" />
            <span>{link.tool.name}</span>
            {link.note ? (
              <span className="text-muted-foreground text-xs">· {link.note}</span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
