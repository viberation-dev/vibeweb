/**
 * Light / dark mode (VIB-73).
 *
 * Pure and alias-free so it runs under plain `node --test`. The rules for
 * "which mode is actually showing" live here rather than in the component,
 * because they are the part that goes wrong quietly: a wrong answer renders
 * a readable page in the wrong colours, and nothing throws.
 *
 * Blue/Lime is the only member-facing theme (VIB-72), so mode is the whole
 * of the user's choice — no theme axis, and no `profiles` column.
 */

/** What the user can choose. `system` follows the OS and is the default. */
export const THEME_MODES = ["light", "dark", "system"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

/** What actually gets painted. `system` resolves to one of these. */
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "viberation-theme";

/** The class the stylesheet keys off — Tailwind v4 `@custom-variant dark`. */
export const DARK_CLASS = "dark";

/**
 * Narrows an untrusted stored value to a mode.
 *
 * `localStorage` is shared with every extension and every past version of
 * this app, so the value can be anything at all — including `null` on a
 * first visit or in a browser that blocks storage.
 */
export function toThemeMode(value: string | null | undefined): ThemeMode {
  return THEME_MODES.includes(value as ThemeMode)
    ? (value as ThemeMode)
    : "system";
}

/**
 * The mode that should actually paint.
 *
 * `system` is not a third colour scheme — it defers to the OS, which is why
 * it is the default: a visitor whose machine is dark should not be handed a
 * light site before touching anything.
 */
export function resolveTheme(
  mode: ThemeMode,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (mode === "system") return systemPrefersDark ? "dark" : "light";
  return mode;
}

/**
 * The script that runs before first paint, inlined into <head>.
 *
 * Without it the server renders light, the client corrects on hydration, and
 * a dark-mode visitor gets a white flash on every navigation. It has to be
 * synchronous and blocking for that reason — an effect runs too late.
 *
 * Wrapped in try/catch because reading `localStorage` *throws* rather than
 * returning null when a browser blocks site data. An exception here would
 * abort the whole inline script and take `color-scheme` down with it.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var m=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
if(m!=="light"&&m!=="dark")m="system";
var d=m==="dark"||(m==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
var e=document.documentElement;
e.classList.toggle(${JSON.stringify(DARK_CLASS)},d);
e.style.colorScheme=d?"dark":"light";
}catch(_){}})();`;
