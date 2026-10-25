import { useTranslations } from "next-intl";

import { STAGE_CATEGORY_CLASSES } from "@/constants/workflow";
import { cn } from "@/lib/utils";
import type { StageCategory } from "@/types/workflow";

export function StageCategoryBadge({ category }: { category: StageCategory }) {
  const t = useTranslations("workflow.category");

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase",
        STAGE_CATEGORY_CLASSES[category],
      )}
    >
      {t(category)}
    </span>
  );
}
