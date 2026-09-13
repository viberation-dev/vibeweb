import {
  IconAlertTriangle,
  IconChevronDown,
  IconCircleCheck,
  IconCircleX,
} from "@tabler/icons-react";

import { Fact } from "@/components/features/tools/Fact";
import { CopyButton } from "@/components/features/walkthroughs/CopyButton";
import { formatCount, formatDay, type AuditStatus } from "@/lib/skill-facts";
import type { SkillPageFacts } from "@/lib/skill-live";
import { cn } from "@/lib/utils";

const STATUS: Record<AuditStatus, { label: string; icon: typeof IconCircleCheck; className: string }> = {
  pass: { label: "Pass", icon: IconCircleCheck, className: "text-primary" },
  warn: { label: "Warning", icon: IconAlertTriangle, className: "text-amber-600 dark:text-amber-400" },
  fail: { label: "Fail", icon: IconCircleX, className: "text-destructive" },
};

/**
 * Live facts for a skill (VIB-130): how to install it, how widely it is used,
 * what independent scanners found, and what is actually in it.
 *
 * Every row is optional. skills.sh and GitHub each fail to "nothing known",
 * and an unknown row is dropped rather than printed as "—", the same rule the
 * tool page's Key info follows.
 */
export function SkillFacts({ facts }: { facts: SkillPageFacts }) {
  const { command, installs, repo, repoFacts, detail, audits, isPack } = facts;
  const updated = formatDay(repoFacts?.pushedAt ?? null);

  return (
    <section aria-labelledby="skill-facts">
      <h2 id="skill-facts" className="font-heading mt-8 text-lg font-medium">
        {/* No skills.sh source means no command to offer, so no "Install" promise either. */}
        {command ? (isPack ? "Install this skill pack" : "Install this skill") : "At a glance"}
      </h2>

      {command ? (
        <div className="bg-muted mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3">
          {/* Plain selectable text beside the button: copying works without JavaScript too. */}
          <code className="min-w-0 text-sm break-all">{command}</code>
          <CopyButton text={command} />
        </div>
      ) : null}
      {command ? (
        <p className="text-muted-foreground mt-2 text-xs">
          Runs the open-source skills CLI in your own terminal. It asks which agents to add the
          skill to. Read what it tells your agent to do before you install it.
        </p>
      ) : null}

      <dl className="mt-4">
        {installs !== null ? (
          <Fact
            label="Installs"
            value={
              <>
                {formatCount(installs)}{" "}
                <span className="text-muted-foreground font-normal">
                  {isPack ? "across the pack, via skills.sh" : "via skills.sh"}
                </span>
              </>
            }
          />
        ) : null}
        {repo && repoFacts ? (
          <Fact
            label="GitHub"
            value={
              <a
                href={`https://github.com/${repo.owner}/${repo.repo}`}
                target="_blank"
                rel="noopener"
                className="underline-offset-4 hover:underline"
              >
                {formatCount(repoFacts.stars)} stars ↗
              </a>
            }
          />
        ) : null}
        {updated ? (
          <Fact
            label="Last updated"
            value={repoFacts?.archived ? `${updated} (archived)` : updated}
          />
        ) : null}
        {repoFacts?.license ? <Fact label="Licence" value={repoFacts.license} /> : null}
      </dl>

      {audits.length ? (
        <>
          <h3 className="font-heading mt-6 text-base font-medium">Security checks</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            Run by independent scanners and published on skills.sh. Their results, not a
            Viberation review.
          </p>
          <ul className="mt-3 divide-y rounded-lg border">
            {audits.map((audit) => {
              const status = STATUS[audit.status];
              const Icon = status.icon;
              const day = formatDay(audit.auditedAt);
              return (
                <li key={audit.provider} className="flex items-start gap-3 px-4 py-3 text-sm">
                  <Icon aria-hidden className={cn("mt-0.5 size-4 shrink-0", status.className)} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {audit.provider}{" "}
                      <span className={cn("font-normal", status.className)}>{status.label}</span>
                    </p>
                    {audit.summary ? (
                      <p className="text-muted-foreground mt-0.5">{audit.summary}</p>
                    ) : null}
                  </div>
                  {day ? <span className="text-muted-foreground shrink-0 text-xs">{day}</span> : null}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      {detail?.files.length ? (
        <details className="group mt-6 rounded-lg border">
          <summary className="hover:bg-muted/40 flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
            What&apos;s inside ({detail.files.length} {detail.files.length === 1 ? "file" : "files"})
            <IconChevronDown
              aria-hidden
              className="text-muted-foreground size-4 transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="space-y-4 border-t px-4 py-4">
            <ul className="text-sm">
              {detail.files.map((file) => (
                <li key={file.path} className="flex justify-between gap-4 py-0.5">
                  <code className="min-w-0 break-all">{file.path}</code>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {formatCount(file.size)} chars
                  </span>
                </li>
              ))}
            </ul>
            {detail.skillMd ? (
              <div>
                <p className="text-muted-foreground text-xs">
                  SKILL.md{detail.skillMdTruncated ? ", first part" : ""}. Shown as plain text.
                </p>
                {/*
                  Third-party text, rendered as a text node inside <pre> — never
                  as Markdown or HTML, so nothing in it can become markup here.
                */}
                <pre className="bg-muted mt-2 max-h-96 overflow-auto rounded-lg p-3 text-xs whitespace-pre-wrap">
                  {detail.skillMd}
                </pre>
              </div>
            ) : null}
          </div>
        </details>
      ) : null}
    </section>
  );
}
