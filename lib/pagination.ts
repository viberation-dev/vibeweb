/** Narrows an untrusted `?page=` value to a positive integer. Defaults to 1. */
export function toPageNumber(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}
