# What's new — design

**Date:** 2026-10-02
**Status:** awaiting review
**Supersedes:** nothing. First design for content discovery.

## Problem

Nothing on the site answers "what changed since I was last here?".

- The signed-in home feed's **Latest** tab reads `content` rows only. A new
  tool, a new collection, a new announcement and a shipped platform change
  never appear in it.
- The logged-out marketing homepage has no recency surface at all. A returning
  visitor has no reason to believe the site moved.
- There is no destination. `/changelog` covers software changes and `/blog`
  covers announcements, but a new tool or guide appears in neither.
- **Dates are wrong for `content`.** `created_at` is the authoring date, not
  the publish date: a guide row is inserted by one migration and published by
  a later one. The seven Extend guides (VIB-223 to VIB-229) each landed that
  way. Ordering by `created_at` would mis-date the entire Learn library.

The consequence is that work ships and nobody sees it.

## Intended outcome

A visitor or member can see, in one place and on the page they land on, what
has been added and what has been meaningfully updated — across tools, Learn
content, docs, announcements, collections and shipped features.

Success: a returning member identifies this week's additions without
navigating; a first-time visitor sees the site is alive; an editor publishing
a guide does nothing extra for it to surface.

## Decisions taken before this spec

Confirmed by Ali, 2026-10-02:

1. Two surfaces: the **logged-out marketing homepage** gets a section, the
   **signed-in member area** gets the highlight.
2. "New" means **global recency** — "added in the last N days", the same for
   everyone. No per-member state, no `last_seen_at`, no per-item seen rows.
3. All sources count: tools, Learn content, blog announcements, docs,
   collections, skills, and shipped features from the changelog.
4. **Updates count too, not just additions** — technology moves, and an item
   that gained a model or changed its pricing is news.

## What counts, and where its date comes from

| Source | Added date | Updated date | Change needed |
|---|---|---|---|
| `tools` | `created_at` | `revised_at` | `revised_at`, `revision_note`, `surfaced_at` |
| `content` (Learn, docs, announcements) | `published_at` | `revised_at` | the same three, plus `published_at` and its trigger |
| `collections` | `created_at` | — | none |
| Skills | via `tools` | via `tools` | none — skills *are* tool rows with a `skill_category` |
| Features | `lib/changelog.ts` `date` | same field | none |

Collections have no `status` column: a row existing is the row being live.
They are not revised in a way worth announcing, so they are additions only.

### Why `updated_at` cannot be the updated signal

`updated_at` is touched by every write. 28 migrations in this repo set
`updated_at = now()` explicitly, and two from 2026-10-02 alone were
`agents_md_read_by_correction` (a factual typo) and `scope_guide_cli_tab_order`
(reordering tabs). Sorting a public stream on `updated_at` would put "fixed a
typo" above "published a new guide" and keep it there.

There is no threshold that separates a typo from a rewrite, because the column
records neither — it records that a row was written. So the updated signal has
to be **deliberate**: set by whoever makes the change, when the change is worth
telling someone about.

### The update signal

Two columns on both `tools` and `content`:

```sql
revised_at   timestamptz      -- null unless a revision is worth announcing
revision_note text            -- one line: what actually changed
```

- `revised_at` is **null by default and stays null** for a typo, a tag
  reorder, a badge change, or any edit an editor does not consider news.
  Nothing derives it; nothing back-fills it.
- `revision_note` is required alongside it by a check constraint — a stream
  entry saying only "Updated" tells a reader nothing. The note is one short
  line in plain language: "Added Opus 5.5 pricing", "Rewritten for the v3
  CLI". No issue IDs, same rule as changelog bodies.
- Set from a migration for a seeded change, or from the admin editor
  (`ToolForm`, the content editor) for an editorial one. The admin form gets
  one checkbox — "this is worth announcing" — plus the note field; ticking it
  stamps `revised_at = now()`.

A check constraint enforces the pair:

```sql
check ((revised_at is null) = (revision_note is null))
```

### `content.published_at`

```sql
published_at timestamptz
```

Set by a trigger when `status` transitions `draft → published`; cleared if it
ever returns to `draft`, so an unpublished row cannot sit in a public stream.
Backfilled for rows already published as `coalesce(updated_at, created_at)` —
imperfect for the oldest rows and the best available, which the migration
comment states plainly.

No grants needed: these are columns on tables the Data API already reads.

### What "new" means

`site_settings.badge_new_days` — the knob that already exists and already
drives the tool **New** badge. No second setting. Whether an entry carries a
pill is `age <= badge_new_days`; whether it appears in the stream at all is
just its position in the ordering.

## Where an updated item goes

**One entry per item, at its most recent event, labelled for that event.**

- An item's effective date is `revised_at` when set, otherwise its added date.
- The stream is that date, descending. An update sorts against additions
  chronologically — it does not get a lower-priority bucket, and it does not
  jump the queue.
