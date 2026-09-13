-- Live skill facts (VIB-130). One pointer, not a copy, for the same reason as
-- openrouter_id: installs and audits change daily on skills.sh, and a snapshot
-- here would be stale by the next deploy. lib/integrations/skills-sh.ts reads
-- the rest at request time, cached for an hour.
alter table tools add column skills_sh_source text;

-- The same shape lib/skill-facts.ts checks (SKILLS_SH_SOURCE): owner/repo for a
-- pack, owner/repo/skill for one skill. The adapter puts it in a URL, so no
-- segment can start with a dot.
alter table tools add constraint tools_skills_sh_source_shape check (
  skills_sh_source ~ '^[A-Za-z0-9][A-Za-z0-9._-]*/[A-Za-z0-9][A-Za-z0-9._-]*(/[A-Za-z0-9][A-Za-z0-9._:-]*)?$'
);

comment on column tools.skills_sh_source is
  'skills.sh source (owner/repo or owner/repo/skill) for live installs, audits and files on skill pages. Null for everything that is not on skills.sh (VIB-130).';
