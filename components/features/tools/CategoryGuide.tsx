import Link from "next/link";

import { Panel } from "@/components/ui/panel";
import type { CategoryGuide as Guide } from "@/lib/category-guides";
import { toolsHref } from "@/lib/tools-url";

/** The explainer above a confusing category's grid (VIB-145). */
export function CategoryGuide({ guide }: { guide: Guide }) {
  return (
    <Panel className="mt-6" aria-labelledby="category-guide">
      <h2 id="category-guide" className="font-heading text-lg font-semibold">
        {guide.title}
      </h2>
      <p className="mt-2 max-w-[70ch]">{guide.intro}</p>

      <ul className="mt-5 grid gap-5 md:grid-cols-3">
        {guide.kinds.map((kind) => (
          <li key={kind.name}>
            <h3 className="font-medium">{kind.name}</h3>
            <p className="text-muted-foreground mt-1 text-sm">{kind.body}</p>
            {kind.links.length ? (
              <p className="mt-2 flex flex-wrap gap-3 text-sm">
                {kind.links.map((link) => (
                  <Link
                    key={link.label}
                    href={toolsHref({ category: link.category, tag: link.tag })}
                    className="text-primary font-medium underline-offset-4 hover:underline"
                  >
                    {link.label} →
                  </Link>
                ))}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <p className="mt-5 border-t pt-4 text-sm">
        <span className="font-medium">Which one do I need? </span>
        {guide.choose}
      </p>
    </Panel>
  );
}
