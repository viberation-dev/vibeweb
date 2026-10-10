/**
 * Design tokens staff can change from /admin/settings (VIB-246, VIB-247).
 *
 * `app/globals.css` stays the design system. This is the short list of its
 * custom properties that may be overridden at runtime, stored as
 * `site_settings.design_tokens` and emitted by the root layout as a style
 * block on top of the stylesheet.
 *
 * To make another token editable, add it to DESIGN_TOKENS, give STOCK its
 * shipped values, and add a CONTRAST_CHECKS line for any text that sits on
 * it. The form, the validation, the history and the override all read this
 * file, so nothing else changes and no migration is needed.
 *
 * Alias-free and dependency-free so it runs under plain `node --test`, for
 * the same reason lib/theme.ts is.
 */
import { contrastRatio, hexToRgb, rgbToHex } from "./color-contrast.ts";

export const DESIGN_MODES = ["light", "dark"] as const;
export type DesignMode = (typeof DESIGN_MODES)[number];

export const DESIGN_MODE_LABELS: Record<DesignMode, string> = {
  light: "Light",
  dark: "Dark",
};

type TokenSpec = {
  label: string;
  /** Tokens globals.css sets to the same colour, which follow an override. */
  linked: readonly string[];
  /** Tokens computed from this one, as the CSS to emit per mode. */
  derived?: Record<string, Record<DesignMode, string>>;
};

export const DESIGN_TOKENS = {
  "--background": { label: "Page background", linked: [] },
  "--card": { label: "Card", linked: ["--popover", "--sidebar"] },
  "--border": { label: "Border", linked: ["--input", "--sidebar-border"] },
  "--foreground": {
    label: "Text",
    linked: ["--card-foreground", "--popover-foreground", "--sidebar-foreground"],
  },
  "--secondary-foreground": {
    label: "Strong text",
    linked: ["--accent-foreground", "--sidebar-accent-foreground"],
  },
  "--muted-foreground": { label: "Muted text", linked: [] },
  "--primary": {
    label: "Primary",
    linked: ["--ring", "--sidebar-primary"],
    // Hover is a colour swap, never opacity: darker in light, lighter in dark.
    derived: {
      "--primary-hover": {
        light: "color-mix(in oklab,var(--primary) 85%,#000)",
        dark: "color-mix(in oklab,var(--primary) 88%,#fff)",
      },
    },
  },
} as const satisfies Record<string, TokenSpec>;

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
    "--card": "#ffffff",
    "--card-foreground": "#1a1a18",
    "--border": "#e3e3d2",
    "--muted-foreground": "#5a5a54",
    "--primary": "#011aff",
    "--primary-foreground": "#ffffff",
    "--secondary": "#f2f2e4",
    "--secondary-foreground": "#050505",
  },
  dark: {
    "--background": "#07070c",
    "--foreground": "#f2f2f5",
    "--card": "#101018",
    "--card-foreground": "#f2f2f5",
    "--border": "#23232e",
    "--muted-foreground": "#9c9caa",
    "--primary": "#6072ff",
    "--primary-foreground": "#07070c",
    "--secondary": "#16161f",
    "--secondary-foreground": "#ffffff",
  },
};

/** The design system's own colours, offered as swatches in the picker. */
export const DESIGN_PRESETS = [
  { label: "Paper", colour: "#fffff2" },
  { label: "White", colour: "#ffffff" },
  { label: "Sand", colour: "#f2f2e4" },
  { label: "Ink", colour: "#050505" },
  { label: "Night", colour: "#07070c" },
  { label: "Slate", colour: "#101018" },
  { label: "Blue", colour: "#011aff" },
  { label: "Bright blue", colour: "#6072ff" },
  { label: "Lime", colour: "#e4ff1a" },
] as const;

/** Overrides only: a token left at its stock value is absent. */
export type DesignTokens = Partial<
  Record<DesignMode, Partial<Record<DesignTokenName, string>>>
