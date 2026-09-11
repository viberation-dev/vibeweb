-- Bookmark one model inside a family (VIB-113).
--
-- A family page (Gemini, Claude) lists its models live from OpenRouter
-- (VIB-107). They are not rows, so a model bookmark is the family's tool row
-- plus the model's OpenRouter id. Null model_id is the family itself, which
-- is every bookmark that existed before this migration.
alter table bookmarks add column model_id text;

-- Same shape as OPENROUTER_ID in lib/model-facts.ts, and only on tools: an
-- article has no models.
alter table bookmarks add constraint bookmarks_model_id_shape check (
  model_id is null
  or (target_type = 'tool' and model_id ~ '^~?[a-z0-9][a-z0-9._-]*/[a-z0-9][a-z0-9._:-]*$')
);

comment on column bookmarks.model_id is
  'OpenRouter id of the saved model within the tool''s openrouter_family, e.g. google/gemini-3.7-flash. Null bookmarks the tool itself (VIB-113).';

-- One bookmark per model, and still exactly one for the family: nulls not
-- distinct makes (user, tool, null) collide with itself.
alter table bookmarks drop constraint bookmarks_user_id_target_type_target_id_key;
alter table bookmarks add constraint bookmarks_user_target_model_key
  unique nulls not distinct (user_id, target_type, target_id, model_id);

-- tools.bookmark_count stays "people who saved this", not rows: saving three
-- Gemini models counts once. Only a user's first row on a tool adds, and only
-- their last one removes.
--
-- ponytail: two concurrent first saves by the same user on the same tool can
-- each miss the other and count twice. One person racing themselves; fix with
-- an advisory lock on (user_id, target_id) if it ever shows up.
create or replace function sync_tool_bookmark_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.target_type = 'tool' then
    if not exists (
      select 1 from bookmarks
      where user_id = new.user_id and target_type = 'tool'
        and target_id = new.target_id and id <> new.id
    ) then
      update tools set bookmark_count = bookmark_count + 1 where id = new.target_id;
    end if;
  elsif tg_op = 'DELETE' and old.target_type = 'tool' then
    if not exists (
      select 1 from bookmarks
      where user_id = old.user_id and target_type = 'tool' and target_id = old.target_id
    ) then
      -- greatest() keeps a double-delete or a hand-fixed row from going negative.
      update tools set bookmark_count = greatest(0, bookmark_count - 1) where id = old.target_id;
    end if;
  end if;
  return null;
end; $$;

comment on function sync_tool_bookmark_count() is
  'Keeps tools.bookmark_count equal to the number of users with at least one bookmark on that tool, family or model (VIB-113). Other target kinds are ignored.';

-- No backfill: until this migration every bookmark had a null model_id, so
-- rows per tool already equal users per tool. The function keeps the EXECUTE
-- revoke from migration 08 — create or replace does not reset privileges.
