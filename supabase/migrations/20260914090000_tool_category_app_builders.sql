-- App Builders category (VIB-136).
--
-- Prompt-to-app and AI site builders (Lovable, Bolt, Base44 and the like)
-- were filed under the catch-all `tools`, next to Slack and ClickUp. Placed
-- after `chats` to match the display order in lib/tool-categories.ts.
alter type tool_category add value if not exists 'app_builders' after 'chats';
