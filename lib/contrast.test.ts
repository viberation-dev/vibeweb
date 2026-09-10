/**
 * Palette contrast guard (VIB-97).
 *
 * The dark `--primary` drifted under the 4.5:1 bar as small text, and the
 * naive fix — lifting the blue — silently pushed a white button label under
 * the same bar going the other way. One token serves both roles, so the two
 * constraints pull against each other and a change that fixes one can break
 * the other without anything visibly failing.
 *
 * This reads the shipped tokens straight out of `app/globals.css` rather
 * than restating them, so it fails when the stylesheet changes, not when a
 * copy of it does.
 */
import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

import { contrastRatio, mixOklab } from "./color-contrast.ts";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

/** The text of one top-level block, e.g. everything inside `.dark { … }`. */
function blockOf(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `no ${selector} block in globals.css`);
  return css.slice(start, css.indexOf("\n}", start));
}

/** Pulls the hex custom properties out of one top-level block. */
function palette(selector: string): Record<string, string> {
  const body = blockOf(selector);
  const out: Record<string, string> = {};
  for (const [, name, hex] of body.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    out[name] = hex.toLowerCase();
  }
  return out;
}

/**
 * The percentage inside one `color-mix()` token, read from the stylesheet.
 *
 * Restating it as a constant here was a real bug in the first version of
 * this file: the tests recomputed the mix with their own hardcoded 13% / 70%,
 * so editing the percentage in globals.css changed what shipped without
 * changing what was asserted. A guard that cannot notice the change it is
 * guarding is worse than none, because it reads like cover.
 */
function mixPercent(selector: string, token: string, source: string): number {
  const body = blockOf(selector);

  const pattern = new RegExp(
    String.raw`${token}:\s*color-mix\(\s*in oklab,\s*var\(${source}\)\s*([\d.]+)%`,
  );
  const found = body.match(pattern);
  assert.ok(found, `${selector} ${token} is not an oklab mix of ${source}`);
  return Number(found[1]) / 100;
}

const AA_NORMAL = 4.5;

for (const mode of [":root", ".dark"] as const) {
  test(`${mode}: --primary clears AA as small text on every ground`, () => {
    const p = palette(mode);
    for (const ground of [
      "--background",
      "--card",
      /*
       * --secondary is the one that binds: it is the lightest of the three
       * dark grounds, and the v3 homepage (VIB-98) sets text-primary on it
       * throughout — section links, card CTAs, eyebrows. Checking only
       * --background and --card passes a token that still fails in place.
       */
      "--secondary",
    ] as const) {
      const r = contrastRatio(p["--primary"], p[ground]);
      assert.ok(
        r >= AA_NORMAL,
        `${p["--primary"]} on ${ground} ${p[ground]} is ${r.toFixed(2)}:1, under ${AA_NORMAL}`,
      );
    }
  });

  test(`${mode}: --primary-foreground clears AA on a --primary fill`, () => {
    const p = palette(mode);
    const r = contrastRatio(p["--primary-foreground"], p["--primary"]);
    assert.ok(
      r >= AA_NORMAL,
      `label ${p["--primary-foreground"]} on ${p["--primary"]} is ${r.toFixed(2)}:1, under ${AA_NORMAL}`,
    );
  });
}

/*
 * Difficulty badges (VIB-103).
 *
 * These build their own background: the plate is
 * `color-mix(in oklab, <colour> 13%, var(--card))`, so the pair to check is
 * the colour against a mix of itself and the card. That is why this needs
 * real Oklab maths rather than two hex values — and why the failure hid for
 * so long, since eyeballing a token list tells you nothing about it.
 */
const DIFFICULTY_LEVELS = [
  "--difficulty-beginner",
  "--difficulty-intermediate",
  "--difficulty-advanced",
] as const;

/** Non-text contrast (WCAG 1.4.11) — boundaries, icons, graphical objects. */
const AA_NON_TEXT = 3;

for (const mode of [":root", ".dark"] as const) {
  test(`${mode}: every difficulty badge clears AA on its own plate`, () => {
    const p = palette(mode);

    for (const level of DIFFICULTY_LEVELS) {
      const colour = p[level];
      assert.ok(colour, `${mode} is missing ${level}`);

      const plate = mixOklab(
        colour,
        p["--card"],
        mixPercent(mode, `${level}-bg`, level),
      );
      const r = contrastRatio(colour, plate);

      assert.ok(
        r >= AA_NORMAL,
        `${level} ${colour} on its plate ${plate} is ${r.toFixed(2)}:1, under ${AA_NORMAL}`,
      );
    }
  });
}

/*
 * Badge borders against the surface the badge sits on (VIB-105).
 *
 * The outer edge is the one that makes the badge read as a bounded object,
 * so that is the pair checked. The inner edge — border against its own plate
 * — sits near 2.8:1 on purpose: taking it to 3:1 as well would need a border
 * close to the full colour, turning a soft status tint into a hard outlined
 * chip. A badge is a static label, not an interactive control.
 */
for (const mode of [":root", ".dark"] as const) {
  test(`${mode}: every difficulty border reads as an edge against the card`, () => {
    const p = palette(mode);

    for (const level of DIFFICULTY_LEVELS) {
      const border = mixOklab(
        p[level],
        p["--card"],
        mixPercent(mode, `${level}-border`, level),
      );
      const r = contrastRatio(border, p["--card"]);

      assert.ok(
        r >= AA_NON_TEXT,
        `${level} border ${border} on --card ${p["--card"]} is ${r.toFixed(2)}:1, under ${AA_NON_TEXT}`,
      );
    }
  });
}
