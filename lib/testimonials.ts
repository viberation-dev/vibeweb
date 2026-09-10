/*
 * Alias-free and dependency-free so it runs under plain `node --test`, for
 * the same reason lib/theme.ts and lib/nav.ts are — see the note at the top
 * of lib/nav.ts.
 */

/**
 * Up to two letters for a testimonial avatar.
 *
 * `override` is the row's `initials` column and always wins. It exists for
 * the names this guess gets wrong, which is most names that are not
 * "First Last": particles ("de Sousa" → DS, not DE), mononyms, handles.
 * Deliberately not clever about those — it takes the obvious guess and the
 * editor corrects it, rather than encoding one culture's name shape as if it
 * were the rule.
 */
export function initialsFrom(
  authorName: string,
  override?: string | null,
): string {
  const chosen = override?.trim();
  if (chosen) return chosen.toUpperCase().slice(0, 2);

  const parts = authorName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const letters =
    parts.length > 1
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2);
  return letters.toUpperCase();
}
