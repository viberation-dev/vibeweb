import { IconCheck, IconChevronDown, IconMinus } from "@tabler/icons-react";

import { Fact } from "@/components/features/tools/Fact";
import { Badge } from "@/components/ui/badge";
import type {
  ModelBenchmarks,
  OpenRouterEndpoint,
  OpenRouterModel,
} from "@/lib/integrations/openrouter";
import {
  bestUptime,
  capabilities,
  contextInPages,
  costTier,
  formatReleased,
  formatTokens,
  formatUsd,
  modalityLabels,
  percentileBelow,
} from "@/lib/model-facts";

type Props = {
  model: OpenRouterModel;
  endpoints: OpenRouterEndpoint[];
  /** Every model OpenRouter lists — what "better than N%" is measured against. */
  peers: OpenRouterModel[];
};

const BENCHMARKS: { key: keyof ModelBenchmarks; label: string }[] = [
  { key: "coding", label: "Coding" },
  { key: "agentic", label: "Agentic work" },
  { key: "intelligence", label: "Overall" },
];

/** A percentile over a handful of models is noise dressed up as a fact. */
const MIN_PEERS = 20;

const money = (value: number | null) => (value === null ? "—" : formatUsd(value));

/**
 * Live model specs (VIB-107): a plain-language "At a glance" list by default,
 * with the numbers a developer wiring up an API wants behind a native
 * <details> toggle — no JavaScript, keyboard-operable, the same disclosure
 * pattern as the directory filters.
 */
