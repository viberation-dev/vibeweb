-- Comparison pages (VIB-184).
--
-- One row per curated "A vs B" page. The facts table on the page is drawn
-- live from the two `tools` rows, so it never goes stale; what lives here is
-- the part only an editor can write: the answer-first intro and the two
-- "pick this if" verdicts. Pairs are curated, not generated: a page with no
-- verdict is thin content, and that is the thing search engines penalise.
--
-- `slug` is written by the app from the two tool slugs on save
-- ("claude-vs-gpt") rather than derived per request, so the route can look
-- a page up by one indexed column.
--
-- `models_a` / `models_b`: for model families, which OpenRouter models to
-- set side by side. Chosen by hand because "the top three" is an editorial
-- call; the family's newest three can include batch and Pro variants.

create table tool_comparisons (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9-]+-vs-[a-z0-9-]+$'),
  tool_a_id   uuid not null references tools(id) on delete cascade,
  tool_b_id   uuid not null references tools(id) on delete cascade,
  intro       text not null check (char_length(intro) between 1 and 800),
  pick_a      text not null check (char_length(pick_a) between 1 and 400),
  pick_b      text not null check (char_length(pick_b) between 1 and 400),
  models_a    text[] not null default '{}' check (cardinality(models_a) <= 3),
  models_b    text[] not null default '{}' check (cardinality(models_b) <= 3),
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (tool_a_id <> tool_b_id)
);

comment on table tool_comparisons is
  'Curated "A vs B" pages at /compare/[slug] (VIB-184). Facts come from tools; this holds the editorial intro and verdicts.';

-- One page per pair, whichever way round it was entered.
create unique index tool_comparisons_pair_idx
  on tool_comparisons (least(tool_a_id, tool_b_id), greatest(tool_a_id, tool_b_id));

-- The tool page lists the comparisons it appears in, from either side.
create index tool_comparisons_tool_b_idx on tool_comparisons (tool_b_id);

alter table tool_comparisons enable row level security;

-- Same shape as testimonials: drafts are staff-only.
create policy tool_comparisons_read on tool_comparisons
  for select using (published or is_staff());

create policy tool_comparisons_write on tool_comparisons
  for all using (is_staff()) with check (is_staff());

-- Grants: required since migration 20 (VIB-60).
grant select on tool_comparisons to anon, authenticated;
grant insert, update, delete on tool_comparisons to authenticated;

-- The first three pairs, Ali's picks (2026-09-18). Published so the preview
-- shows them; edit the wording in /admin/comparisons. A slug that no longer
-- exists is simply skipped.
insert into tool_comparisons (slug, tool_a_id, tool_b_id, intro, pick_a, pick_b, models_a, models_b, published)
select s.slug, a.id, b.id, v.intro, v.pick_a, v.pick_b, v.models_a, v.models_b, true
from (values
  (
    'claude', 'gpt',
    'Claude and GPT are the two model families most vibe coders choose between: the models behind Claude.ai and ChatGPT. Both have a $20 a month chat plan and both work inside Cursor and GitHub Copilot. Claude is the stronger pick for long coding sessions across a large codebase. GPT is the better all-rounder if you want chat, images and coding in one subscription.',
    'You spend long sessions coding in one project, want an agent that works across a large codebase with Claude Code, or give your AI long, detailed instructions and need them followed.',
    'You want one subscription for chat, images and coding, want a cheaper way in with ChatGPT Go at $8 a month, or already work with Codex or Microsoft Azure.',
    array['anthropic/claude-fable-5.1', 'anthropic/claude-opus-5', 'anthropic/claude-sonnet-5'],
    array['openai/gpt-6-astra', 'openai/gpt-5.6-sol', 'openai/gpt-5.6-terra']
  ),
  (
    'cursor', 'devin-desktop',
    'Cursor and Devin Desktop are both AI editors built on VS Code, both free to start with a $20 a month Pro plan, and both let you choose between Claude, GPT and Gemini. Cursor is the safer default for everyday AI coding on any stack. Devin Desktop, formerly Windsurf, makes most sense if you came from Windsurf or already use Devin to run agents on whole tasks.',
    'You want a proven AI editor for everyday coding on any stack, want to bring your own API key, or want Cursor''s own models alongside Claude, GPT and Gemini.',
    'You are moving over from Windsurf, already use Devin for agent work, or want an agent built into the editor that takes on whole tasks.',
    array[]::text[], array[]::text[]
  ),
  (
    'lovable', 'replit',
    'Lovable and Replit both build a working app from a description in your browser, with a database, logins and hosting included, and both let you keep your code on GitHub. Lovable is the quicker path to a polished web app. Replit builds web apps, mobile apps and scripts in more languages, with a full editor in the browser when you want to open the code.',
    'You want a web app that looks good fast, are happy with React and Tailwind, or want to connect your own Supabase project and keep your code in two-way sync with GitHub.',
    'You want a mobile app or a script as well as web apps, prefer Python or another language, or want a full editor in the browser alongside the agent.',
    array[]::text[], array[]::text[]
  )
) as v(a_slug, b_slug, intro, pick_a, pick_b, models_a, models_b)
join tools a on a.slug = v.a_slug
join tools b on b.slug = v.b_slug
cross join lateral (select v.a_slug || '-vs-' || v.b_slug as slug) s(slug)
on conflict (slug) do nothing;
