"use client";

import { IconGridDots, IconSearch, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useRef, useState } from "react";

import { CategoryIcon } from "@/components/features/tools/CategoryIcon";
import {
  BEGINNER_CATEGORIES,
  CATEGORY_BLURBS,
  CATEGORY_GROUPS,
  toolCategoryLabel,
  type ToolCategory,
} from "@/lib/tool-categories";
import { toolsHref } from "@/lib/tools-url";

const TILE = "bg-secondary group-hover:bg-primary/10 flex size-12 items-center justify-center rounded-xl transition-colors";
const ITEM = "group flex w-full flex-col items-center gap-2 rounded-xl py-2 text-center text-xs font-bold";

/**
 * The signed-in home's category row (VIB-150): a beginner shortlist, then an
 * "All tools" tile that opens every category grouped into tabs.
 *
 * Native <dialog> rather than a modal library: showModal() gives the focus
 * trap, Escape to close and the backdrop for free.
 */
export function CategoryPicker() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [group, setGroup] = useState(0);

  return (
    <>
      <ul className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {BEGINNER_CATEGORIES.map((category) => (
          <li key={category}>
            <Link href={toolsHref({ category })} className={ITEM}>
              <span className={TILE}>
                <CategoryIcon category={category} className="size-5" />
              </span>
              {toolCategoryLabel(category)}
            </Link>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => dialog.current?.showModal()}
            className={ITEM}
            aria-haspopup="dialog"
          >
            <span className={TILE}>
              <IconGridDots aria-hidden className="size-5" />
            </span>
            All tools
          </button>
        </li>
      </ul>

      <dialog
        ref={dialog}
        aria-labelledby="all-tools-title"
        // A click on the dialog element itself is a click on the backdrop.
        onClick={(event) => event.target === event.currentTarget && dialog.current?.close()}
        className="bg-card text-foreground m-auto w-[calc(100%-2rem)] max-w-4xl rounded-2xl p-0 backdrop:bg-black/50"
      >
        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 id="all-tools-title" className="font-heading text-lg font-bold tracking-tight">
              All tools
            </h2>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="Close"
              className="hover:bg-secondary rounded-full p-1.5"
            >
              <IconX aria-hidden className="size-5" />
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div role="tablist" className="flex flex-wrap gap-1 text-sm">
              {CATEGORY_GROUPS.map((g, index) => (
                <button
                  key={g.label}
                  type="button"
                  role="tab"
                  aria-selected={group === index}
                  onClick={() => setGroup(index)}
                  className={
                    group === index
                      ? "bg-secondary rounded-full px-4 py-2 font-bold"
                      : "text-muted-foreground hover:text-foreground rounded-full px-4 py-2 transition-colors"
                  }
                >
                  {g.label}
                </button>
              ))}
            </div>
            <form method="get" action="/search" role="search" className="w-full sm:w-64">
              <label className="focus-within:ring-ring/50 flex h-10 items-center gap-2 rounded-lg border px-3 focus-within:ring-3">
                <IconSearch aria-hidden className="text-muted-foreground size-4 shrink-0" />
                <span className="sr-only">Search for tools</span>
                <input
                  type="search"
                  name="q"
                  placeholder="Search for tools"
                  className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
                />
              </label>
            </form>
          </div>

          <ul role="tabpanel" className="mt-6 grid min-h-48 content-start gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORY_GROUPS[group].categories.map((category: ToolCategory) => (
              <li key={category}>
                <Link
                  href={toolsHref({ category })}
                  onClick={() => dialog.current?.close()}
                  className="group hover:bg-secondary flex items-center gap-3 rounded-xl p-2 transition-colors"
                >
                  <span className="bg-secondary group-hover:bg-card flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <CategoryIcon category={category} className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{toolCategoryLabel(category)}</span>
                    <span className="text-muted-foreground block text-xs leading-snug">
                      {CATEGORY_BLURBS[category]}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
