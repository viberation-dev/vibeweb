import Link from "next/link";

/**
 * Thin bar above the header (VIB-99) — contact and support on the left,
 * publication links on the right. Wraps to two rows below 760px.
 *
 * ⚠️ Blog, Docs, Changelog and Get support have **no routes in this app**,
 * and `hello@viberation.dev` is not the address on record (§20 lists
 * viberation.dev@gmail.com). Ali chose to ship the bar with v3's links
 * as-is after this was flagged — see the VIB-98 PR. They are `#` anchors,
 * not Next routes, so nothing 404s, but they also go nowhere. Replace each
 * with a real destination as it lands.
 */
const PUBLICATIONS = [
  { label: "Blog", href: "#" },
  { label: "Docs", href: "#" },
  { label: "Changelog", href: "#" },
] as const;

export function UtilityBar() {
  return (
    <div className="bg-secondary text-muted-foreground border-b text-[0.8rem]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1.5 px-6 py-2">
        <span>
          Questions?{" "}
          <a
            href="mailto:hello@viberation.dev"
            className="text-foreground font-semibold hover:underline"
          >
            hello@viberation.dev
          </a>
        </span>
        <Separator />
        <Link href="#" className="hover:text-foreground">
          Get support
        </Link>

        <span className="ml-auto flex items-center gap-x-3">
          {PUBLICATIONS.map((item, i) => (
            <span key={item.label} className="flex items-center gap-x-3">
              {i > 0 ? <Separator /> : null}
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

function Separator() {
  return <span aria-hidden className="bg-muted-foreground/30 h-3 w-px" />;
}
