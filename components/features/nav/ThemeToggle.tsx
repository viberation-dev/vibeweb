"use client";

import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import {
  DARK_CLASS,
  resolveTheme,
  THEME_MODES,
  THEME_STORAGE_KEY,
  toThemeMode,
  type ThemeMode,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const ICONS = {
  light: IconSun,
  dark: IconMoon,
  system: IconDeviceDesktop,
} as const;
const LABELS = { light: "Light", dark: "Dark", system: "System" } as const;

function apply(mode: ThemeMode) {
  const dark = resolveTheme(
    mode,
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  document.documentElement.classList.toggle(DARK_CLASS, dark === "dark");
  document.documentElement.style.colorScheme = dark;
}

/**
 * Light / dark / system control (VIB-73).
 *
 * The mode is already applied before this renders — the inline script in the
 * layout does that, so there is no flash. This only handles *changing* it.
 *
 * Reads storage in an effect rather than during render on purpose: the
 * server has no localStorage, so rendering the stored value directly would
 * be a hydration mismatch. Until the effect runs the control shows the
 * default, which is what the markup says too.
 */
export function ThemeToggle({
  orientation = "horizontal",
}: {
  /** `vertical` is the fixed left rail on the marketing pages (VIB-98). */
  orientation?: "horizontal" | "vertical";
} = {}) {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    try {
      setMode(toThemeMode(localStorage.getItem(THEME_STORAGE_KEY)));
    } catch {
      // Site data blocked. The default stands and nothing here needs to fail.
    }
  }, []);

  /*
   * While on "system", the OS can change under us — at sunset, or when
   * someone flips their laptop's appearance. Without this the page keeps
   * whatever it painted at load, which is the one case "system" exists to
   * handle.
   */
  useEffect(() => {
    if (mode !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [mode]);

  function choose(next: ThemeMode) {
    setMode(next);
    apply(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Blocked storage means the choice lasts this page only. Applying it
      // still works, so the click is not silently ignored.
    }
  }

  return (
    <div
      role="group"
      aria-label="Colour mode"
      className={cn(
        "flex gap-0.5",
        /* The rail supplies the padding in vertical form, so the control
           does not add a second ring of it inside the pill. A track behind
           the horizontal form is what makes it read as one three-way
           switch rather than three loose words (VIB-177). */
        orientation === "vertical"
          ? "flex-col"
          : "bg-muted w-fit gap-1 rounded-full border p-1",
      )}
    >
      {THEME_MODES.map((value) => {
        const Icon = ICONS[value];
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => choose(value)}
            aria-pressed={active}
            title={LABELS[value]}
            className={cn(
              "group flex items-center justify-center rounded text-xs transition-colors",
              orientation === "vertical"
                ? "size-9.5 rounded-full"
                : "rounded-full px-2 py-1.5",
              /*
                Active is the brand fill, per the mockup's `.tgl` — the
                shipped state was --accent, a muted surface that read as
                "hovered" rather than "selected".
              */
              active
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
            )}
          >
            <Icon aria-hidden className="size-3.5" />
            {/* The rail is icon-only — three stacked words is a column of
                text, not a control. `title` already names each one.
                Horizontally the label slides out on hover or focus and stays
                out on the active mode (VIB-177). Collapsed with max-width, not
                display:none, so screen readers still get the name. */}
            {orientation === "vertical" ? null : (
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all motion-reduce:transition-none",
                  active
                    ? "ml-1.5 max-w-16"
                    : "max-w-0 opacity-0 group-hover:ml-1.5 group-hover:max-w-16 group-hover:opacity-100 group-focus-visible:ml-1.5 group-focus-visible:max-w-16 group-focus-visible:opacity-100",
                )}
              >
                {LABELS[value]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
