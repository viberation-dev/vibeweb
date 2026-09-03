/**
 * Where a tool runs (VIB-87).
 *
 * A controlled vocabulary, matched by the CHECK constraint on
 * `tools.platform` in migration 19 — the stored values are these slugs, and
 * the labels here are the only place they are spelled for a reader. Without
 * that pairing "macOS", "Mac" and "OSX" all end up in the column and a
 * platform filter silently splits into three.
 *
 * Order is display order: desktop first, since the directory is mostly
 * developer tooling, then web, then mobile.
 *
 * Pure and alias-free so it runs under plain `node --test`.
 */
export const TOOL_PLATFORMS = [
  { value: "macos", label: "macOS" },
  { value: "windows", label: "Windows" },
  { value: "linux", label: "Linux" },
  { value: "web", label: "Web" },
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
] as const;

export type ToolPlatform = (typeof TOOL_PLATFORMS)[number]["value"];

/** Every allowed value — mirrors the CHECK constraint. */
export const TOOL_PLATFORM_VALUES: readonly string[] = TOOL_PLATFORMS.map((p) => p.value);

/** Narrows an untrusted value to a real platform, or undefined. */
export function toToolPlatform(value: string | undefined): ToolPlatform | undefined {
  return TOOL_PLATFORMS.some((p) => p.value === value) ? (value as ToolPlatform) : undefined;
}

/**
 * "macOS · Windows · Linux" for the key-info row.
 *
 * Ordered by TOOL_PLATFORMS rather than by however the array came back, so
 * two tools with the same platforms always read the same way. Unknown values
 * are dropped rather than printed raw — the CHECK should make that
 * impossible, but a row written before the constraint would otherwise show a
 * slug to a reader.
 */
export function platformSummary(platforms: readonly string[]): string {
  return TOOL_PLATFORMS.filter((p) => platforms.includes(p.value))
    .map((p) => p.label)
    .join(" · ");
}
