import {
  IconApi,
  IconBug,
  IconChartBar,
  IconCloudUpload,
  IconFileText,
  IconGitPullRequest,
  IconLayout,
  IconListCheck,
  IconPalette,
  IconShieldLock,
  IconSpeakerphone,
  IconTestPipe,
  IconWriting,
  type Icon,
} from "@tabler/icons-react";

import type { SkillCategory } from "@/lib/skill-taxonomy";

/**
 * One icon per skill category (VIB-132). A Record, like CategoryIcon, so a
 * value added to the `skill_category` enum fails the typecheck here rather
 * than rendering a tile with no icon.
 */
const ICONS: Record<SkillCategory, Icon> = {
  design_ui: IconPalette,
  frontend: IconLayout,
  backend_apis: IconApi,
  testing_qa: IconTestPipe,
  code_review: IconGitPullRequest,
  debugging: IconBug,
  planning_workflow: IconListCheck,
  docs_writing: IconWriting,
  data_analysis: IconChartBar,
  devops_deploy: IconCloudUpload,
  security: IconShieldLock,
  marketing_content: IconSpeakerphone,
  documents_office: IconFileText,
};

export function SkillCategoryIcon({ category, className }: { category: SkillCategory; className?: string }) {
  const Glyph = ICONS[category];
  return <Glyph aria-hidden className={className} />;
}
