import { DASHBOARD_STAT_LABELS } from "@/constants/dashboard";
import type { DashboardStats as Stats } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

export function DashboardStats({
  stats,
  className,
}: {
  stats: Stats;
  className?: string;
}) {
  const cards: {
    key: keyof Stats;
    value: number;
    className?: string;
    cardClassName?: string;
  }[] = [
    { key: "active", value: stats.active },
    { key: "awaiting", value: stats.awaiting, className: "text-warning" },
    { key: "rejected", value: stats.rejected, className: "text-rejected" },
    {
      key: "offers",
      value: stats.offers,
      className: "text-success",
      cardClassName: "bg-success-muted ring-success/20",
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {cards.map((card) => (
        <div
          key={card.key}
          className={cn(
            "rounded-xl bg-card p-4 ring-1 ring-foreground/10",
            card.cardClassName,
          )}
        >
          <span className="font-mono text-[10px] tracking-[0.12em] text-subtle uppercase">
            {DASHBOARD_STAT_LABELS[card.key]}
          </span>
          <p
            className={cn(
              "mt-2 text-2xl font-semibold",
              card.className,
            )}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