- The entry is labelled **Added** or **Updated**, and an Updated entry prints
  its `revision_note` as its line of body text.
- An item never appears twice. A tool added in March and revised in October
  appears once, in October, as Updated. The March entry is gone, which is
  correct: the stream answers "what changed recently", not "what has ever
  happened".

Rejected alternatives, and why:

- *Two sections, Added and Updated.* Splits one question into two lists the
  reader has to merge themselves, and halves the density of both on a surface
  that has room for six cards.
- *Updates ranked below additions.* Dishonest ordering. A tool that gained a
  whole new model matters more than a collection added the same week.
- *An entry per event, so an item can appear twice.* Makes the stream a log.
  A reader scanning for what to open does not want the same tool twice.

Changelog entries already carry this distinction: `kind` is
`added | improved | fixed`. `added` maps to **Added**; `improved` and `fixed`
map to **Updated**. No change to `lib/changelog.ts`.

## Naming

One name on every surface: **What's new**. The section heading, the feed tab,
the sidebar link and the route (`/new`) all use it.

It stays honest without a count or an age claim because every card prints its
own event label and date. This matters at launch: almost every tool in the
directory was created inside the same month — the fact that made
`tool_badge_mode` default to `staff`. A section titled "What's new" showing
the newest six with their dates visible cannot overclaim. A heading with a
count in it could, and counts in headlines are out anyway.

## Architecture

### `lib/whats-new.ts` — pure logic

Alias-free and dependency-free so it runs under plain `node --test`, the same
constraint as `lib/home-feed.ts`, `lib/changelog.ts` and `lib/tool-badges.ts`.

```ts
export type WhatsNewEvent = "added" | "updated";
export type WhatsNewKind = "tool" | "content" | "collection" | "feature";

/** The minimum the merge needs. Deliberately not a row and not a view. */
export type WhatsNewInput = {
  /** Identity for the caller to join its view back on. Absent for a feature. */
  id?: string;
  kind: WhatsNewKind;
  title: string;
  addedAt: string | null;
  revisedAt: string | null;
  note: string | null;
};

export type WhatsNewEntry = {
  id?: string;
  kind: WhatsNewKind;
  event: WhatsNewEvent;
  title: string;
  /** ISO date the event happened. The sort key. */
  at: string;
  /** The revision note, or the changelog body. Null for an addition. */
  note: string | null;
  /** Within badge_new_days of now. */
  isNew: boolean;
};
```

Responsibilities, all pure: pick each item's effective date and event, merge,
sort by `at` descending with a title tie-break, cap to a limit, and compute
`isNew` from `badge_new_days` and an injected `now`.

It works over `WhatsNewInput`, not over `ResourceView`, and the query layer
joins the views back on `id`. That is not indirection for its own sake:
`ResourceView` imports `@/lib/learn` and `@/lib/reading-time`, and this module
has to stay alias-free to run under plain `node --test` — the same reason
`lib/home-feed.ts` defines its own `FeedItem` instead of importing a row type.

### `lib/queries/whats-new.ts` — the query layer

`listWhatsNew(client, { limit })`. Runs the three table queries in parallel,
reads `site_settings`, merges in the changelog constant, calls the pure module,
then maps each entry's `id` back to a `ResourceView` via the existing
`toolView` / `contentView`. No component calls `supabase.from` — per CLAUDE.md,
every table reaches the app through `lib/queries/`.

#### Ordering, without sorting the whole library in Node

`supabase-js` `.order()` takes a column, not an expression, so "order by
whichever of two dates is later" has nowhere to live at query time. A stored
generated column gives it one:

```sql
-- on tools
surfaced_at timestamptz generated always as (greatest(revised_at, created_at)) stored
-- on content
surfaced_at timestamptz generated always as (greatest(revised_at, published_at)) stored
```

`greatest` ignores nulls, so a tool always has a `surfaced_at`, and a content
row's is null only if it has never been published and never been announced. A
draft with `revised_at` set has `surfaced_at = revised_at`, so the column does
not exclude drafts: `listContentSurfaced`'s `status = 'published'` filter is
required, not defensive, and for a staff user (RLS is
`status = 'published' OR is_staff()`) it is the only thing keeping drafts out. Each gets a descending index, and each source
query is `.order("surfaced_at", { ascending: false }).limit(limit)`. The merge
then only ever handles a few dozen rows.

If Postgres rejects `greatest(timestamptz, timestamptz)` as insufficiently
immutable for a generated column, the fallback is a plain column maintained by
the same trigger that sets `published_at`. The implementation plan should
verify this against the real database before building on it.

### Rendering

Entries reuse the existing **`ResourceView`** shape, so `ResourceCard` renders
them unchanged — the same card the directory, Learn, collections and bookmarks
use. The event label is an added field, not a new card component.

