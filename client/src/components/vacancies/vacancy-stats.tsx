import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { WorkflowSummary } from "@/types/workflow";

export function VacancyStats({
  total,
  summaries,
}: {
  total: number;
  summaries: WorkflowSummary[];
}) {
  const t = useTranslations("vacancies.stats");
  const inProgress = summaries.filter(
    (summary) => summary.currentStage && !summary.rejected,
  ).length;

  const cards = [
    { label: t("total"), value: total },
    { label: t("inProgress"), value: inProgress },
    {
      label: t("rejected"),
      value: summaries.filter((summary) => summary.rejected).length,
      className: "text-rejected",
    },
    {
      label: t("offers"),
      value: summaries.filter((summary) => summary.offered).length,
      className: "text-success",
      cardClassName: "bg-success-muted ring-success/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            "rounded-xl bg-card p-4 ring-1 ring-foreground/10",
            card.cardClassName,
          )}
        >
          <span className="font-mono text-[10px] tracking-[0.12em] text-subtle uppercase">
            {card.label}
          </span>
          <p className={cn("mt-2 text-2xl font-semibold", card.className)}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