export function ModelSpecs({ model, endpoints, peers }: Props) {
  const { input, output } = model.price;
  const uptime = bestUptime(endpoints.map((endpoint) => endpoint.uptime));
  const reads = modalityLabels(model.inputs);

  const goodAt = BENCHMARKS.flatMap(({ key, label }) => {
    const score = model.benchmarks?.[key];
    if (score === null || score === undefined) return [];
    const scores = peers.flatMap((peer) => {
      const value = peer.benchmarks?.[key];
      return value === null || value === undefined ? [] : [value];
    });
    if (scores.length < MIN_PEERS) return [];
    return [`${label}: better than ${percentileBelow(scores, score)}%`];
  });

  // The list endpoint omits long-context bands on some models; the provider
  // charging the list price carries them.
  const longContext =
    model.longContext ??
    endpoints.find((endpoint) => endpoint.price.input === input)?.longContext ??
    null;
  const maxPrompt = endpoints.find((endpoint) => endpoint.maxPrompt !== null)?.maxPrompt ?? null;

  return (
    <section aria-labelledby="at-a-glance">
      <h2 id="at-a-glance" className="font-heading mt-8 text-lg font-medium">
        At a glance
      </h2>
      <dl className="mt-3">
        {input !== null && output !== null ? (
          <Fact
            label="Cost"
            value={
              <span className="inline-flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
                <span>
                  {formatUsd(input)} in · {formatUsd(output)} out{" "}
                  <span className="text-muted-foreground font-normal">per 1M tokens</span>
                </span>
                <Badge variant="outline">{costTier(input)}</Badge>
              </span>
            }
          />
        ) : null}
        {model.contextLength ? (
          <Fact
            label="Memory"
            value={
              <>
                {formatTokens(model.contextLength)} tokens{" "}
                <span className="text-muted-foreground font-normal">
                  — {contextInPages(model.contextLength)}
                </span>
              </>
            }
          />
        ) : null}
        {reads.length ? <Fact label="Reads" value={reads.join(" · ")} /> : null}
        <Fact
          label="Can do"
          value={
            <ul className="flex flex-wrap justify-end gap-x-3 gap-y-1">
              {capabilities(model.parameters).map((capability) => (
                <li
                  key={capability.label}
                  className={
                    capability.supported
                      ? "inline-flex items-center gap-1"
                      : "text-muted-foreground inline-flex items-center gap-1 font-normal"
                  }
                >
                  {capability.supported ? (
                    <IconCheck aria-hidden className="text-primary size-4" />
                  ) : (
                    <IconMinus aria-hidden className="size-4" />
                  )}
                  {capability.label}
                  {capability.supported ? null : <span className="sr-only"> (not supported)</span>}
                </li>
              ))}
            </ul>
          }
        />
        {goodAt.length ? <Fact label="Good at" value={goodAt.join(" · ")} /> : null}
        {uptime !== null ? (
          <Fact
            label="Reliability"
            value={
              <>
                {uptime.toFixed(2)}%{" "}
                <span className="text-muted-foreground font-normal">uptime, last 24h</span>
              </>
            }
          />
        ) : null}
        {model.created ? <Fact label="Released" value={formatReleased(model.created)} /> : null}
      </dl>

      <details className="group mt-4 rounded-lg border">
        <summary className="hover:bg-muted/40 flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
          Advanced details
          <IconChevronDown
            aria-hidden
            className="text-muted-foreground size-4 transition-transform group-open:rotate-180"
          />
        </summary>

        <div className="space-y-6 border-t px-4 py-4">
          <dl>
            <Fact
              label="API model ID"
              value={<code className="bg-muted rounded px-1.5 py-0.5 text-xs">{model.id}</code>}
            />
            {model.maxOutput ? (
              <Fact label="Max output" value={`${formatTokens(model.maxOutput)} tokens`} />
            ) : null}
            {maxPrompt ? <Fact label="Max input" value={`${formatTokens(maxPrompt)} tokens`} /> : null}
            {model.price.cacheRead !== null ? (
              <Fact label="Cached input" value={`${formatUsd(model.price.cacheRead)} per 1M`} />
            ) : null}
            {longContext && longContext.input !== null && longContext.output !== null ? (
              <Fact
                label={`Prompts over ${formatTokens(longContext.fromTokens)}`}
                value={`${formatUsd(longContext.input)} in · ${formatUsd(longContext.output)} out per 1M`}
              />
            ) : null}
            {model.knowledgeCutoff ? (
              <Fact label="Knowledge cutoff" value={model.knowledgeCutoff} />
            ) : null}
            {model.tokenizer ? <Fact label="Tokenizer" value={model.tokenizer} /> : null}
            {BENCHMARKS.map(({ key, label }) => {
              const score = model.benchmarks?.[key];
              return score === null || score === undefined ? null : (
                <Fact key={key} label={`${label} index`} value={score.toFixed(1)} />
              );
            })}
          </dl>

          {endpoints.length ? (
            <div>
              <h3 className="text-sm font-medium">Providers</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                The same model, hosted by different companies. OpenRouter picks one per request and
                falls back to the next if it fails.
              </p>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[34rem] text-sm">
                  <thead className="text-muted-foreground text-xs">
                    <tr className="border-b">
                      <th scope="col" className="py-2 pr-3 text-left font-medium">
                        Provider
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-medium">
                        Input /1M
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-medium">
                        Output /1M
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-medium">
                        Cached /1M
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-medium">
                        Max output
                      </th>
                      <th scope="col" className="py-2 text-right font-medium">
                        Uptime 24h
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoints.map((endpoint, index) => (
                      <tr key={`${endpoint.label}-${index}`} className="border-b last:border-b-0">
                        <th scope="row" className="py-2 pr-3 text-left font-medium">
                          {endpoint.label}
                          {endpoint.degraded ? (
                            <Badge variant="outline" className="ml-2">
                              Degraded
                            </Badge>
                          ) : null}
                        </th>
                        <td className="py-2 pr-3 text-right tabular-nums">
                          {money(endpoint.price.input)}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">
                          {money(endpoint.price.output)}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">
                          {money(endpoint.price.cacheRead)}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">
                          {endpoint.maxOutput ? formatTokens(endpoint.maxOutput) : "—"}
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          {endpoint.uptime !== null ? `${endpoint.uptime.toFixed(2)}%` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {model.parameters.length ? (
            <div>
              <h3 className="text-sm font-medium">Supported parameters</h3>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {model.parameters.map((parameter) => (
                  <li key={parameter}>
                    <Badge variant="secondary" className="font-mono">
                      {parameter}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </details>

      <p className="text-muted-foreground mt-2 text-xs">
        Live from{" "}
        <a
          href={`https://openrouter.ai/${model.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          OpenRouter
        </a>
        , refreshed hourly.{model.benchmarks ? " Scores from Artificial Analysis." : ""}
      </p>
    </section>
  );
}
