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

/** Pulls the hex custom properties out of one top-level block. */
function palette(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `no ${selector} block in globals.css`);
  const body = css.slice(start, css.indexOf("\n}", start));
  const out: Record<string, string> = {};
  for (const [, name, hex] of body.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    out[name] = hex.toLowerCase();
  }
  return out;
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

/** Matches the `13%` in globals.css. Both must move together. */
const PLATE_MIX = 0.13;

for (const mode of [":root", ".dark"] as const) {
  test(`${mode}: every difficulty badge clears AA on its own plate`, () => {
    const p = palette(mode);

    for (const level of DIFFICULTY_LEVELS) {
      const colour = p[level];
      assert.ok(colour, `${mode} is missing ${level}`);

      const plate = mixOklab(colour, p["--card"], PLATE_MIX);
      const r = contrastRatio(colour, plate);

      assert.ok(
        r >= AA_NORMAL,
        `${level} ${colour} on its plate ${plate} is ${r.toFixed(2)}:1, under ${AA_NORMAL}`,
      );
    }
  });
}
