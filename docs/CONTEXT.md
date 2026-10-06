# Viberation — Project Context (for developers & AI agents)

> This file is a **pointer**, not the source of truth.
> **Single source of truth = the Notion Project Bible.** Do not duplicate its content here — link to it and re-sync if anything changes.
> ⚠️ **Section numbers below are current as of 2026-08-20.** The Bible was fully renumbered on 2026-08-19 — if this file, or anything else, cites a section number that doesn't match what's actually at that link, trust the Bible hub over this file and update this file to match.

## What Viberation is

The go-to platform for **beginner/intermediate "vibe coders"** — a curated AI-tool directory + role-aware editorial content (Learn) + a personal account layer, growing toward wizards, marketplace, and comparison tooling. Solo, bootstrapped founder; affiliate-only revenue at MVP.

## Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind v4 + shadcn/ui
- **Backend:** Supabase (Postgres + Auth + RLS + Storage)
- **Search:** Supabase full-text (`tsvector`) → Typesense later
- **Email:** Resend
- **Hosting:** Vercel
- **pgvector:** added later (Phase 1.5, only when AI generation lands)
- Affiliate links = tracked Next.js **route handlers** (`/go/[slug]`)

## Canonical phase naming

**MVP v1.0 → Phase 1.5 → v2.0.** Build MVP only right now.

## MVP scope (build these; nothing else yet)

Directory (categories live in `lib/tool-categories.ts`) · Editorial/Learn (role-tagged) · Accounts (auth, prefs, history, bookmarks w/ folders) · Tag nav · Role-based display · Home feed · Onboarding · Collections · Tracked affiliate links · **1 flagship authored wizard + runner** ("Ship your first web project") · lean staff gate (`app_role`) · essential end-user help docs.

