import { IconChevronDown, IconExternalLink } from "@tabler/icons-react";

import { CopyButton } from "@/components/features/walkthroughs/CopyButton";
import { Badge } from "@/components/ui/badge";
import type { SkillSource } from "@/lib/skill-facts";
import {
  agentInstallCommand,
  agentInstallPrompt,
  SKILL_AGENTS,
  type SkillAgent,
} from "@/lib/skill-taxonomy";

/** Widened from the `as const` literal so optional fields such as `note` read as optional. */
const AGENTS: readonly SkillAgent[] = SKILL_AGENTS;

type Props = {
  source: SkillSource;
  /** Agents staff marked as not supported (`tools.skill_agents_excluded`). */
  agentsExcluded: readonly string[];
  /** Where the skill's files come from as a download: our ZIP, or GitHub for a pack. */
  download: { href: string; label: string; zip: boolean };
};

/**
 * How to install a skill into each agent (VIB-132).
 *
 * One native <details> per agent: no JavaScript, keyboard-operable, and
 * every agent's steps are in the HTML for search and for anyone who wants to
 * read them all. The first supported agent starts open.
 */
export function SkillInstall({ source, agentsExcluded, download }: Props) {
  const firstSupported = AGENTS.find((agent) => !agentsExcluded.includes(agent.id))?.id;

  return (
    <div className="mt-6">
      <h3 className="font-heading text-base font-medium">Install for your agent</h3>
      <ul className="mt-3 space-y-2">
        {AGENTS.map((agent) => {
          const excluded = agentsExcluded.includes(agent.id);
          return (
            <li key={agent.id}>
              <details className="group rounded-lg border" open={agent.id === firstSupported}>
                <summary className="hover:bg-muted/40 flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2">
                    {agent.label}
                    {excluded ? <Badge variant="outline">Not supported</Badge> : null}
                  </span>
                  <IconChevronDown
                    aria-hidden
                    className="text-muted-foreground size-4 transition-transform group-open:rotate-180"
                  />
                </summary>

                <div className="space-y-4 border-t px-4 py-4 text-sm">
                  {excluded ? (
                    <p className="text-muted-foreground">
                      This skill is marked as not working in {agent.label}, usually because it needs a
                      terminal or files that {agent.label} does not have.
                    </p>
                  ) : agent.kind === "folder" ? (
                    <>
                      <Step title="Run this in your project">
                        <CodeLine text={agentInstallCommand(source, agent.cliAgent)} />
                        <p className="text-muted-foreground mt-1.5 text-xs">
                          Add <code>-g</code> to install it for every project instead.
                        </p>
                      </Step>
                      <Step title={`Or ask ${agent.label} to do it`}>
                        <CodeBlock text={agentInstallPrompt(source, agent)} />
                      </Step>
                      <Step title="Or copy the folder yourself">
                        <p className="text-muted-foreground">
                          {download.zip ? "Unzip the download" : "Copy the skill's folder from GitHub"} into{" "}
                          <code>{agent.projectPath}/</code> for this project, or{" "}
                          <code>{agent.personalPath}/</code> for all your projects.
                        </p>
                      </Step>
                    </>
                  ) : (
                    <Step title={download.zip ? "Upload the ZIP" : "Upload the skill"}>
                      {download.zip ? null : (
                        <p className="text-muted-foreground mb-2">
                          Download the skill&apos;s folder from GitHub and zip it, with the folder at the
                          top of the ZIP.
                        </p>
                      )}
                      <ol className="text-muted-foreground list-decimal space-y-1 pl-5">
                        {agent.steps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    </Step>
                  )}

                  {!excluded && agent.note ? <p className="text-muted-foreground text-xs">{agent.note}</p> : null}
                  <a
                    href={agent.docs}
                    target="_blank"
                    rel="noopener"
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
                  >
                    {agent.label} skills docs
                    <IconExternalLink aria-hidden className="size-3.5" />
                  </a>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 font-medium">{title}</p>
      {children}
    </div>
  );
}

/* Plain selectable text beside the button, so copying works without JavaScript too. */
function CodeLine({ text }: { text: string }) {
  return (
    <div className="bg-muted flex flex-wrap items-center justify-between gap-3 rounded-lg px-3 py-2">
      <code className="min-w-0 text-xs break-all">{text}</code>
      <CopyButton text={text} />
    </div>
  );
}

function CodeBlock({ text }: { text: string }) {
  return (
    <div className="bg-muted rounded-lg p-3">
      <pre className="text-xs whitespace-pre-wrap">{text}</pre>
      <div className="mt-2 flex justify-end">
        <CopyButton text={text} label="Copy prompt" />
      </div>
    </div>
  );
}
