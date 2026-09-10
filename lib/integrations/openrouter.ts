import { z } from "zod";

import { perMillion } from "@/lib/model-facts";

/**
 * OpenRouter adapter (VIB-107).
 *
 * The one module that knows live model specs come from OpenRouter. Both
 * endpoints used here are anonymous and read-only — no key, nothing to leak.
 * Callers get plain domain shapes with prices already per million, so a second
 * source (or a nightly copy into Postgres) would rewrite this file only (§34).
 *
 * Every failure — network, non-200, a shape OpenRouter changed — resolves to
 * "nothing known", never a throw. A model page without live specs is still a
 * useful page; a 500 because a third party hiccupped is not.
 */

const API = "https://openrouter.ai/api/v1";

/*
 * Prices and uptime move by the day, not the minute: an hour keeps pages
 * honest without calling OpenRouter per view. The full list is ~720KB, under
 * the 2MB ceiling of Next's data cache — past that the fetch silently stops
 * caching, and the card meta should move to per-model endpoints.
 */
const REVALIDATE_SECONDS = 3600;

const num = z.number().nullish();
const price = z.union([z.string(), z.number()]).nullish();

const PricingSchema = z.object({
  prompt: price,
  completion: price,
  input_cache_read: price,
  overrides: z
    .array(z.object({ min_prompt_tokens: z.number(), prompt: price, completion: price }))
    .nullish(),
});

/** USD per 1M tokens. Null when OpenRouter does not state one. */
export type ModelPrice = { input: number | null; output: number | null; cacheRead: number | null };

/** The higher price band some models charge once a prompt passes `fromTokens`. */
export type LongContextPrice = { fromTokens: number; input: number | null; output: number | null };

function toPrice(pricing: z.infer<typeof PricingSchema>) {
  const band = pricing.overrides?.[0];
  return {
    price: {
      input: perMillion(pricing.prompt),
      output: perMillion(pricing.completion),
      cacheRead: perMillion(pricing.input_cache_read),
    } satisfies ModelPrice,
    longContext: band
      ? ({
          fromTokens: band.min_prompt_tokens,
          input: perMillion(band.prompt),
          output: perMillion(band.completion),
        } satisfies LongContextPrice)
      : null,
  };
}

const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  created: num,
  context_length: num,
  architecture: z
    .object({ input_modalities: z.array(z.string()).nullish(), tokenizer: z.string().nullish() })
    .nullish(),
  pricing: PricingSchema,
  top_provider: z.object({ max_completion_tokens: num }).nullish(),
  supported_parameters: z.array(z.string()).nullish(),
  knowledge_cutoff: z.string().nullish(),
  benchmarks: z
    .object({
      artificial_analysis: z
        .object({ intelligence_index: num, coding_index: num, agentic_index: num })
        .nullish(),
    })
    .nullish(),
});

/** Artificial Analysis indices, as OpenRouter republishes them. */
export type ModelBenchmarks = {
  intelligence: number | null;
  coding: number | null;
  agentic: number | null;
};

export type OpenRouterModel = {
  id: string;
  name: string;
  /** Unix seconds. */
  created: number | null;
  contextLength: number | null;
  maxOutput: number | null;
  inputs: string[];
  tokenizer: string | null;
  knowledgeCutoff: string | null;
  price: ModelPrice;
  longContext: LongContextPrice | null;
  parameters: string[];
  benchmarks: ModelBenchmarks | null;
};

function toModel(raw: z.infer<typeof ModelSchema>): OpenRouterModel {
  const aa = raw.benchmarks?.artificial_analysis;
  return {
    id: raw.id,
    name: raw.name,
    created: raw.created ?? null,
    contextLength: raw.context_length ?? null,
    maxOutput: raw.top_provider?.max_completion_tokens ?? null,
    inputs: raw.architecture?.input_modalities ?? [],
    tokenizer: raw.architecture?.tokenizer ?? null,
    knowledgeCutoff: raw.knowledge_cutoff ?? null,
    ...toPrice(raw.pricing),
    parameters: raw.supported_parameters ?? [],
    benchmarks: aa
      ? {
          intelligence: aa.intelligence_index ?? null,
          coding: aa.coding_index ?? null,
          agentic: aa.agentic_index ?? null,
        }
      : null,
  };
}

const EndpointSchema = z.object({
  provider_name: z.string(),
  tag: z.string().nullish(),
  pricing: PricingSchema,
  max_completion_tokens: num,
  max_prompt_tokens: num,
  uptime_last_1d: num,
  status: num,
});

/** One company hosting the model. */
export type OpenRouterEndpoint = {
  /** "Azure · eu" — the provider plus the variant OpenRouter tags it with. */
  label: string;
  price: ModelPrice;
  longContext: LongContextPrice | null;
  maxOutput: number | null;
  maxPrompt: number | null;
  /** Percent, last 24 hours. */
  uptime: number | null;
  /** OpenRouter reports 0 for healthy and negative values for degraded. */
  degraded: boolean;
};

function toEndpoint(raw: z.infer<typeof EndpointSchema>): OpenRouterEndpoint {
  const variant = raw.tag?.split("/")[1];
  return {
    label: variant ? `${raw.provider_name} · ${variant}` : raw.provider_name,
    ...toPrice(raw.pricing),
    maxOutput: raw.max_completion_tokens ?? null,
    maxPrompt: raw.max_prompt_tokens ?? null,
    uptime: raw.uptime_last_1d ?? null,
    degraded: (raw.status ?? 0) < 0,
  };
}

async function getJson(path: string): Promise<unknown> {
  try {
    const response = await fetch(`${API}${path}`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!response.ok) {
      console.error(`openrouter ${path}: HTTP ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`openrouter ${path}:`, error);
    return null;
  }
}

/** Every model OpenRouter lists, keyed by id. Empty when OpenRouter is unreachable. */
export async function getOpenRouterModels(): Promise<Map<string, OpenRouterModel>> {
  const body = z.object({ data: z.array(z.unknown()) }).safeParse(await getJson("/models"));
  const models = new Map<string, OpenRouterModel>();
  if (!body.success) return models;

  for (const raw of body.data.data) {
    // One malformed row costs that model its specs, not the whole list.
    const parsed = ModelSchema.safeParse(raw);
    if (parsed.success) models.set(parsed.data.id, toModel(parsed.data));
  }
  return models;
}

/**
 * The providers serving one model, cheapest first.
 *
 * `id` is `tools.openrouter_id`, which the column CHECK holds to
 * `vendor/model` — it can only ever address a path under /models/.
 */
export async function getOpenRouterEndpoints(id: string): Promise<OpenRouterEndpoint[]> {
  const body = z
    .object({ data: z.object({ endpoints: z.array(z.unknown()) }) })
    .safeParse(await getJson(`/models/${id}/endpoints`));
  if (!body.success) return [];

  return body.data.data.endpoints
    .flatMap((raw) => {
      const parsed = EndpointSchema.safeParse(raw);
      return parsed.success ? [toEndpoint(parsed.data)] : [];
    })
    .sort(
      (a, b) =>
        (a.price.input ?? Number.MAX_VALUE) - (b.price.input ?? Number.MAX_VALUE),
    );
}
