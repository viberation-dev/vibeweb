import assert from "node:assert/strict";
import { test } from "node:test";

import {
  fillFromSetup,
  filledText,
  hintName,
  hintsUsed,
  promptText,
  segmentPrompt,
  type PlaceholderHint,
} from "./prompt-placeholders.ts";

const tone: PlaceholderHint = {
  token: "[three words]",
  label: "Tone of voice",
  tip: "How the site should sound.",
  options: ["Plain, warm, confident", "Dry, precise, expert"],
};

const fill = (prompt: string, hints: PlaceholderHint[], choices = {}) =>
  segmentPrompt(prompt, hints)
    .map((segment) => filledText(segment, choices))
    .join("");

test("a prompt with no hints is one plain segment", () => {
  assert.deepEqual(segmentPrompt("Tone of voice: [three words]"), [
    { text: "Tone of voice: [three words]" },
  ]);
});

test("a hinted blank is filled with its first option, or the chosen one", () => {
  const prompt = "The agency: Northlight\nTone of voice: [three words]\nDone.";
  assert.equal(
    fill(prompt, [tone]),
    "The agency: Northlight\nTone of voice: Plain, warm, confident\nDone.",
  );
  assert.equal(
    fill(prompt, [tone], { 0: 1 }),
    "The agency: Northlight\nTone of voice: Dry, precise, expert\nDone.",
  );
});

test("brackets without a hint are left alone", () => {
  const prompt = "Mark gaps as [NEEDED: what].\nTone of voice: [three words]";
  const segments = segmentPrompt(prompt, [tone]);
  assert.equal(segments.filter((segment) => segment.hint).length, 1);
  assert.ok(fill(prompt, [tone]).startsWith("Mark gaps as [NEEDED: what]."));
});

test("a label tells two identical tokens apart, and beats an unlabelled hint", () => {
  const hints: PlaceholderHint[] = [
    { token: "[paste]", tip: "Whatever it printed.", options: ["(output)"] },
    { token: "[paste]", label: "node -v", tip: "The Node version.", options: ["v22.11.0"] },
    { token: "[paste]", label: "git --version", tip: "The Git version.", options: ["git version 2.47.0"] },
  ];
  assert.equal(
    fill("node -v: [paste]\ngit --version: [paste]\nnpm -v: [paste]", hints),
    "node -v: v22.11.0\ngit --version: git version 2.47.0\nnpm -v: (output)",
  );
});

test("a labelled hint does not match a blank on a different line", () => {
  assert.equal(fill("Voice: [three words]", [tone]), "Voice: [three words]");
});

test("hintsUsed lists each hint once, in order of appearance", () => {
  const idea: PlaceholderHint = { token: "[idea]", tip: "Your idea.", options: ["A route picker"] };
  const used = hintsUsed(segmentPrompt("[idea] then [three words]... Tone of voice: [three words] and [idea]", [tone, idea]));
  assert.deepEqual(
    used.map(({ hintIndex }) => hintIndex),
    [1, 0],
  );
});

test("a blank is named by its label, or by its token without brackets", () => {
  assert.equal(hintName(tone), "Tone of voice");
  assert.equal(hintName({ token: "[paste it]", tip: "x", options: ["y"] }), "paste it");
});

test("a blank the setup answers is filled in, and stops being a blank", () => {
  const whose: PlaceholderHint = {
    token: "[my own agency, or a client's]",
    label: "Whose site this is",
    tip: "It changes who approves things.",
    options: ["My own agency", "A client's"],
    setting: { owner: { mine: "My own agency", client: "A client's agency" } },
  };
  const prompt = "Whose site this is: [my own agency, or a client's]\nTone of voice: [three words]";
  const segments = segmentPrompt(prompt, [whose, tone]);

  const filled = fillFromSetup(segments, { owner: "client" });
  assert.equal(
    promptText(filled),
    "Whose site this is: A client's agency\nTone of voice: [three words]",
  );
  assert.deepEqual(
    hintsUsed(filled).map(({ hint }) => hint.token),
    ["[three words]"],
  );

  // No setup, or a value the hint has no answer for: the prompt is as authored.
  assert.equal(promptText(fillFromSetup(segments, null)), prompt);
  assert.equal(promptText(fillFromSetup(segments, { owner: "nobody" })), prompt);
});
