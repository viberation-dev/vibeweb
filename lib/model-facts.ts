/*
 * Model specs, formatted for people choosing a model (VIB-107).
 *
 * Pure and alias-free so it runs under plain `node --test`, for the same
 * reason lib/tool-facts.ts is. The network half lives in
 * lib/integrations/openrouter.ts.
 */

/**
 * Same rule as the `tools_openrouter_id_shape` CHECK: `vendor/model`, with an
 * optional `~` for OpenRouter's always-latest aliases and `:free`-style
 * variant suffixes. Anchored segments that start alphanumeric, so `..` can
 * never reach the URL the adapter builds from it.
 */
export const OPENROUTER_ID = /^~?[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._:-]*$/;

/**
 * OpenRouter prices a single token in USD, as a decimal string; people
 * compare per million. Negative ("-1") means variable pricing, which is not a
 * price, so it reads as unknown rather than as a discount.
 */
export function perMillion(perToken: string | number | null | undefined): number | null {
  if (perToken === null || perToken === undefined || perToken === "") return null;
  const value = Number(perToken);
  return Number.isFinite(value) && value >= 0 ? value * 1_000_000 : null;
}

// Two decimals for "$1.20", a third for cache prices like "$0.022".
const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});

export function formatUsd(perMillionUsd: number): string {
  return perMillionUsd === 0 ? "Free" : USD.format(perMillionUsd);
}

const TOKENS_M = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const TOKENS_K = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 0 });

/** 1,050,000 → "1.1M", 262,144 → "262K". */
export function formatTokens(tokens: number): string {
  return (tokens >= 1_000_000 ? TOKENS_M : TOKENS_K).format(tokens);
}

/**
 * A context window in pages of text, for readers who do not think in tokens.
 *
 * ponytail: rule of thumb — ~0.75 English words per token, ~500 words per
 * page. Code tokenises denser than prose; if readers need that distinction,
 * add a "files of code" estimate beside it rather than tuning this one.
 */
export function contextInPages(tokens: number): string {
  const pages = (tokens * 0.75) / 500;
  const rounded = pages >= 100 ? Math.round(pages / 50) * 50 : Math.max(1, Math.round(pages));
  return `about ${rounded.toLocaleString("en-US")} ${rounded === 1 ? "page" : "pages"}`;
}

export type CostTier = "Free" | "Budget" | "Mid-range" | "Premium";

/**
 * A plain-language price band from the input price per 1M tokens.
 *
 * ponytail: fixed thresholds set against September 2026 prices (GPT-5.6 Luna
 * $0.20 → Budget, Terra $2 → Mid-range, GPT-6 Astra $5+ → Premium). Revisit
 * when prices move a band; derive from the live distribution if they keep
 * moving.
 */
export function costTier(inputPerMillion: number): CostTier {
  if (inputPerMillion === 0) return "Free";
  if (inputPerMillion <= 0.5) return "Budget";
  if (inputPerMillion < 5) return "Mid-range";
  return "Premium";
}

/** What a model can do for an app, read off the request parameters it accepts. */
export function capabilities(parameters: readonly string[]) {
  const has = new Set(parameters);
  return [
    { label: "Use tools (agents)", supported: has.has("tools") },
    {
      label: "Structured output",
      supported: has.has("structured_outputs") || has.has("response_format"),
    },
    { label: "Thinking mode", supported: has.has("reasoning") || has.has("include_reasoning") },
  ];
}

const MODALITY_LABELS: Record<string, string> = {
  text: "Text",
  image: "Images",
  file: "Files",
  audio: "Audio",
  video: "Video",
};
const MODALITY_ORDER = Object.keys(MODALITY_LABELS);

/** OpenRouter's input_modalities as labels, text first; unknown ones pass through. */
export function modalityLabels(modalities: readonly string[]): string[] {
  const rank = (m: string) => {
    const i = MODALITY_ORDER.indexOf(m);
    return i === -1 ? MODALITY_ORDER.length : i;
  };
  return [...modalities].sort((a, b) => rank(a) - rank(b)).map((m) => MODALITY_LABELS[m] ?? m);
}

/** Percent of `values` strictly below `value` — "better than N% of models". */
export function percentileBelow(values: readonly number[], value: number): number {
  if (values.length === 0) return 0;
  return Math.round((100 * values.filter((v) => v < value).length) / values.length);
}

/**
 * The best provider's uptime. OpenRouter falls back across providers when one
 * fails, so the best single provider is a floor on what a caller sees, not a
 * best case.
 */
export function bestUptime(uptimes: readonly (number | null)[]): number | null {
  const known = uptimes.filter((u): u is number => u !== null);
  return known.length ? Math.max(...known) : null;
}

const DAY = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** OpenRouter's `created` (Unix seconds) → "Jul 9, 2026". */
export function formatReleased(unixSeconds: number): string {
  return DAY.format(new Date(unixSeconds * 1000));
}

/**
 * A model family as OpenRouter ids spell it: `anthropic/claude`, `openai/gpt`,
 * `qwen/qwen`. Matched as a prefix, so staff can widen (`qwen/qwen` covers
 * qwen3 and qwen3.5) or narrow (`openai/gpt-5`) a family without a code
 * change. Same rule as the `tools_openrouter_family_shape` CHECK.
 */
export const OPENROUTER_FAMILY = /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/;

/**
 * Every model in a family, newest first.
 *
 * `:free`, `:batch` and friends are ways of calling a model, not models, so
 * they stay out of the list — a free one surfaces as a note on its model.
 */
export function familyMembers<T extends { id: string; created: number | null }>(
  models: Iterable<T>,
  family: string,
): T[] {
  return [...models]
    .filter((m) => m.id.startsWith(family) && !m.id.includes(":") && OPENROUTER_ID.test(m.id))
    .sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
}

/** Which member a family page shows: the one asked for, else the featured one, else the newest. */
export function pickMember<T extends { id: string }>(
  members: readonly T[],
  requested: string | undefined,
  featured: string | null,
): T | undefined {
  return (
    members.find((m) => m.id === requested) ??
    members.find((m) => m.id === featured) ??
    members[0]
  );
}

/**
 * A family page's link to one of its models. The default model is the page's
 * canonical URL, so it gets no ?model= (VIB-107). Leave `defaultId` out to
 * always name the model: a saved model should keep opening that model even
 * after it becomes, or stops being, the default (VIB-113).
 */
export function modelHref(basePath: string, modelId: string, defaultId?: string): string {
  return modelId === defaultId ? basePath : `${basePath}?model=${modelId}`;
}

/** "Anthropic: Claude Opus 5" → "Claude Opus 5". The family page already says who made it. */
export function modelDisplayName(name: string): string {
  const i = name.indexOf(": ");
  return i === -1 ? name : name.slice(i + 2);
}

/** A family's directory card line: "15 models · from $0.25 per 1M". Empty for no models. */
export function familyLine(inputPrices: readonly (number | null)[]): string {
  const count = inputPrices.length;
  if (count === 0) return "";
  const models = `${count} ${count === 1 ? "model" : "models"}`;
  const known = inputPrices.filter((p): p is number => p !== null);
  if (known.length === 0) return models;
  const cheapest = Math.min(...known);
  return cheapest === 0
    ? `${models} · free options`
    : `${models} · from ${formatUsd(cheapest)} per 1M`;
}
