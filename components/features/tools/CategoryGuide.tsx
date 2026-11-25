"use client";

import { IconChevronDown, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Panel } from "@/components/ui/panel";
import {
  GUIDES_HIDDEN_COOKIE,
  hiddenGuides,
  type CategoryGuide as Guide,
} from "@/lib/category-guides";
import { toolsHref } from "@/lib/tools-url";

const YEAR = 60 * 60 * 24 * 365;

function readCookie(): string | undefined {
  return document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${GUIDES_HIDDEN_COOKIE}=`))
    ?.split("=")[1];
}

/** Adds or removes this category in the hidden list, read fresh so two tabs cannot undo each other. */
function remember(category: string, hide: boolean) {
  const current = hiddenGuides(readCookie()).filter((c) => c !== category);
  const next = hide ? [...current, category] : current;
  document.cookie = `${GUIDES_HIDDEN_COOKIE}=${next.join(",")}; path=/; max-age=${YEAR}; samesite=lax`;
}

/**
 * The explainer above a category's grid (VIB-145, every category since
 * VIB-182).
 *
 * Signed-in members can hide it once they know the concept; it collapses to
 * a one-line bar that brings it back, rather than vanishing, so nobody loses
 * it for good. Visitors always see it in full, since they are who it is for.
 */
export function CategoryGuide({
  guide,
  category,
}: {
  guide: Guide;
  category: string;
}) {
  /*
   * Read in the browser so /tools can be cached for everyone. The server
   * renders the full guide, which is what visitors get anyway; a member who
   * hid it sees it fold up right after load.
   */
  const [collapsible, setCollapsible] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // An auth cookie is enough here: hiding a guide is a preference, not access.
    const member = /(?:^|; )sb-[^=]+-auth-token/.test(document.cookie);
    setCollapsible(member);
    setHidden(member && hiddenGuides(readCookie()).includes(category));
  }, [category]);

  function toggle(hide: boolean) {
    setHidden(hide);
    remember(category, hide);
  }

  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => toggle(false)}
        aria-expanded={false}
        className="bg-secondary hover:bg-secondary/80 mt-6 flex w-full items-center justify-between gap-4 rounded-[1.125rem] px-6 py-3 text-left text-sm"
      >
        <span className="font-medium">{guide.title}</span>
        <span className="text-primary flex shrink-0 items-center gap-1 font-semibold">
          Show explainer
          <IconChevronDown aria-hidden className="size-4" />
        </span>
      </button>
    );
  }

  return (
    <Panel className="mt-6" aria-labelledby="category-guide">
      <div className="flex items-start justify-between gap-4">
        <h2 id="category-guide" className="font-heading text-lg font-semibold">
          {guide.title}
        </h2>
        {collapsible ? (
          <button
            type="button"
            onClick={() => toggle(true)}
            aria-expanded
            className="text-muted-foreground hover:text-foreground -mt-1 -mr-2 flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm"
          >
            <IconX aria-hidden className="size-4" />
            Hide
          </button>
        ) : null}
      </div>
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
