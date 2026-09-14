/** One extra Key info row on a tool page (VIB-141). */
export type KeyFact = { label: string; value: string };

/**
 * `tools.key_facts` narrowed to the rows it can render.
 *
 * The column is jsonb, so its shape is a convention the database only half
 * enforces (it checks for an array). A malformed entry is dropped rather
 * than thrown on: one bad row must not take the whole tool page down.
 */
export function toKeyFacts(value: unknown): KeyFact[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is KeyFact =>
      typeof item?.label === "string" &&
      typeof item?.value === "string" &&
      item.label.trim() !== "" &&
      item.value.trim() !== "",
  );
}