**NOT in MVP** (do not build): ratings/reviews, Jobs board, Pro subscription, AI wizard generation, marketplace, comparison tool, gamification, voting, community, editorial role hierarchy, **any plugin/add-on code-execution system** (§34 — no sandboxing, no third-party code running inside the app; that's a dedicated v2.0 security design pass, not a partial MVP build).

## Key schema facts (full schema: §33 + `/docs/erd.mermaid` + `supabase/migrations/`)

- **Tool categories** (artifact-type): read them, and their display order, from `lib/tool-categories.ts`; the live `tool_category` enum is the truth. Do not restate the count or the list here — this line went stale twice by hard-coding one (13, then 15), and an enumeration is the same trap, since every new category invalidates it. (Retired app-area buckets — web_apps/frontend/backend — are facet **tags**, not categories.) Directory cards, live data, tags and Key info: §37.
- **Three role axes:** `role_level` (beginner|intermediate|expert, audience) · `app_role` (member|admin|super_admin, staff gate) · marketplace buyer/seller (v2.0).
- **Wizard kinds:** `wizard | setup | path` (MVP ships `wizard` only).
- **Polymorphic** (target_type + target_id, app/RLS integrity): bookmarks, history_items, collection_items. **Tags** use explicit join tables.
- **RLS everywhere:** public content = public read / staff write; personal data (bookmarks, history, wizard_progress) = owner-only.
- **There are far more than the original 5 migrations — count them with `ls supabase/migrations/`, never from this file.** This bullet has gone stale three times by hard-coding a number; the reasons below are the part worth keeping, and they do not expire:
  - `tool_outbound_url` — adds `outbound_url` + `is_affiliate` to `tools`; without it `/go/[slug]` has nothing to redirect to.
  - `tool_view_count` — `increment_tool_views()`, security-definer, because `tools` is staff-write under RLS so nothing could otherwise write `view_count`.
  - `tool_bookmark_count` — `sync_tool_bookmark_count()` + a trigger on `bookmarks`, for the same reason `bookmark_count` could never be written from the client.
  - `collection_slugs` — `collections.slug` + `is_featured`; §31 routes collection detail at `/collections/[slug]` and migration 04 created the table without either.
  - `search_tsvector`, `search_function`, `search_tags_collections` — search took three, not one. The function exists because PostgREST can filter on a tsvector but cannot select or order by `ts_rank()`, so ranked cross-table results need one. It is deliberately **not** security-definer: the tables are public-read, so the caller's own RLS is the right visibility. The third adds tag matching (searching "design" found nothing while tags were unindexed) and collections, per §31.
  - `tool_clicks` — the affiliate click log behind `/go/[slug]`.
- **Filenames order by timestamp prefix; any number in prose is only prose.** Whatever lands first takes the next number — VIB-47 was renumbered twice (08→09→10) on its way in.
- **The migration ledger was repaired on 2026-08-28.** Migrations applied through the Supabase MCP `apply_migration` tool get a version timestamp minted by the tool, not taken from the filename, so `supabase_migrations.schema_migrations` had drifted from `supabase/migrations/` on seven rows plus one file-less entry. The ledger now matches the filenames exactly. If you apply anything via MCP again, expect the same drift and re-check with `select version, name from supabase_migrations.schema_migrations order by version;`.

## Engineering conventions (full detail: §34, and `/CLAUDE.md` at repo root)

- **Query layer:** no component calls `supabase.from(...)` directly — every table gets typed functions in `lib/queries/[table].ts`.
- **Adapter pattern:** every third-party service (OAuth, Resend, the future `tsvector→Typesense` swap) lives behind one typed module in `lib/integrations/[service].ts`.
- **RLS is the real security boundary**, not app-code checks. Validate input with `zod` server-side.
- The repo-root `CLAUDE.md` is the operational summary of §34 — read it, don't re-derive these conventions each session.

## Build approach

- **Vertical slices**, one feature end-to-end at a time. Order: Scaffold & infra → migrations 01→06 → Accounts/login → Tools directory → Bookmarks → Learn → Home/collections/onboarding → Flagship wizard → Search & UX polish (tsvector, tags, history) → Launch prep (affiliate redirect, staff gate).
- Never edit an already-applied Supabase migration; add a new one.
- Commit to GitHub (`viberation-dev`) after each feature. Trunk-based — one short-lived branch per Linear issue, PR titles reference the issue ID.

## Source-of-truth links (Notion Project Bible)

- **Bible hub:** https://app.notion.com/p/3132c1463cea813e807cf9ebc5a92b3c
- **§29 PRD/SRS (requirements):** https://app.notion.com/p/3a02c1463cea81f9879cfc870833d86d
- **§27 Finalized Architecture (canonical):** https://app.notion.com/p/39e2c1463cea8152a5cae53f06b44ed3
- **§28 Feature Master List & Tracker:** https://app.notion.com/p/3a02c1463cea81c18f9bd690dc8a2310
- **§31 Information Architecture (routes, sections, components):** https://app.notion.com/p/3bd2c1463cea8133917ecd49250a0c2a
- **§32 Screen Mockups (reference):** https://app.notion.com/p/3be2c1463cea815caec5dac4b4565070
- **§33 Database Schema & Migrations:** https://app.notion.com/p/3c12c1463cea81f69ad9fbc1f3dad39b
- **§30 Build Handoff Guide:** https://app.notion.com/p/3aa2c1463cea8145bbedcacda3834f50
- **§26 Wizards/Workflow Engine module:** https://app.notion.com/p/39e2c1463cea81948f65e3a44f18be5d
- **§24 Visual Direction (design):** https://app.notion.com/p/3932c1463cea81759715eb14747a0c66
- **§03 Personas:** https://app.notion.com/p/3612c1463cea8112a5a7d614568d9bef
- **§34 Engineering Conventions:** https://app.notion.com/p/3c52c1463cea813fa802cfe1fbe5f31d

*When a section's detail is needed, open the Notion page and paste the relevant part into the working session — don't copy whole documents into the repo.*
