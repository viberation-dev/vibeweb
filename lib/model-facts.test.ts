import assert from "node:assert/strict";
import { test } from "node:test";

import {
  bestUptime,
  capabilities,
  contextInPages,
  costTier,
  formatReleased,
  formatTokens,
  formatUsd,
  modalityLabels,
  OPENROUTER_ID,
  percentileBelow,
  perMillion,
  specLine,
} from "./model-facts.ts";

test("per-token prices become per-million, and unpriced is unknown, not free", () => {
  // Float noise (0.19999999999999998) must not leak into the label.
  assert.equal(formatUsd(perMillion("0.0000002")!), "$0.20");
  assert.equal(formatUsd(perMillion("0.000000022")!), "$0.022");
  assert.equal(perMillion("0"), 0);
  assert.equal(formatUsd(0), "Free");
  // "-1" is OpenRouter's variable pricing — claiming that as a price, or as
  // free, would both be wrong.
  assert.equal(perMillion("-1"), null);
  assert.equal(perMillion(undefined), null);
  assert.equal(perMillion("abc"), null);
});

test("token counts read the way OpenRouter prints them", () => {
  assert.equal(formatTokens(1_050_000), "1.1M");
  assert.equal(formatTokens(262_144), "262K");
  assert.equal(formatTokens(128_000), "128K");
});

test("context becomes pages, rounded so it does not pretend to precision", () => {
  assert.equal(contextInPages(1_050_000), "about 1,600 pages");
  assert.equal(contextInPages(128_000), "about 200 pages");
  assert.equal(contextInPages(8_192), "about 12 pages");
  assert.equal(contextInPages(100), "about 1 page");
});

test("cost tiers", () => {
  assert.equal(costTier(0), "Free");
  assert.equal(costTier(0.2), "Budget");
  assert.equal(costTier(2), "Mid-range");
  assert.equal(costTier(5), "Premium");
});

test("capabilities come from supported parameters", () => {
  const [tools, structured, thinking] = capabilities(["tools", "response_format"]);
  assert.equal(tools.supported, true);
  assert.equal(structured.supported, true);
  assert.equal(thinking.supported, false);
});

test("modalities list text first and keep unknown ones", () => {
  assert.deepEqual(modalityLabels(["file", "image", "text"]), ["Text", "Images", "Files"]);
  assert.deepEqual(modalityLabels(["text", "hologram"]), ["Text", "hologram"]);
});

test("percentile counts only models strictly below", () => {
  assert.equal(percentileBelow([10, 20, 30, 40], 30), 50);
  assert.equal(percentileBelow([], 30), 0);
});

test("uptime takes the best known provider", () => {
  assert.equal(bestUptime([null, 83.1, 99.97]), 99.97);
  assert.equal(bestUptime([null]), null);
});

test("release dates are UTC, not the server's zone", () => {
  assert.equal(formatReleased(1_783_590_864), "Jul 9, 2026");
});

test("card spec line drops what is unknown", () => {
  assert.equal(
    specLine({ input: 0.2, output: 1.2, contextLength: 1_050_000 }),
    "$0.20 / $1.20 per 1M · 1.1M context",
  );
  assert.equal(specLine({ input: 0, output: 0, contextLength: 262_144 }), "Free · 262K context");
  assert.equal(specLine({ input: null, output: 1, contextLength: null }), "");
});

test("OpenRouter ids are vendor/model and cannot escape the models path", () => {
  assert.ok(OPENROUTER_ID.test("openai/gpt-5.6-luna"));
  assert.ok(OPENROUTER_ID.test("inclusionai/ling-3.0-flash-vl:free"));
  assert.ok(OPENROUTER_ID.test("~anthropic/claude-latest"));
  assert.equal(OPENROUTER_ID.test("../admin"), false);
  assert.equal(OPENROUTER_ID.test("openai/../x"), false);
  assert.equal(OPENROUTER_ID.test("openai"), false);
  assert.equal(OPENROUTER_ID.test("a/b/c"), false);
  assert.equal(OPENROUTER_ID.test("OpenAI/GPT"), false);
});
