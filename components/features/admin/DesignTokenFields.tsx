"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DESIGN_MODES,
  DESIGN_MODE_LABELS,
  DESIGN_PRESETS,
  DESIGN_TOKENS,
  DESIGN_TOKEN_NAMES,
  HEX_COLOUR,
  STOCK,
  colourAlpha,
  designFieldName,
  normaliseColour,
  resolveDesignToken,
  withAlpha,
  type DesignMode,
  type DesignTokenName,
  type DesignTokens,
} from "@/lib/design-tokens";

type Props = { tokens: DesignTokens; defaults: DesignTokens };

/** Every token in every mode, keyed "light.--card". */
type Colours = Record<string, string>;

const keyOf = (mode: DesignMode, name: DesignTokenName) => `${mode}.${name}`;

function toColours(tokens: DesignTokens): Colours {
  return Object.fromEntries(
    DESIGN_MODES.flatMap((mode) =>
      DESIGN_TOKEN_NAMES.map((name) => [
        keyOf(mode, name),
        resolveDesignToken(tokens, mode, name),
      ]),
    ),
  );
}

/**
 * The hex box. Keeps what is being typed until it is a whole colour, so a
 * half-entered value never reaches the form.
 */
function HexInput({
  id,
  colour,
  onChange,
}: {
  id: string;
  colour: string;
  onChange: (colour: string) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <Input
      id={id}
      value={draft ?? colour}
      spellCheck={false}
      autoComplete="off"
      maxLength={9}
      aria-invalid={draft !== null && !HEX_COLOUR.test(draft)}
      className="h-9 w-28 font-mono"
      onChange={(event) => {
        const typed = event.target.value.trim();
        const value = typed.startsWith("#") ? typed : `#${typed}`;
        setDraft(value);
        if (HEX_COLOUR.test(value)) onChange(normaliseColour(value));
      }}
      onBlur={() => setDraft(null)}
    />
  );
}

/**
 * One token in one mode (VIB-247): the native colour input for picking, a hex
 * box for typing or pasting, and a slider for opacity, all editing one value.
 */
function ColourField({
  mode,
  name,
  colour,
  fallback,
  onChange,
  onSetDefault,
}: {
  mode: DesignMode;
  name: DesignTokenName;
  colour: string;
  /** What Reset returns to: the staff default, or stock when there is none. */
  fallback: string;
  onChange: (colour: string) => void;
  onSetDefault: () => void;
}) {
  const id = designFieldName("design_tokens", mode, name);
  const stock = STOCK[mode][name];
  const alpha = colourAlpha(colour);
  const title = `${DESIGN_MODE_LABELS[mode]} ${DESIGN_TOKENS[name].label}`;

  return (
    <div className="space-y-3">
      <Label htmlFor={`${id}.hex`}>{DESIGN_MODE_LABELS[mode]}</Label>
      <input type="hidden" name={id} value={colour} />
      <input
        type="hidden"
        name={designFieldName("design_token_defaults", mode, name)}
        value={fallback}
      />

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="color"
          aria-label={`${title}, colour picker`}
          value={colour.slice(0, 7)}
          onChange={(event) => onChange(withAlpha(event.target.value, alpha))}
          className="border-input h-9 w-14 cursor-pointer rounded-md border bg-transparent p-1"
        />
        <HexInput id={`${id}.hex`} colour={colour} onChange={onChange} />
        <span
          aria-hidden
          className="border-input size-9 rounded-md border"
          style={{ backgroundColor: colour }}
        />
      </div>

      <label className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground w-16">Opacity</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(alpha * 100)}
          onChange={(event) =>
            onChange(withAlpha(colour, Number(event.target.value) / 100))
          }
          className="accent-primary min-w-0 flex-1"
        />
        <span className="w-10 text-right tabular-nums">{Math.round(alpha * 100)}%</span>
      </label>

      <div className="flex flex-wrap gap-1.5">
        {DESIGN_PRESETS.map((preset) => (
          <button
            key={preset.colour}
            type="button"
            title={`${preset.label} ${preset.colour}`}
            aria-label={`${title}: use ${preset.label} ${preset.colour}`}
            aria-pressed={colour === preset.colour}
            onClick={() => onChange(preset.colour)}
            className="border-input focus-visible:ring-ring/50 aria-pressed:ring-ring size-6 rounded-full border outline-none focus-visible:ring-3 aria-pressed:ring-2"
            style={{ backgroundColor: preset.colour }}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={colour === fallback}
          onClick={() => onChange(fallback)}
        >
          Reset
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={colour === fallback}
          onClick={onSetDefault}
        >
          Set as default
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={colour === stock}
          onClick={() => onChange(stock)}
        >
          Restore original
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">
        Default <code>{fallback}</code>
        {fallback === stock ? null : (
          <>
            , original <code>{stock}</code>
          </>
        )}
      </p>
    </div>
  );
}

/**
 * The Design section of the settings form (VIB-247).
 *
 * Nothing here saves by itself: every control edits form state, and the
 * form's own Save button sends colours and defaults together.
 */
export function DesignTokenFields({ tokens, defaults }: Props) {
  const [colours, setColours] = useState(() => toColours(tokens));
  const [fallbacks, setFallbacks] = useState(() => toColours(defaults));

  const dirty = Object.keys(colours).some((key) => colours[key] !== fallbacks[key]);

  return (
    <section className="space-y-6 border-t pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-md">
          <h2 className="font-heading text-xl font-bold tracking-[-0.02em]">Design</h2>
          <p className="text-muted-foreground text-sm">
            Colours that override the design system across the whole site.
            Changes apply when you save. A colour that would make text hard to
            read is not saved.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!dirty}
          onClick={() => setColours(fallbacks)}
        >
          Reset all
        </Button>
      </div>

      {DESIGN_TOKEN_NAMES.map((name) => (
        <fieldset key={name} className="space-y-3">
          <legend className="text-sm font-semibold">{DESIGN_TOKENS[name].label}</legend>
          <div className="grid gap-8 sm:grid-cols-2">
            {DESIGN_MODES.map((mode) => {
              const key = keyOf(mode, name);
              return (
                <ColourField
                  key={mode}
                  mode={mode}
                  name={name}
                  colour={colours[key]}
                  fallback={fallbacks[key]}
                  onChange={(colour) => setColours((all) => ({ ...all, [key]: colour }))}
                  onSetDefault={() =>
                    setFallbacks((all) => ({ ...all, [key]: colours[key] }))
                  }
                />
              );
            })}
          </div>
        </fieldset>
      ))}
    </section>
  );
}
