import { useTranslations } from "next-intl";

import { AnalyticsCard } from "@/components/analytics/analytics-card";
import { MeterRow } from "@/components/analytics/meter-row";
import { weakestCategory } from "@/lib/analytics";
import type { CategoryResult } from "@/types/analytics";

export function CategorySuccess({
  categories,
}: {
  categories: CategoryResult[];
}) {
  const t = useTranslations();
  const weakest = weakestCategory(categories);

  return (
    <AnalyticsCard
      title={t("analytics.categories.title")}
      caption={
        weakest
          ? t("analytics.categories.weakest", {
              category: t(`workflow.category.${weakest}`),
            })
          : t("analytics.categories.caption")
      }
    >
      <ul className="grid gap-3">
        {categories.map((item) => (
          <MeterRow
            key={item.category}
            label={t(`workflow.category.${item.category}`)}
            percent={item.rate ?? 0}
            value={item.rate === null ? "—" : `${item.rate}%`}
            barClassName="bg-success"
          />
        ))}
      </ul>
    </AnalyticsCard>
  );
}
