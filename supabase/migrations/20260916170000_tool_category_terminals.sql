-- Terminals category (VIB-161).
--
-- Every walkthrough says "run this command", and a beginner does not know
-- where. Terminal apps and shells (Windows Terminal, PowerShell, Git Bash,
-- macOS Terminal, Warp and the like) had no home in the directory. Placed
-- after `ides` to match the display order in lib/tool-categories.ts: the
-- editor, then the window you run commands in, then the CLIs that run there.
alter type tool_category add value if not exists 'terminals' after 'ides';