>;

/** The two things a save can change: the colours in force, and the defaults. */
export type DesignState = { tokens: DesignTokens; defaults: DesignTokens };

/** #rrggbb, or #rrggbbaa for a colour with opacity. */
export const HEX_COLOUR = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;

/** Lower case, and without the alpha pair when it is fully opaque. */
export function normaliseColour(colour: string): string {
  const value = colour.toLowerCase();
  return value.length === 9 && value.endsWith("ff") ? value.slice(0, 7) : value;
}

/** 0–1. */
export function colourAlpha(colour: string): number {
  return colour.length === 9 ? parseInt(colour.slice(7), 16) / 255 : 1;
}

/** The same colour at a new opacity, 0–1. */
export function withAlpha(colour: string, alpha: number): string {
  const pair = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return normaliseColour(colour.slice(0, 7) + pair);
}

/** The settings columns the two halves of DesignState are stored in. */
export type DesignFieldGroup = "design_tokens" | "design_token_defaults";

/** The form field for one token in one mode. */
export function designFieldName(
  group: DesignFieldGroup,
  mode: DesignMode,
  name: DesignTokenName,
): string {
  return `${group}.${mode}.${name}`;
}

/** One group's fields out of a submitted form, as the shape the schema takes. */
export function designTokensFromForm(
  form: { get(key: string): unknown },
  group: DesignFieldGroup,
): Record<DesignMode, Record<string, unknown>> {
  return Object.fromEntries(
    DESIGN_MODES.map((mode) => [
      mode,
      Object.fromEntries(
        DESIGN_TOKEN_NAMES.map((name) => [
          name,
          form.get(designFieldName(group, mode, name)) ?? undefined,
        ]),
      ),
    ]),
  ) as Record<DesignMode, Record<string, unknown>>;
}

/**
 * Narrows the stored JSON to known tokens with valid colours, minus anything
 * equal to stock.
 *
 * The result goes into a <style> block, so nothing reaches it that is not a
 * registered name and a hex colour, whatever the column holds.
 */
