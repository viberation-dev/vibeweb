-- Replace the automatic table grants with explicit ones (VIB-60, second half).
--
-- Migration 20 closed the door for future tables. This one closes it for the
-- 16 that already exist: anon and authenticated held DELETE, INSERT,
-- REFERENCES, SELECT, TRIGGER, TRUNCATE and UPDATE on every one of them,
-- inherited from the platform and never written by us.
--
-- RLS was and remains the boundary — none of those privileges could read a
-- row a policy denied. What changes is that a policy is no longer the *only*
-- thing standing in the way: a table nobody should write is now also a table
-- the role cannot write.
--
-- Revoke and re-grant in one transaction. A missed grant is a loud 42501, not
-- a silent exposure, and rolling back beats serving half of them.

revoke all on all tables in schema public from anon, authenticated;

-- The public catalogue. What a signed-out visitor is allowed to read.
grant select on
  tools, content, tags, tool_tags, content_tags, prompts, prompt_tags,
  collections, collection_items, wizards, wizard_recommended_tools
to anon, authenticated;

/*
 * Staff writes.
 *
 * The admin editors (VIB-59) write `content` and `tools` over the Data API as
 * an ordinary authenticated session — is_staff() in the policy is what limits
 * that to staff. So the grant belongs to the role and the policy decides the
 * person. The issue's original plan said select-only here, which predates
 * those editors and would have made every /admin save fail with 42501.
 *
 * The other nine staff-write tables get the same treatment: RLS already says
 * that is who may write them, and a future tag or collection editor should
 * meet its policy rather than a permission error.
 */
grant insert, update, delete on
  tools, content, tags, tool_tags, content_tags, prompts, prompt_tags,
  collections, collection_items, wizards, wizard_recommended_tools
to authenticated;

-- `profiles` is `select using (true)` (migration 02) — usernames are public.
-- Update is owner-only by policy; no insert, because handle_new_user() is
-- security definer and creates the row as the function's owner.
grant select on profiles to anon, authenticated;
grant update on profiles to authenticated;

-- Owner-scoped data. Nothing for anon at all, so a signed-out request cannot
-- reach these even if a policy were one day written carelessly.
grant select, insert, update, delete on bookmarks, history_items, wizard_progress
to authenticated;

/*
 * tool_clicks is write-only from outside: /go/[slug] records an anonymous
 * click and nothing in the app reads it back. No select for either role — a
 * click log should not be enumerable through the API.
 */
grant insert on tool_clicks to anon, authenticated;
