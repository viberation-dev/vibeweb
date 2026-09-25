-- Two fixes to the fourteen families VIB-206 shipped (VIB-207).
--
-- 1. Names. Three rows shipped as "DeepSeek models", "Grok models" and
--    "Kimi models" because the plain slugs were already taken by the chat
--    apps of the same name. That was a slug problem solved in the name
--    column, and it shows: a grid where twelve cards say "Qwen", "GLM",
--    "Llama" and three say "X models" looks like a mistake, because it is
--    one. The names go back to the plain brand name; the slugs stay as they
--    are, because these pages are live and linked.
--
--    The consequence, stated plainly: the directory now has two cards called
--    "Grok" — the chat app under Chats, the model family under Models — and
--    the same for DeepSeek and Kimi. Inside a category listing that reads
--    correctly. In search results it is a real ambiguity, and the honest fix
--    for that is a category label beside the name in results, not a suffix
--    on three names out of eighteen.
--
-- 2. Badges. None of the fourteen got one. site_settings.tool_badge_mode is
--    'staff', so the badge column is the only source there is — a row
--    inserted without it never shows "New" no matter how recently it was
--    created. VIB-206's insert simply omitted the column. Setting it here.
--
--    Worth knowing rather than fixing quietly: every future insert has to
--    remember this, and the next one will forget too. The structural fix is
--    tool_badge_mode = 'both', which lets the derived rule (created inside
--    badge_new_days) fill in whatever staff did not set. That is a
--    site-wide behaviour change affecting every tool, and VIB-187 chose
--    'staff' for a stated reason, so it is Ali's call and not made here.
update tools set name = 'DeepSeek', updated_at = now() where slug = 'deepseek-models';
update tools set name = 'Grok',     updated_at = now() where slug = 'grok-models';
update tools set name = 'Kimi',     updated_at = now() where slug = 'kimi-models';

update tools set badge = 'new', updated_at = now()
where slug in (
  'qwen', 'deepseek-models', 'kimi-models', 'grok-models', 'glm', 'ling',
  'mimo', 'minimax', 'nemotron', 'gemma', 'llama', 'hy', 'voxtral',
  'space-bunny-alpha'
)
and badge is null;
