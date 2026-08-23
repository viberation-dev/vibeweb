# Viberation — Repo Conventions for Claude Code

This file is for any Claude Code session working in this repo. Read it before touching code. Full rationale lives in Notion Bible §34 — this is the operational summary.

## Code structure

Next.js/React is component + hook based, not class-based — these are OOP principles translated, not class hierarchies forced onto the framework.

- **Never call `supabase.from(...)` directly from a component.** Every table gets typed query functions in `lib/queries/[table].ts` (e.g. `lib/queries/tools.ts`, `lib/queries/bookmarks.ts`). This is the encapsulation layer — if the schema changes, you change one file, not every component that touched that table.
- **Folder structure:**
  - `components/ui/` — shadcn primitives, unmodified
  - `components/features/[domain]/` — composed components (e.g. `ResourceCard`, `WizardStepper`). One reusable card component across tools/learning/collections, not one per content type.
  - `lib/queries/` — the query layer described above
  - `lib/integrations/` — third-party service adapters (see below)
  - `types/` — generated Supabase types + hand-written domain types
- **Adapter pattern for third-party services:** every external service (Supabase Auth OAuth, Resend, the eventual `tsvector → Typesense` search swap) lives behind one typed module in `lib/integrations/[service].ts`. Swapping a provider later should touch one file, not every call site.

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
