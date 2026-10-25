import { useTranslations } from "next-intl";

import { STAGE_STATUS_CLASSES } from "@/constants/workflow";
import { cn } from "@/lib/utils";
import type { StageStatus } from "@/types/workflow";

export function StageStatusBadge({ status }: { status: StageStatus }) {
  const t = useTranslations("workflow.status");

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase",
        STAGE_STATUS_CLASSES[status],
      )}
    >
      {t(status)}
    </span>
  );
}
