"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { ComparisonFormState } from "@/app/(site)/admin/comparisons/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Comparison } from "@/lib/queries/comparisons";
import { TOOL_CATEGORIES } from "@/lib/tool-categories";

export type ToolOption = { id: string; name: string; category: string };

type Props = {
  /** Null when creating. */
  comparison: Comparison | null;
  /** Every tool; grouped by category here, in directory order. */
  tools: ToolOption[];
  action: (
    state: ComparisonFormState,
    formData: FormData,
  ) => Promise<ComparisonFormState>;
};

/** Native controls, same as the other staff editors. */
const fieldClass =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-3";

function ToolSelect({ name, value, tools }: { name: string; value?: string; tools: ToolOption[] }) {
  const byName = [...tools].sort((x, y) => x.name.localeCompare(y.name));
  return (
    <select id={name} name={name} defaultValue={value ?? ""} required className={`${fieldClass} h-9`}>
      <option value="" disabled>
        Choose a tool
      </option>
      {TOOL_CATEGORIES.map(({ value, label }) => (
        <optgroup key={value} label={label}>
          {byName
            .filter((t) => t.category === value)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}

function TextArea({ name, value, rows, hint }: { name: string; value?: string; rows: number; hint: string }) {
  return (
    <>
      <textarea
        id={name}
        name={name}
        defaultValue={value ?? ""}
        rows={rows}
        className={`${fieldClass} h-auto py-2 leading-relaxed`}
      />
      <p className="text-muted-foreground text-sm">{hint}</p>
    </>
  );
}

export function ComparisonForm({ comparison, tools, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tool_a_id">First tool</Label>
          <ToolSelect name="tool_a_id" value={comparison?.tool_a_id} tools={tools} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tool_b_id">Second tool</Label>
          <ToolSelect name="tool_b_id" value={comparison?.tool_b_id} tools={tools} />
        </div>
      </div>
      <p className="text-muted-foreground -mt-3 text-sm">
        The page address is made from the two tools, first one first:
        /compare/cursor-vs-devin-desktop. Pricing, platforms and key info come
        from each tool&rsquo;s own entry, so they stay current on their own.
      </p>

      <div className="space-y-2">
        <Label htmlFor="intro">Intro</Label>
        <TextArea
          name="intro"
          value={comparison?.intro}
          rows={5}
          hint="The direct answer in two or three sentences: what both share, and which to pick. Search engines and AI assistants quote this part."
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pick_a">Pick the first tool if…</Label>
          <TextArea name="pick_a" value={comparison?.pick_a} rows={4} hint="One sentence, starting with “You”." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pick_b">Pick the second tool if…</Label>
          <TextArea name="pick_b" value={comparison?.pick_b} rows={4} hint="One sentence, starting with “You”." />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="models_a">Models to compare (first tool)</Label>
          <TextArea
            name="models_a"
            value={comparison?.models_a.join("\n")}
            rows={3}
            hint="Model families only. Up to three OpenRouter ids, one per line, e.g. anthropic/claude-opus-5. Leave blank for other tools."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="models_b">Models to compare (second tool)</Label>
          <TextArea
            name="models_b"
            value={comparison?.models_b.join("\n")}
            rows={3}
            hint="Same, for the second tool."
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          name="published"
          type="checkbox"
          defaultChecked={comparison?.published ?? false}
          className="size-4"
        />
        Published: visible at /compare and on both tool pages
      </label>

      {state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="pill" size="pill-sm" disabled={pending}>
          {pending ? "Saving…" : comparison ? "Save changes" : "Add comparison"}
        </Button>
        <Link href="/admin/comparisons" className={buttonVariants({ variant: "ghost" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
