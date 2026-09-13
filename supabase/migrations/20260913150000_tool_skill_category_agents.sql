-- Skill categories and agent compatibility (VIB-132).
--
-- Neither skills.sh nor SkillsMP publishes a category or an agent list, so
-- both are editorial, set per skill in /admin.

-- A closed list, like tool_category: the /skills filter tiles are drawn from
-- it, and a free-text value would be a tile nobody can reach. Order is the
-- display order. lib/skill-taxonomy.ts mirrors it.
create type skill_category as enum (
  'design_ui',
  'frontend',
  'backend_apis',
  'testing_qa',
  'code_review',
  'debugging',
  'planning_workflow',
  'docs_writing',
  'data_analysis',
  'devops_deploy',
  'security',
  'marketing_content',
  'documents_office'
);

alter table tools add column skill_category skill_category;

comment on column tools.skill_category is
  'Category on the /skills hub. Only meaningful for category = skills; null means unfiled (VIB-132).';

-- Works everywhere unless marked. SKILL.md is one open format that every
-- listed agent reads, so compatibility is the default and the exception is
-- what gets stored: an agent a skill cannot run in, usually because it needs
-- a shell or files that agent does not have.
alter table tools add column skill_agents_excluded text[] not null default '{}';

-- The same ids as SKILL_AGENTS in lib/skill-taxonomy.ts.
alter table tools add constraint tools_skill_agents_excluded_known check (
  skill_agents_excluded <@ array[
    'claude-code', 'claude-ai', 'chatgpt', 'codex',
    'cursor', 'github-copilot', 'antigravity', 'gemini-cli'
  ]::text[]
);

comment on column tools.skill_agents_excluded is
  'Agents this skill does not work in. Empty means every agent on the /skills filter (VIB-132).';
