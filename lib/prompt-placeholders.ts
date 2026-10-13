/*
 * The blanks in a prompt, and what goes in them.
 *
 * Alias-free and dependency-free so it runs under plain `node --test`, the
 * same constraint as lib/whats-new.ts. The type is restated rather than
 * imported from lib/validation/blocks.ts for that reason; the schema there is
 * what guarantees a stored hint has this shape.
 */

export type PlaceholderHint = {
  /** The blank exactly as it appears in the prompt, brackets included. */
  token: string;
  /**
   * The words before the blank on its line, without the colon ("Tone of
   * voice"). Names the blank for the reader, and tells two identical tokens
   * in one prompt apart.
   */
  label?: string;
  /** One sentence on what to put there. */
  tip: string;
  /** Example answers. The first one is what the filled-in example shows. */
  options: string[];
  /**
   * The answer for each value of a walkthrough setting, where the reader has
   * already told the page. A blank with one is filled in for them, in the
   * prompt they see and the prompt they copy, so they are not asked twice.
   */
  setting?: { owner?: Record<string, string> };
};

export type PromptSegment =
  /** Plain text. `filled` marks a blank the page answered from a setting. */
  | { text: string; hint?: undefined; filled?: true }
  | { text: string; hint: PlaceholderHint; hintIndex: number };

const BLANK = /\[[^\[\]\n]+\]/g;

/** The text between the start of the line and the blank, as a label. */
function leadOf(prompt: string, index: number): string {
  const lineStart = prompt.lastIndexOf("\n", index - 1) + 1;
  return prompt.slice(lineStart, index).trim().replace(/:$/, "").trim();
}

/**
 * Splits a prompt into plain text and explained blanks.
 *
 * Only a bracketed span with a matching hint becomes a blank. That is on
 * purpose: prompts also contain brackets the reader must leave alone, such as
 * `[NEEDED]` markers the AI is told to write, and guessing from the brackets
 * would invite people to fill those in.
 *
 * A hint with a `label` only matches a blank whose line ends in that label,
 * and wins over an unlabelled hint for the same token.
 */
export function segmentPrompt(
  prompt: string,
  hints: readonly PlaceholderHint[] = [],
): PromptSegment[] {
  if (!hints.length) return [{ text: prompt }];

  const segments: PromptSegment[] = [];
  let cursor = 0;

  for (const match of prompt.matchAll(BLANK)) {
    const lead = leadOf(prompt, match.index);
    const candidates = hints
      .map((hint, hintIndex) => ({ hint, hintIndex }))
      .filter(({ hint }) => hint.token === match[0]);
    const found =
      candidates.find(({ hint }) => hint.label && lead.endsWith(hint.label)) ??
      candidates.find(({ hint }) => !hint.label);
    if (!found) continue;

    if (match.index > cursor) segments.push({ text: prompt.slice(cursor, match.index) });
    segments.push({ text: match[0], ...found });
    cursor = match.index + match[0].length;
  }

  if (cursor < prompt.length) segments.push({ text: prompt.slice(cursor) });
  return segments;
}

/** The hints a prompt actually uses, once each, in the order they appear. */
export function hintsUsed(
  segments: readonly PromptSegment[],
): { hint: PlaceholderHint; hintIndex: number }[] {
  const seen = new Set<number>();
  const used: { hint: PlaceholderHint; hintIndex: number }[] = [];
  for (const segment of segments) {
    if (!segment.hint || seen.has(segment.hintIndex)) continue;
    seen.add(segment.hintIndex);
    used.push({ hint: segment.hint, hintIndex: segment.hintIndex });
  }
  return used;
}

/** What a blank reads as in the example: the chosen option, or the first. */
export function filledText(
  segment: PromptSegment,
  choices: Readonly<Record<number, number>> = {},
): string {
  if (!segment.hint) return segment.text;
  return segment.hint.options[choices[segment.hintIndex] ?? 0] ?? segment.hint.options[0];
}

/** The display name of a blank: its label, or the token without brackets. */
export function hintName(hint: PlaceholderHint): string {
  return hint.label ?? hint.token.slice(1, -1);
}

/**
 * Fills the blanks the reader's setup already answers.
 *
 * A filled blank stops being a blank: it has no tip and is not offered in the
 * example, because there is nothing left for the reader to decide there. With
 * no setup (a guide, or a walkthrough without that setting) nothing changes.
 */
export function fillFromSetup(
  segments: readonly PromptSegment[],
  setup: { owner?: string } | null | undefined,
): PromptSegment[] {
  if (!setup) return [...segments];
  return segments.map((segment) => {
    const answer = setup.owner ? segment.hint?.setting?.owner?.[setup.owner] : undefined;
    return answer ? { text: answer, filled: true as const } : segment;
  });
}

/** The prompt as the reader should copy it: remaining blanks as written, filled ones answered. */
export function promptText(segments: readonly PromptSegment[]): string {
  return segments.map((segment) => segment.text).join("");
}
