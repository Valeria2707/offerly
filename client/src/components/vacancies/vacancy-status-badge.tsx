import {
  VACANCY_STATUS_CLASSES,
  VACANCY_STATUS_LABELS,
} from "@/constants/vacancy";
import { cn } from "@/lib/utils";
import type { VacancyStatus } from "@/types/vacancy";

export function VacancyStatusBadge({ status }: { status: VacancyStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase",
        VACANCY_STATUS_CLASSES[status]
      )}
    >
      {VACANCY_STATUS_LABELS[status]}
    </span>
  );
}
