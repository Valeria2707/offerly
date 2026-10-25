import { AnalyticsCard } from "@/components/analytics/analytics-card";
import { OUTCOME_ITEMS } from "@/constants/analytics";
import { sharePercent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { AnalyticsOutcomes } from "@/types/analytics";

export function OutcomeBreakdown({
  outcomes,
}: {
  outcomes: AnalyticsOutcomes;
}) {
  const total = OUTCOME_ITEMS.reduce(
    (sum, item) => sum + outcomes[item.key],
    0,
  );

  return (
    <AnalyticsCard title="Результати">
      <div
        aria-hidden
        className="flex h-3.5 overflow-hidden rounded-full bg-muted"
      >
        {OUTCOME_ITEMS.map((item) => (
          <span
            key={item.key}
            className={item.className}
            style={{ width: `${sharePercent(outcomes[item.key], total) ?? 0}%` }}
          />
        ))}
      </div>

      <ul className="grid gap-2.5">
        {OUTCOME_ITEMS.map((item) => (
          <li key={item.key} className="flex items-center gap-2.5 text-sm">
            <span
              aria-hidden
              className={cn("size-2.5 shrink-0 rounded-sm", item.className)}
            />
            {item.label}
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {outcomes[item.key]}
            </span>
          </li>
        ))}
      </ul>
    </AnalyticsCard>
  );
}
