"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { ToolFormState } from "@/app/admin/tools/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tool } from "@/lib/queries/tools";
import { TOOL_CATEGORIES } from "@/lib/tool-categories";
import { PRICING_TIERS } from "@/lib/tool-facts";

type Props = {
  /** Null when creating. Its presence is what makes this an edit form. */
  tool: Tool | null;
  action: (state: ToolFormState, formData: FormData) => Promise<ToolFormState>;
};

/** Native selects, same as ProfileForm: keyboard and screen-reader behaviour for free. */
const selectClass =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-3";

export function ToolForm({ tool, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={tool?.name ?? ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={tool?.slug ?? ""} required />
        <p className="text-muted-foreground text-sm">
          The URL: <code>/tools/{tool?.slug ?? "your-slug"}</code>, and the outbound
          redirect <code>/go/{tool?.slug ?? "your-slug"}</code>. Changing it breaks
          existing links.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            defaultValue={tool?.category ?? "tools"}
            className={selectClass}
          >
            {TOOL_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pricing_tier">Pricing</Label>
          <select
            id="pricing_tier"
            name="pricing_tier"
            defaultValue={tool?.pricing_tier ?? ""}
            className={selectClass}
          >
            <option value="">Not set</option>
            {PRICING_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
          <p className="text-muted-foreground text-sm">
            Drives the Free-tier filter and the fact shown on the tool page.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tagline">Tagline</Label>
        <Input id="tagline" name="tagline" defaultValue={tool?.tagline ?? ""} />
        <p className="text-muted-foreground text-sm">One line, shown on the card.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={tool?.description ?? ""}
          rows={10}
          className={`${selectClass} h-auto leading-relaxed`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="outbound_url">Outbound URL</Label>
        <Input
          id="outbound_url"
          name="outbound_url"
          type="url"
          inputMode="url"
          defaultValue={tool?.outbound_url ?? ""}
          placeholder="https://example.com"
        />
        <p className="text-muted-foreground text-sm">
          Where <code>/go/[slug]</code> sends visitors. Leave blank until there is one.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <input
          id="is_affiliate"
          name="is_affiliate"
          type="checkbox"
          defaultChecked={tool?.is_affiliate ?? false}
          className="border-input mt-0.5 size-4 rounded border"
        />
        <div className="space-y-1">
          <Label htmlFor="is_affiliate">Affiliate link</Label>
          <p className="text-muted-foreground text-sm">
            Adds <code>rel=&quot;sponsored&quot;</code> and the visible disclosure. Only
            tick it when the link actually is paid.
          </p>
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : tool ? "Save changes" : "Create tool"}
        </Button>
        <Link href="/admin/tools" className={buttonVariants({ variant: "ghost" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
