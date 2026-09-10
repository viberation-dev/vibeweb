import type { ReactNode } from "react";

/** One label/value row in a `<dl>` of facts — the tool page's key-info, rail and model specs. */
export function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b py-2 last:border-b-0">
      <dt className="text-muted-foreground shrink-0 text-sm">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  );
}
