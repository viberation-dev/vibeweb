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

/** WCAG 2.x relative luminance. */
function luminance(hex: string): number {
  const ch = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

function ratio(a: string, b: string): number {
  const [x, y] = [luminance(a) + 0.05, luminance(b) + 0.05];
  return Math.max(x, y) / Math.min(x, y);
}

const AA_NORMAL = 4.5;

for (const mode of [":root", ".dark"] as const) {
  test(`${mode}: --primary clears AA as small text, both grounds`, () => {
    const p = palette(mode);
    for (const ground of ["--background", "--card"] as const) {
      const r = ratio(p["--primary"], p[ground]);
      assert.ok(
        r >= AA_NORMAL,
        `${p["--primary"]} on ${ground} ${p[ground]} is ${r.toFixed(2)}:1, under ${AA_NORMAL}`,
      );
    }
  });

  test(`${mode}: --primary-foreground clears AA on a --primary fill`, () => {
    const p = palette(mode);
    const r = ratio(p["--primary-foreground"], p["--primary"]);
    assert.ok(
      r >= AA_NORMAL,
      `label ${p["--primary-foreground"]} on ${p["--primary"]} is ${r.toFixed(2)}:1, under ${AA_NORMAL}`,
    );
  });
}
