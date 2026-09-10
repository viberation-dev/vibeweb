import assert from "node:assert/strict";
import { test } from "node:test";

import {
  bestUptime,
  capabilities,
  contextInPages,
  costTier,
  familyLine,
  familyMembers,
  formatReleased,
  formatTokens,
  formatUsd,
  modalityLabels,
  modelDisplayName,
  OPENROUTER_FAMILY,
  OPENROUTER_ID,
  percentileBelow,
  perMillion,
  pickMember,
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

test("family members are the family's models, newest first, without variants", () => {
  const models = [
    { id: "anthropic/claude-sonnet-5", created: 300 },
    { id: "anthropic/claude-sonnet-5:batch", created: 300 },
    { id: "anthropic/claude-3-haiku", created: 100 },
    { id: "anthropic/claude-opus-5", created: 200 },
    { id: "google/gemini-3.8-flash", created: 400 },
    { id: "~anthropic/claude-latest", created: 500 },
  ];
  assert.deepEqual(
    familyMembers(models, "anthropic/claude").map((m) => m.id),
    ["anthropic/claude-sonnet-5", "anthropic/claude-opus-5", "anthropic/claude-3-haiku"],
  );
});

test("a family page shows the requested model, else the featured one, else the newest", () => {
  const members = [{ id: "a/x-new" }, { id: "a/x-featured" }];
  assert.equal(pickMember(members, "a/x-new", "a/x-featured")?.id, "a/x-new");
  // A stale or hand-typed ?model= falls back rather than 404ing.
  assert.equal(pickMember(members, "b/elsewhere", "a/x-featured")?.id, "a/x-featured");
  assert.equal(pickMember(members, undefined, null)?.id, "a/x-new");
  assert.equal(pickMember([], undefined, null), undefined);
});

test("display names drop the vendor prefix", () => {
  assert.equal(modelDisplayName("Anthropic: Claude Opus 5"), "Claude Opus 5");
  assert.equal(modelDisplayName("Auto Router"), "Auto Router");
});

test("family card line counts models and quotes the cheapest input", () => {
  assert.equal(familyLine([3, 0.25, null, 15]), "4 models · from $0.25 per 1M");
  assert.equal(familyLine([0, 2]), "2 models · free options");
  assert.equal(familyLine([null]), "1 model");
  assert.equal(familyLine([]), "");
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

test("family prefixes are vendor/name, without variants or aliases", () => {
  assert.ok(OPENROUTER_FAMILY.test("anthropic/claude"));
  assert.ok(OPENROUTER_FAMILY.test("openai/gpt-5"));
  assert.equal(OPENROUTER_FAMILY.test("anthropic"), false);
  assert.equal(OPENROUTER_FAMILY.test("~anthropic/claude"), false);
  assert.equal(OPENROUTER_FAMILY.test("anthropic/claude:free"), false);
  assert.equal(OPENROUTER_FAMILY.test("../admin"), false);
});
