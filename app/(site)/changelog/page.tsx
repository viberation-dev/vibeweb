import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import {
  changelogByDate,
  CHANGELOG_KIND_LABELS,
  formatChangelogDate,
} from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelog — Viberation",
  description:
    "What has shipped on Viberation, newest first — new features, improvements and fixes.",
};

/**
 * Public changelog (VIB-104), the utility bar's third destination.
 *
 * Reads a repo constant rather than the database — see the note in
 * lib/changelog.ts for why, and what would change that.
 *
 * Note this is *not* the engineering CHANGELOG.md that §34 records as an
 * undecided gap (that one is about tracking migrations and repo history).
 * This is the visitor-facing "what's new". They could share a source one day;
 * they are not the same document.
 */
export default function ChangelogPage() {
  const groups = changelogByDate();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <header>
        <p className="text-primary flex items-center gap-2.5 text-xs font-bold tracking-widest uppercase">
          <span aria-hidden className="bg-primary h-0.5 w-5 rounded-full" />
          Changelog
        </p>
        <h1 className="font-heading mt-3.5 text-3xl font-bold tracking-[-0.04em] lg:text-4xl">
          What&rsquo;s new
        </h1>
        <p className="text-muted-foreground mt-3.5 text-lg leading-relaxed">
          Everything that has shipped, newest first. Written when it ships, so
          it is what changed rather than what was planned.
        </p>
      </header>

      <div className="mt-12 space-y-12">
        {groups.map((group) => (
          <section key={group.date}>
            {/*
              The date is the heading for its group, so a screen reader hears
              "11 September 2026" before the entries under it rather than a
              loose run of titles.
            */}
            <h2 className="text-muted-foreground font-mono text-sm">
              <time dateTime={group.date}>
                {formatChangelogDate(group.date)}
              </time>
            </h2>

            <ul className="border-border mt-4 space-y-6 border-l pl-6">
              {group.entries.map((entry) => (
                <li key={entry.title}>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-heading text-lg font-bold tracking-tight">
                      {entry.title}
                    </h3>
                    <Badge variant="outline">
                      {CHANGELOG_KIND_LABELS[entry.kind]}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-2 leading-relaxed">
                    {entry.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {groups.length === 0 ? (
        <p className="text-muted-foreground mt-12">Nothing shipped yet.</p>
      ) : null}
    </main>
  );
}
