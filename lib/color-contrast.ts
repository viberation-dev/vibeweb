/*
 * WCAG contrast and Oklab mixing.
 *
 * Alias-free and dependency-free so it runs under plain `node --test`, for
 * the same reason lib/theme.ts and lib/nav.ts are.
 *
 * `mixOklab` exists because the difficulty badges build their background out
 * of their own foreground — `color-mix(in oklab, <colour> 13%, var(--card))`
 * — so checking those pairs means reproducing what the browser does. Getting
 * this wrong is not hypothetical: an auditor that read `oklab(...)` as if it
 * were RGB reported a near-white plate as near-black and invented a failure
 * that was not there (VIB-103).
 */

type Rgb = [number, number, number];

/** "#rrggbb" → 0–1 channels. Throws rather than guessing at bad input. */
export function hexToRgb(hex: string): Rgb {
  const value = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    throw new Error(`hexToRgb: not a 6-digit hex colour: ${hex}`);
  }
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255) as Rgb;
}

export function rgbToHex([r, g, b]: Rgb): string {
  const channel = (c: number) =>
    Math.round(Math.max(0, Math.min(1, c)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

const toGamma = (c: number) => {
  const v = Math.max(0, Math.min(1, c));
  return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
};

/** WCAG 2.x relative luminance. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, 1–21. Order of the arguments does not matter. */
export function contrastRatio(a: string, b: string): number {
  const [x, y] = [relativeLuminance(a) + 0.05, relativeLuminance(b) + 0.05];
  return Math.max(x, y) / Math.min(x, y);
}

function rgbToOklab([r, g, b]: Rgb): Rgb {
  const [lr, lg, lb] = [r, g, b].map(toLinear);
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const [l_, m_, s_] = [Math.cbrt(l), Math.cbrt(m), Math.cbrt(s)];
  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ];
}

function oklabToRgb([L, a, b]: Rgb): Rgb {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const [l, m, s] = [l_ ** 3, m_ ** 3, s_ ** 3];
  return [
    toGamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    toGamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    toGamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

/**
 * CSS `color-mix(in oklab, a <ratio>, b)`.
 *
 * `ratio` is a's share, 0–1. Both inputs are assumed opaque, which every
 * caller in this repo is.
 */
export function mixOklab(a: string, b: string, ratio: number): string {
  const A = rgbToOklab(hexToRgb(a));
  const B = rgbToOklab(hexToRgb(b));
  return rgbToHex(
    oklabToRgb([0, 1, 2].map((i) => A[i] * ratio + B[i] * (1 - ratio)) as Rgb),
  );
}
