import {
  STAGE_CATEGORY_CLASSES,
  STAGE_CATEGORY_LABELS,
} from "@/constants/workflow";
import { cn } from "@/lib/utils";
import type { StageCategory } from "@/types/workflow";

export function StageCategoryBadge({ category }: { category: StageCategory }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase",
        STAGE_CATEGORY_CLASSES[category],
      )}
    >
      {STAGE_CATEGORY_LABELS[category]}
    </span>
  );
}
