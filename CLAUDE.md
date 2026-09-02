# Viberation — Repo Conventions for Claude Code

This file is for any Claude Code session working in this repo. Read it before touching code. Full rationale lives in Notion Bible §34 — this is the operational summary.

## Code structure

Next.js/React is component + hook based, not class-based — these are OOP principles translated, not class hierarchies forced onto the framework.

- **Never call `supabase.from(...)` directly from a component.** Every table gets typed query functions in `lib/queries/[table].ts` (e.g. `lib/queries/tools.ts`, `lib/queries/bookmarks.ts`). This is the encapsulation layer — if the schema changes, you change one file, not every component that touched that table.
- **Folder structure:**
  - `components/ui/` — shadcn primitives. **May carry brand styling; must not carry product knowledge.** See below.
  - `components/features/[domain]/` — composed components (e.g. `ResourceCard`, `WizardStepper`). One reusable card component across tools/learning/collections, not one per content type.
  - `lib/queries/` — the query layer described above
  - `lib/integrations/` — third-party service adapters (see below)
  - `types/` — generated Supabase types + hand-written domain types
- **Adapter pattern for third-party services:** every external service (Supabase Auth OAuth, Resend, the eventual `tsvector → Typesense` search swap) lives behind one typed module in `lib/integrations/[service].ts`. Swapping a provider later should touch one file, not every call site.

## Routing / account IA

Account routes live under **`/account`** as a tab shell: `/account` (Overview) · `/account/bookmarks` · `/account/history` · `/account/settings`. Each tab is a real nested route under `app/account/layout.tsx`, not client-side tab state — deep links, back/forward and server-rendered queries all keep working.

This reverses the 2026-08-27 flat-route decision. Ali confirmed the tabbed IA on 2026-08-31 (Bible §14 Decision Log) and it shipped in VIB-69. `/profile`, `/bookmarks` and `/history` remain as permanent redirects into the shell — don't delete them, they are in browser histories and old `?redirectTo=` links.

Middleware gates the whole subtree with a single `/account` prefix, and every page under it still re-checks the session itself. A layout is not a gate.

## components/ui — styling yes, domain no

The old rule said "shadcn primitives, **unmodified**". PR #37 modified four of them anyway — button heights, hover as a colour swap rather than an opacity change, a new `outbound` variant, card radius, input height — because those requirements are not expressible as CSS tokens alone. The rule and the code disagreed, which is worse than either.

Resolved 2026-09-03 (VIB-74): **`components/ui/` may be restyled to the design system, but must know nothing about this product.** A primitive can gain a variant, a size or a token; it must not know what a `role_level` is, what a tool is, or how this app labels anything.

The test is whether the file would still make sense in a different product. `Button` with an `outbound` variant would. `DifficultyBadge` would not — it knows the `role_level` enum and that `expert` displays as "Advanced" — so it moved to `components/features/resource/`.

Consequence worth knowing: `npx shadcn add` will conflict on the restyled files. That is the accepted cost of a themed design system; re-apply the brand changes rather than taking the stock version.

## Icons

**Tabler (`@tabler/icons-react`), not Lucide.** `viberation-mockups_3.html` is drawn with the Tabler webfont, so the mockups and the app now use the same set — `ti-robot` is `IconRobot`, `ti-stack-2` is `IconStack2`, and so on, one for one.

Lucide was the shadcn default and shipped here first; it was removed on 2026-09-02 when the mismatch surfaced, so the repo has one icon set rather than two. Neither the handoff nor §31 had named a set, which is how they drifted apart in the first place — this note is the decision.

## Security

- **RLS is the actual security boundary**, not the API layer — it's already built into migrations 02/03/05. Don't add app-code checks as a substitute for RLS; add them as defense in depth if you want, but RLS is what actually protects the data.
- Never expose the Supabase service-role key client-side.
- Validate all form/API input with `zod` — server-side validation is the security control; client-side is UX only.
- Secrets live in Vercel env vars. Never commit `.env` or hardcode a key.

## GitHub workflow

- Trunk-based: `main` is protected, one short-lived branch per Linear issue.
- PR and commit titles reference the Linear issue ID (e.g. `feat(tools): add category filter [VIB-23]`).
- Every PR gets a Vercel preview URL automatically — always open a PR, even for a small change, since that preview link is how Ali reviews your work.
- Lint + typecheck + build run in CI on every PR.

## Working across sessions

- **One Linear issue = one branch = one active session on those files.** Don't run two sessions against the same files concurrently.
- Pull current `main` and re-check the Notion Bible before starting a slice — don't assume a previous session's summary is still accurate. This exact failure mode (working from a stale or fabricated version of something instead of the real current state) has already happened twice in this project's planning docs and been caught and fixed. Don't let it happen in the codebase.
- Open a PR as a real checkpoint, not a formality, even when self-reviewing.

## Explicitly out of scope — do not build

- **No plugin/add-on code-execution system.** No sandboxing, no third-party code running inside the app, no plugin marketplace hooks. That's a v2.0 concept requiring its own dedicated security design pass — don't half-build it into the MVP schema or app.
- Third-party *API* integration (not code execution) is in scope — that's what `lib/integrations/` is for.
- Nothing from Phase 1.5 or v2.0 (see Bible §28) — MVP scope only, even if a feature looks easy to add now.

## Documentation

No separate docs system — migration 03's `content` table already covers it:
- `content.type = help_article | role_guide`, `content.audience = enduser | author | admin | seller`
- Visitor-facing and member-facing help → rows in `content`, surfaced through the Learn hub
- Internal engineering docs (README, this file, architecture notes) → repo + Notion Bible, **not** `content` rows
