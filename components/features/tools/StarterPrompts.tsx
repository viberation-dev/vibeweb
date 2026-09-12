import { CopyButton } from "@/components/features/walkthroughs/CopyButton";
import type { Prompt } from "@/lib/queries/prompts";

/**
 * Copyable starter prompts on a tool page (VIB-111). Same block as a walkthrough's
 * prompt step, so a prompt looks and copies the same wherever it appears.
 * Renders nothing when the tool has none.
 */
export function StarterPrompts({ prompts }: { prompts: readonly Prompt[] }) {
  if (prompts.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="font-heading mt-8 text-lg font-medium">Starter prompts</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Copy one, fill in the brackets, and paste it into your tool.
      </p>
      <ul className="mt-3 space-y-3">
        {prompts.map((prompt) => (
          <li key={prompt.id} className="rounded-lg border">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
              <p className="text-sm font-medium">
                {prompt.title}
                {prompt.use_case_category ? (
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    · {prompt.use_case_category}
                  </span>
                ) : null}
              </p>
              <CopyButton text={prompt.prompt_text} label="Copy prompt" />
            </div>
            {/* pre-wrap keeps the prompt's own line breaks and indentation. */}
            <p className="px-4 py-3 font-mono text-sm break-words whitespace-pre-wrap">
              {prompt.prompt_text}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
