/**
 * Design tokens staff can change from /admin/settings (VIB-246).
 *
 * `app/globals.css` stays the design system. This is the short list of its
 * custom properties that may be overridden at runtime, stored as
 * `site_settings.design_tokens` and emitted by the root layout as a style
 * block on top of the stylesheet.
 *
 * To make another token editable, add it to DESIGN_TOKENS and give STOCK its
 * shipped values. The form, the validation and the override all read this
 * list, so nothing else changes and no migration is needed.
 *
 * Alias-free and dependency-free so it runs under plain `node --test`, for
 * the same reason lib/theme.ts is.
 */
import { contrastRatio } from "./color-contrast.ts";

export const DESIGN_MODES = ["light", "dark"] as const;
export type DesignMode = (typeof DESIGN_MODES)[number];

/**
 * The editable tokens. `readable` names the text colours that are set
 * directly on this one, so a save cannot make them unreadable.
 */
export const DESIGN_TOKENS = {
  "--background": {
    label: "Page background",
    readable: ["--foreground", "--muted-foreground", "--primary"],
  },
} as const satisfies Record<string, { label: string; readable: readonly string[] }>;

export type DesignTokenName = keyof typeof DESIGN_TOKENS;

export const DESIGN_TOKEN_NAMES = Object.keys(DESIGN_TOKENS) as [
  DesignTokenName,
  ...DesignTokenName[],
];

/**
 * What globals.css ships, for the editable tokens and the ones they are
 * checked against. lib/design-tokens.test.ts reads the stylesheet and fails
 * if these drift from it.
 */
export const STOCK: Record<DesignMode, Record<string, string>> = {
  light: {
    "--background": "#fffff2",
    "--foreground": "#1a1a18",
    "--muted-foreground": "#5a5a54",
    "--primary": "#011aff",
  },
  dark: {
    "--background": "#07070c",
    "--foreground": "#f2f2f5",
    "--muted-foreground": "#9c9caa",
    "--primary": "#6072ff",
  },
};

/** Overrides only: a token left at its stock value is absent. */
export type DesignTokens = Partial<
  Record<DesignMode, Partial<Record<DesignTokenName, string>>>
>;

export const HEX_COLOUR = /^#[0-9a-f]{6}$/i;

/** WCAG AA for normal-size text. */
const AA_NORMAL = 4.5;

/** The form field for one token in one mode. */
export function designFieldName(mode: DesignMode, name: DesignTokenName): string {
  return `design_tokens.${mode}.${name}`;
}

/**
 * Narrows the stored JSON to known tokens with valid colours, minus anything
 * equal to stock.
 *
 * The result goes into a <style> block, so nothing reaches it that is not a
 * registered name and a 6-digit hex, whatever the column holds.
 */
export function parseDesignTokens(value: unknown): DesignTokens {
  const out: DesignTokens = {};
  if (!value || typeof value !== "object") return out;

  for (const mode of DESIGN_MODES) {
    const stored = (value as Record<string, unknown>)[mode];
    if (!stored || typeof stored !== "object") continue;

    for (const name of DESIGN_TOKEN_NAMES) {
      const colour = (stored as Record<string, unknown>)[name];
      if (typeof colour !== "string" || !HEX_COLOUR.test(colour)) continue;
      if (colour.toLowerCase() === STOCK[mode][name]) continue;
      (out[mode] ??= {})[name] = colour.toLowerCase();
    }
  }
  return out;
}

/** The colour in force for a token: the override, or what globals.css ships. */
export function resolveDesignToken(
  tokens: DesignTokens,
  mode: DesignMode,
  name: DesignTokenName,
): string {
  return tokens[mode]?.[name] ?? STOCK[mode][name];
}

/**
 * The override stylesheet, or "" when nothing is overridden.
 *
 * `html:root` and `html.dark` rather than `:root` and `.dark`: one notch more
 * specific than globals.css, so the override wins wherever the two end up in
 * <head>.
 */
export function designTokensCss(tokens: DesignTokens): string {
  const selectors: Record<DesignMode, string> = {
    light: "html:root",
    dark: "html.dark",
  };

  return DESIGN_MODES.map((mode) => {
    const declarations = Object.entries(tokens[mode] ?? {})
      .map(([name, colour]) => `${name}:${colour}`)
      .join(";");
    return declarations ? `${selectors[mode]}{${declarations}}` : "";
  }).join("");
}

/**
 * The first text colour that drops under 4.5:1 on an overridden token, as a
 * sentence for the form. Null when everything still reads.
 */
export function designContrastProblem(tokens: DesignTokens): string | null {
  for (const mode of DESIGN_MODES) {
    const colours: Record<string, string> = { ...STOCK[mode], ...tokens[mode] };

    for (const name of DESIGN_TOKEN_NAMES) {
      for (const text of DESIGN_TOKENS[name].readable) {
        const ratio = contrastRatio(colours[text], colours[name]);
        if (ratio < AA_NORMAL) {
          return `${DESIGN_TOKENS[name].label}, ${mode}: ${colours[name]} leaves ${text} (${colours[text]}) at ${ratio.toFixed(1)}:1. Text needs ${AA_NORMAL}:1 to stay readable.`;
        }
      }
    }
  }
  return null;
}
