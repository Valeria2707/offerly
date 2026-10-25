import { AnalyticsCard } from "@/components/analytics/analytics-card";
import { MeterRow } from "@/components/analytics/meter-row";
import { STAGE_CATEGORY_LABELS } from "@/constants/workflow";
import { weakestCategory } from "@/lib/analytics";
import type { CategoryResult } from "@/types/analytics";

export function CategorySuccess({
  categories,
}: {
  categories: CategoryResult[];
}) {
  const weakest = weakestCategory(categories);

  return (
    <AnalyticsCard
      title="Успішність за типом етапу"
      caption={
        weakest
          ? `Найчастіше відсіюють на етапах «${weakest}»`
          : "Частка пройдених серед завершених етапів"
      }
    >
      <ul className="grid gap-3">
        {categories.map((item) => (
          <MeterRow
            key={item.category}
            label={STAGE_CATEGORY_LABELS[item.category]}
            percent={item.rate ?? 0}
            value={item.rate === null ? "—" : `${item.rate}%`}
            barClassName="bg-success"
          />
        ))}
      </ul>
    </AnalyticsCard>
  );
}
