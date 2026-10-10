/**
 * Runtime design tokens (VIB-246, VIB-247).
 *
 * STOCK restates a few values from globals.css, so the first tests read the
 * stylesheet and fail when the two disagree.
 */
import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  DESIGN_MODES,
  DESIGN_TOKENS,
  DESIGN_TOKEN_NAMES,
  STOCK,
  describeDesignChange,
  designContrastProblem,
  designTokensCss,
  parseDesignTokens,
  withAlpha,
} from "./design-tokens.ts";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

/** The stock hex of one custom property in one mode's block. */
function shipped(mode: (typeof DESIGN_MODES)[number], name: string) {
  const selector = { light: ":root", dark: ".dark" }[mode];
  const start = css.indexOf(`${selector} {`);
  const block = css.slice(start, css.indexOf("\n}", start));
  return block
    .match(new RegExp(`\\s${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1]
    .toLowerCase();
}

test("STOCK matches what globals.css ships", () => {
  for (const mode of DESIGN_MODES) {
    for (const [name, colour] of Object.entries(STOCK[mode])) {
      assert.equal(shipped(mode, name), colour, `${mode} ${name}`);
    }
  }
});

test("linked tokens really do share the stock colour in globals.css", () => {
  for (const mode of DESIGN_MODES) {
    for (const name of DESIGN_TOKEN_NAMES) {
      for (const linked of DESIGN_TOKENS[name].linked) {
        assert.equal(shipped(mode, linked), STOCK[mode][name], `${mode} ${linked}`);
      }
    }
  }
});

test("parseDesignTokens keeps only registered tokens with hex colours", () => {
  assert.deepEqual(
    parseDesignTokens({
      light: { "--background": "#FFEEDD", "--destructive": "#000000" },
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

test("opacity: 8-digit hex is kept, fully opaque collapses to 6", () => {
  assert.equal(withAlpha("#112233", 0.5), "#11223380");
  assert.equal(withAlpha("#11223380", 1), "#112233");
  assert.deepEqual(
    parseDesignTokens({ light: { "--card": "#FFFFFFFF", "--primary": "#0000CC80" } }),
    { light: { "--primary": "#0000cc80" } },
  );
});

test("designTokensCss emits one rule per overridden mode, nothing otherwise", () => {
  assert.equal(designTokensCss({}), "");
  assert.equal(
    designTokensCss({
      light: { "--background": "#ffeedd" },
      dark: { "--background": "#000000" },
    }),
    "html:root:not(.dark){--background:#ffeedd}html.dark{--background:#000000}",
  );
});

test("an override carries its linked and derived tokens", () => {
  assert.equal(
    designTokensCss({ light: { "--card": "#fafafa", "--primary": "#0000cc" } }),
    "html:root:not(.dark){--card:#fafafa;--popover:#fafafa;--sidebar:#fafafa;" +
      "--primary:#0000cc;--ring:#0000cc;--sidebar-primary:#0000cc;" +
      "--primary-hover:color-mix(in oklab,var(--primary) 85%,#000)}",
  );
});

test("designContrastProblem passes stock and refuses an unreadable ground", () => {
  assert.equal(designContrastProblem({}), null);
  assert.equal(designContrastProblem({ light: { "--background": "#ffffff" } }), null);
  assert.match(
    designContrastProblem({ light: { "--background": "#777777" } }) ?? "",
    /Light mode: .* on Page background/,
  );
  assert.match(
    designContrastProblem({ dark: { "--background": "#ffffff" } }) ?? "",
    /Dark mode: .* on Page background/,
  );
});

test("the contrast guard covers card and the label on primary", () => {
  assert.match(
    designContrastProblem({ light: { "--card": "#222222" } }) ?? "",
    /Card text .* on Card/,
  );
  assert.match(
    designContrastProblem({ light: { "--primary": "#ffff00" } }) ?? "",
    /Light mode: Primary/,
  );
});

test("the contrast guard flattens opacity before measuring", () => {
  // Opaque, this blue is fine; at 30% over paper it is too pale to read.
  assert.equal(designContrastProblem({ light: { "--primary": "#0000cc" } }), null);
  assert.match(
    designContrastProblem({ light: { "--primary": "#0000cc4d" } }) ?? "",
    /Light mode: Primary/,
  );
});

test("describeDesignChange names what moved, and is empty when nothing did", () => {
  const empty = { tokens: {}, defaults: {} };
  assert.equal(describeDesignChange(empty, empty), "");
  assert.equal(
    describeDesignChange(empty, {
      tokens: { light: { "--background": "#ffeedd" } },
      defaults: { dark: { "--card": "#000000" } },
    }),
    "Light Page background: #fffff2 to #ffeedd; Dark Card default: #101018 to #000000",
  );
});

test("changing Text is checked on the card too, through its linked token", () => {
  // Reads on paper (4.6:1), but not on a card moved to mid grey.
  assert.equal(designContrastProblem({ light: { "--foreground": "#6b6b6b" } }), null);
  assert.match(
    designContrastProblem({
      light: { "--foreground": "#6b6b6b", "--card": "#d0d0d0" },
    }) ?? "",
    /Card text \(#6b6b6b\) on Card/,
  );
  assert.match(
    designContrastProblem({ dark: { "--muted-foreground": "#444444" } }) ?? "",
    /Dark mode: Muted text/,
  );
});

test("a border override is carried to inputs and never contrast-checked", () => {
  assert.equal(
    designTokensCss({ dark: { "--border": "#ffffff" } }),
    "html.dark{--border:#ffffff;--input:#ffffff;--sidebar-border:#ffffff}",
  );
  assert.equal(designContrastProblem({ dark: { "--border": "#07070c" } }), null);
});

test("strong text carries its linked tokens and is checked on every surface", () => {
  assert.equal(
    designTokensCss({ light: { "--secondary-foreground": "#222222" } }),
    "html:root:not(.dark){--secondary-foreground:#222222;--accent-foreground:#222222;" +
      "--sidebar-accent-foreground:#222222}",
  );
  assert.match(
    designContrastProblem({ light: { "--secondary-foreground": "#bbbbbb" } }) ?? "",
    /Light mode: Strong text/,
  );
});
