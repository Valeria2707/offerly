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
  const cards = [
    {
      label: "Вакансій додано",
      value: summary.added,
      hint: addedHint(summary, period),
    },
    {
      label: "Активні процеси",
      value: summary.active,
      hint: `${summary.awaiting} чекають відповіді`,
    },
    {
      label: "Конверсія в оффер",
      value: `${summary.offerRate}%`,
      hint: `${summary.offers} з ${summary.added}`,
      className: "text-success",
      cardClassName: "bg-success-muted ring-success/20",
    },
    {
      label: "Середня тривалість",
      value: formatDays(summary.averageDays),
      hint: "від додавання до результату",
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