export function parseDesignTokens(value: unknown): DesignTokens {
  const out: DesignTokens = {};
  if (!value || typeof value !== "object") return out;

  for (const mode of DESIGN_MODES) {
    const stored = (value as Record<string, unknown>)[mode];
    if (!stored || typeof stored !== "object") continue;

    for (const name of DESIGN_TOKEN_NAMES) {
      const raw = (stored as Record<string, unknown>)[name];
      if (typeof raw !== "string" || !HEX_COLOUR.test(raw)) continue;

      const colour = normaliseColour(raw);
      if (colour === STOCK[mode][name]) continue;
      (out[mode] ??= {})[name] = colour;
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
 * Both selectors are one notch more specific than globals.css, so the
 * override wins wherever the two end up in <head>. The light one excludes
 * `.dark`: without that it outranks the stock `.dark` block too, and a
 * light-only override paints over dark mode.
 */
export function designTokensCss(tokens: DesignTokens): string {
  const selectors: Record<DesignMode, string> = {
    light: "html:root:not(.dark)",
    dark: "html.dark",
  };

  return DESIGN_MODES.map((mode) => {
    const declarations = Object.entries(tokens[mode] ?? {})
      .flatMap(([name, colour]) => {
        const spec: TokenSpec = DESIGN_TOKENS[name as DesignTokenName];
        return [
          `${name}:${colour}`,
          ...spec.linked.map((linked) => `${linked}:${colour}`),
          ...Object.entries(spec.derived ?? {}).map(
            ([derived, css]) => `${derived}:${css[mode]}`,
          ),
        ];
      })
      .join(";");
    return declarations ? `${selectors[mode]}{${declarations}}` : "";
  }).join("");
}

/** WCAG AA for normal-size text. */
const AA_NORMAL = 4.5;

/**
 * What the browser paints behind a see-through page background.
 * ponytail: Chrome's values; other engines differ by a shade, which only
 * matters to a background that is mostly transparent.
 */
const CANVAS: Record<DesignMode, string> = { light: "#ffffff", dark: "#121212" };

/** Text token, then the ground it is set on. */
const CONTRAST_CHECKS: readonly (readonly [string, string])[] = [
  ["--foreground", "--background"],
  ["--muted-foreground", "--background"],
  ["--primary", "--background"],
  ["--card-foreground", "--card"],
  ["--muted-foreground", "--card"],
  ["--primary", "--card"],
  ["--primary", "--secondary"],
  ["--secondary-foreground", "--background"],
  ["--secondary-foreground", "--card"],
  ["--secondary-foreground", "--secondary"],
  ["--primary-foreground", "--primary"],
];

const CONTRAST_LABELS: Record<string, string> = {
  "--card-foreground": "Card text",
  "--primary-foreground": "Button label",
  "--secondary": "Muted surface",
};

const contrastLabel = (name: string) =>
  CONTRAST_LABELS[name] ?? DESIGN_TOKENS[name as DesignTokenName].label;

/** `top` painted over an opaque `bottom`, as an opaque colour. */
function over(top: string, bottom: string): string {
  const alpha = colourAlpha(top);
  const [t, b] = [hexToRgb(top.slice(0, 7)), hexToRgb(bottom)];
  return rgbToHex([0, 1, 2].map((i) => t[i] * alpha + b[i] * (1 - alpha)) as [
    number,
    number,
    number,
  ]);
}

/**
 * The first text colour that drops under 4.5:1 on its ground, as a sentence
 * for the form. Null when everything still reads.
 *
 * Border is not checked: the shipped one is a 1.3:1 hairline by design, so
 * there is no bar to hold a replacement to.
 *
 * Colours with opacity are flattened first, the way they are painted: the
 * page background over the browser canvas, everything else over the page
 * background, and text over its own ground.
 */
export function designContrastProblem(tokens: DesignTokens): string | null {
  for (const mode of DESIGN_MODES) {
    const colours: Record<string, string> = { ...STOCK[mode] };
    // An override moves its linked tokens too, so they are checked as moved.
    for (const [name, colour] of Object.entries(tokens[mode] ?? {})) {
      colours[name] = colour;
      for (const linked of DESIGN_TOKENS[name as DesignTokenName].linked) {
        colours[linked] = colour;
      }
    }
    const page = over(colours["--background"], CANVAS[mode]);
    const flat = (name: string) =>
      name === "--background" ? page : over(colours[name], page);

    for (const [text, ground] of CONTRAST_CHECKS) {
      const ratio = contrastRatio(over(colours[text], flat(ground)), flat(ground));
      if (ratio < AA_NORMAL) {
        return `${DESIGN_MODE_LABELS[mode]} mode: ${contrastLabel(text)} (${colours[text]}) on ${contrastLabel(ground)} (${colours[ground]}) is ${ratio.toFixed(1)}:1. It needs ${AA_NORMAL}:1 to stay readable.`;
      }
    }
  }
  return null;
}

/**
 * What a save changed, as a line for the history list. "" when nothing did.
 */
export function describeDesignChange(before: DesignState, after: DesignState): string {
  const changes: string[] = [];

  for (const [group, suffix] of [
    ["tokens", ""],
    ["defaults", " default"],
  ] as const) {
    for (const mode of DESIGN_MODES) {
      for (const name of DESIGN_TOKEN_NAMES) {
        const was = resolveDesignToken(before[group], mode, name);
        const now = resolveDesignToken(after[group], mode, name);
        if (was !== now) {
          changes.push(
            `${DESIGN_MODE_LABELS[mode]} ${DESIGN_TOKENS[name].label}${suffix}: ${was} to ${now}`,
          );
        }
      }
    }
  }
  return changes.join("; ");
}