A `feature` entry has no row and therefore no `id`, so no view joins to it and
it carries no bookmark toggle; it renders as a plain card linking to
`/changelog`. This is the only entry kind that is not bookmarkable, and the
card handles it by branching on the absent view rather than by a second
component.

`collections` has no `surfaced_at` — additions only — so its query orders by
`created_at` as it does today.

### Bug fixed in passing

`contentView()` in `lib/resource-view.ts:58` hardcodes `/learn/${slug}`, but
`contentHref()` exists precisely because announcements live at `/blog/[slug]`
(VIB-106). Any announcement already reaching a feed, a bookmark list or the
home rail links to a 404. One line; this work would otherwise inherit it.

## Surfaces

### 1. Marketing homepage (logged out)

A **What's new** section in `MarketingHome`: six cards in a grid, each with its
kind as the eyebrow, its Added/Updated label, its date, and a New pill where
the age qualifies. One link to `/new` beneath.

Always populated — it shows the newest six whatever their age, so it cannot
render empty and cannot claim recency it does not have.

Placement: after the tool preview and before the proof section, so a returning
visitor meets it early without it displacing the pitch.

### 2. Signed-in area

Two additions, both small:

- **A "What's new" tab, first in `FEED_TABS`.** The current Latest tab reads
  `content` only, which is the whole reason a new tool never surfaces. The new
  tab renders the merged stream. `for-you` remains the default landing tab, so
  the home page a member sees on arrival does not change; `toFeedTab` already
  narrows untrusted `?feed=` values.
- **A sidebar link to `/new`** in the first `SIDEBAR_GROUPS` group, beside Home
  and Saved. A count of recent entries was dropped: `NavItem` has no count slot,
  and it would mean running the whole stream query in the sidebar on every page
  render.

No read state, no dismissal, no write on page view — the consequence of
choosing global recency.

### 3. `/new`

`app/(site)/new/page.tsx`. The full stream, newest first, grouped by month,
with two GET filters following the directory's existing no-JavaScript pattern:
`?kind=` (tool, content, collection, feature) and `?event=` (added, updated).

Server-rendered, no client state. Reachable by both visitors and members —
the same page, the shell differs because the route group's layout differs.

## Error handling

- A `site_settings` read that fails falls back to `DEFAULT_BADGE_SETTINGS`,
  as `toolView` already does. Cards render without pills rather than not at
  all.
- An unparseable date excludes the entry rather than sorting it to the top.
  `toolBadge` already takes this position: an unparseable date is not
  evidence of newness.
- A source query that fails degrades to an empty array for that source. One
  table being unreachable must not blank the whole stream.
- `/new` with an unrecognised `?kind=` or `?event=` ignores the filter, the
  same as `toFeedTab` and the directory filters.

## Testing

`node --test` over `lib/whats-new.ts`:

- merge order across mixed kinds, including ties broken on title
- an item with `revised_at` sorts at its revision date and is labelled Updated
- an item with `revised_at` appears once, not twice
- the `isNew` boundary exactly at `badge_new_days`
- a null/unparseable date is excluded, not sorted first
- the empty case returns an empty array, not a throw
- changelog `improved` and `fixed` map to Updated, `added` to Added

Against the database, after applying the migration: flipping a row's status in
both directions sets and then clears `published_at`; `revised_at` without a
note is rejected by the check constraint; `surfaced_at` is null for a draft that was never announced,
equals `published_at` once published, and moves to `revised_at` when one is
set.

Everything else is server components over the query layer, consistent with the
rest of the repo.

## Migrations

One migration, applied at merge:

- `content.published_at`, with its trigger and backfill
- `revised_at` + `revision_note` on both `tools` and `content`, with the paired
  check constraint
- the `surfaced_at` generated column and its descending index on both tables
- column comments naming the issue

No new table, no grants.

Per the standing rule that one Supabase project serves production and every
preview, this is additive only — new nullable columns and a trigger that fires
on a transition that is not happening during the deploy. Nothing existing
reads or writes these columns, so a preview running old code is unaffected.

## Out of scope

- No email digest, no RSS, no notification bell.
- No per-member read state, unread counts or dismissal.
- No `new_entries` SQL union view. The right move once the library is in the
  hundreds, and premature now: the changelog is a repo constant and cannot
  join a view, so the merge has to happen in Node regardless until that
  changes.
- Nothing from Phase 1.5 or v2.0.

## Reversibility

The two judgement calls worth naming, both reversible:

- **The What's new tab becomes first in the feed tab row.** It changes what a
  member sees in that row, though not which tab loads by default. One array
  entry to undo.
- **`/new` is a new top-level route.** Nothing links to it yet, so removing it
  costs the two links that point at it.
