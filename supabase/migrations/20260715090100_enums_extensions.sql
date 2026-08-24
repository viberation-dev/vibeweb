-- Viberation MVP schema — 01: extensions & enums
-- Run order: 01 → 02 → 03 → 04 → 05. Supabase / Postgres.

create extension if not exists "pgcrypto";      -- gen_random_uuid()
-- pgvector is added later, only when AI generation lands (Phase 1.5):
-- create extension if not exists "vector";

-- Audience skill tier (content personalization)
create type role_level as enum ('beginner', 'intermediate', 'expert');

-- Staff / permission gate. Widenable: editor/author/contributor added Phase 1.5+.
create type app_role as enum ('member', 'admin', 'super_admin');

-- Account plan
create type user_plan as enum ('free', 'pro');

-- UI density
create type layout_mode as enum ('essentials', 'advanced');

-- Tool/directory categories (13, canonical — artifact-type taxonomy per §24/§07, 2026-08-15)
-- Retired app-area buckets (web_apps, frontend, backend) are NOT categories;
-- they are modeled as facet tags on directory items.
create type tool_category as enum (
  'models','agents','chats','skills','mcp_servers','plugins','frameworks',
  'clis','ides','tools','utilities','templates','workflows'
);

-- Wizard kind (§20 §3): 'wizard' = linear flagship project build (MVP) ·
-- 'setup' = reusable environment/agent config (Phase 1.5, uses reusable flag) ·
-- 'path' = branching build configurator (Phase 1.5). 'wizard' avoids colliding
-- with the 'workflows' tool CATEGORY. MVP ships kind='wizard' only.
create type wizard_kind as enum ('wizard','setup','path');

-- Editorial + documentation content types
create type content_type as enum (
  'article','guide','cheatsheet','course_link','help_article','role_guide'
);

-- Audience for role_guide docs (null for non-doc content)
create type docs_audience as enum ('enduser','author','admin','seller');

-- Polymorphic target kinds referenced by bookmarks / history / collection_items
create type target_kind as enum ('tool','content','prompt','collection','wizard');

-- Wizard publish status
create type wizard_status as enum ('draft','published');
