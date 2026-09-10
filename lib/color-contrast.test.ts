import { test } from "node:test";
import assert from "node:assert/strict";

import { contrastRatio, hexToRgb, mixOklab } from "./color-contrast.ts";

test("the extremes are the known WCAG bounds", () => {
  assert.equal(contrastRatio("#ffffff", "#000000").toFixed(2), "21.00");
  assert.equal(contrastRatio("#ffffff", "#ffffff").toFixed(2), "1.00");
});

test("argument order does not change the ratio", () => {
  const a = contrastRatio("#0b6b4f", "#ffffff");
  const b = contrastRatio("#ffffff", "#0b6b4f");
  assert.equal(a.toFixed(4), b.toFixed(4));
});

test("bad input throws instead of quietly returning a wrong colour", () => {
  assert.throws(() => hexToRgb("#fff"), /6-digit/);
  assert.throws(() => hexToRgb("rebeccapurple"), /6-digit/);
  assert.throws(() => hexToRgb("oklab(0.93 -0.01 0.003)"), /6-digit/);
});

test("mixing with either end at full strength returns that end", () => {
  assert.equal(mixOklab("#0b6b4f", "#ffffff", 1), "#0b6b4f");
  assert.equal(mixOklab("#0b6b4f", "#ffffff", 0), "#ffffff");
});

/*
 * Ground truth from the browser, not from this implementation: Chrome
 * computed the beginner badge's plate as oklab(0.931061 -0.0117826
 * 0.00285089), which converts to rgb(225, 235, 230). If this ever drifts,
 * the maths here has stopped matching what CSS actually paints, and every
 * assertion built on it is worthless.
 */
test("matches what the browser computes for color-mix(in oklab, …)", () => {
  assert.equal(mixOklab("#0b6b4f", "#ffffff", 0.13), "#e1ebe6");
});
