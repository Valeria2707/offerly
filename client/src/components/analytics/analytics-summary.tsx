import { useTranslations } from "next-intl";

import { addedHint, formatDays } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { AnalyticsSummary as Summary } from "@/types/analytics";

export function AnalyticsSummary({
  summary,
  period,
}: {
  summary: Summary;
  period: number | null;
}) {
  const t = useTranslations();
  const cards = [
    {
      label: t("analytics.summary.added"),
      value: summary.added,
      hint: addedHint(summary, period, t),
    },
    {
      label: t("analytics.summary.active"),
      value: summary.active,
      hint: t("analytics.summary.awaiting", { count: summary.awaiting }),
    },
    {
      label: t("analytics.summary.offerRate"),
      value: `${summary.offerRate}%`,
      hint: t("analytics.summary.offersOf", {
        offers: summary.offers,
        added: summary.added,
      }),
      className: "text-success",
      cardClassName: "bg-success-muted ring-success/20",
    },
    {
      label: t("analytics.summary.duration"),
      value: formatDays(summary.averageDays, t),
      hint: t("analytics.summary.durationHint"),
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
          {card.hint && (
            <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
          )}
        </div>
      ))}
    </div>
  );
}
