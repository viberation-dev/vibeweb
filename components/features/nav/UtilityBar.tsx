import Link from "next/link";

/**
 * Thin bar above the header (VIB-99) — contact and support on the left,
 * publication links on the right. Wraps to two rows below 760px.
 *
 * All four destinations are real as of VIB-104. They shipped as `#` anchors
 * with VIB-98 because none of the pages existed; Blog, Docs and Changelog now
 * do, and "Get support" points at Docs, which is where support lives.
 */
const PUBLICATIONS = [
  { label: "Blog", href: "/blog" },
  { label: "Docs", href: "/docs" },
  { label: "Changelog", href: "/changelog" },
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
        <Link href="/docs" className="hover:text-foreground">
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
