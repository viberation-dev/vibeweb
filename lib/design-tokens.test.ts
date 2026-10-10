/**
 * Runtime design tokens (VIB-246).
 *
 * STOCK restates a few values from globals.css, so the first test reads the
 * stylesheet and fails when the two disagree.
 */
import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  DESIGN_MODES,
  STOCK,
  designContrastProblem,
  designTokensCss,
  parseDesignTokens,
} from "./design-tokens.ts";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

test("STOCK matches what globals.css ships", () => {
  const selectors = { light: ":root", dark: ".dark" } as const;

  for (const mode of DESIGN_MODES) {
    const start = css.indexOf(`${selectors[mode]} {`);
    const block = css.slice(start, css.indexOf("\n}", start));

    for (const [name, colour] of Object.entries(STOCK[mode])) {
      const found = block.match(new RegExp(`\\s${name}:\\s*(#[0-9a-fA-F]{6})`));
      assert.equal(found?.[1].toLowerCase(), colour, `${mode} ${name}`);
    }
  }
});

test("parseDesignTokens keeps only registered tokens with hex colours", () => {
  assert.deepEqual(
    parseDesignTokens({
      light: { "--background": "#FFEEDD", "--card": "#000000" },
      dark: { "--background": "red;} body{display:none" },
      sepia: { "--background": "#112233" },
    }),
    { light: { "--background": "#ffeedd" } },
  );
  assert.deepEqual(parseDesignTokens(null), {});
  assert.deepEqual(parseDesignTokens("nope"), {});
});

test("a token set back to its stock colour is not an override", () => {
  assert.deepEqual(
    parseDesignTokens({ light: { "--background": STOCK.light["--background"] } }),
    {},
  );
});

test("designTokensCss emits one rule per overridden mode, nothing otherwise", () => {
  assert.equal(designTokensCss({}), "");
  assert.equal(
    designTokensCss({
      light: { "--background": "#ffeedd" },
      dark: { "--background": "#000000" },
    }),
    "html:root{--background:#ffeedd}html.dark{--background:#000000}",
  );
});

test("designContrastProblem passes stock and refuses an unreadable ground", () => {
  assert.equal(designContrastProblem({}), null);
  assert.equal(designContrastProblem({ light: { "--background": "#ffffff" } }), null);
  assert.match(
    designContrastProblem({ light: { "--background": "#777777" } }) ?? "",
    /Page background, light/,
  );
  assert.match(
    designContrastProblem({ dark: { "--background": "#ffffff" } }) ?? "",
    /Page background, dark/,
  );
});
