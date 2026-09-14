import {
  STAGE_STATUS_CLASSES,
  STAGE_STATUS_LABELS,
} from "@/constants/workflow";
import { cn } from "@/lib/utils";
import type { StageStatus } from "@/types/workflow";

export function StageStatusBadge({ status }: { status: StageStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase",
        STAGE_STATUS_CLASSES[status],
      )}
    >
      {STAGE_STATUS_LABELS[status]}
    </span>
  );
}
