/**
 * Estimated reading time, in whole minutes (VIB-198).
 *
 * Shown in the article header and on every resource card, so the same row
 * has to produce the same number everywhere — which is why it is computed
 * from the stored content rather than measured in the browser. A client-side
 * count would differ between the card (no body in hand) and the page.
 *
 * 200 wpm is the long-standing figure for adult reading of general prose and
 * is what Medium, Substack and Vercel's docs all land near. Code and prompt
 * blocks are read far slower than prose but are usually skimmed or copied,
 * so they count as words like everything else rather than carrying their own
 * multiplier — a guess with a knob is worse than a plain average.
 *
 * Alias-free imports: reading-time.test.ts runs under
 * `node --experimental-strip-types`, which does not resolve `@/` for value
 * imports.
 */

const WORDS_PER_MINUTE = 200;

/** Words in one string. Splits on any whitespace run; empty means zero. */
function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/**
 * Walks an authored `blocks` value and totals every readable string.
 *
 * Structural, not validated: this runs on list pages that never parse the
 * blocks, and a row whose blocks do not match the schema should still get a
 * sensible number rather than zero. Unknown block kinds contribute whatever
 * strings they carry, which is the right default for a kind added later.
 */
function countBlockWords(value: unknown): number {
  if (Array.isArray(value)) {
    return value.reduce<number>((total, item) => total + countBlockWords(item), 0);
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce<number>(
      (total, [key, inner]) => {
        // `kind`, `language`, `key` and friends are machine fields, not prose.
        if (key === "kind" || key === "language" || key === "key" || key === "detect") {
          return total;
        }
        return total + countBlockWords(inner);
      },
      0,
    );
  }
  return typeof value === "string" ? countWords(value) : 0;
}

/**
 * Minutes to read a piece, from its plain body, its blocks, or both.
 *
 * Never returns 0: a one-line cheatsheet still takes a moment, and "0 min
 * read" reads as a bug rather than as brevity.
 */
export function readingMinutes(body: string | null, blocks?: unknown): number {
  const words = (body ? countWords(body) : 0) + countBlockWords(blocks);
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** "6 min read" — the label used in the header and on cards. */
export function readingTimeLabel(body: string | null, blocks?: unknown): string {
  return `${readingMinutes(body, blocks)} min read`;
}
