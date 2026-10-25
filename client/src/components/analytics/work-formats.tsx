import { useTranslations } from "next-intl";

import { AnalyticsCard } from "@/components/analytics/analytics-card";
import { MeterRow } from "@/components/analytics/meter-row";
import { barPercent } from "@/lib/analytics";
import type { WorkFormatCount } from "@/types/analytics";

export function WorkFormats({ formats }: { formats: WorkFormatCount[] }) {
  const t = useTranslations("analytics.workFormats");
  const max = Math.max(0, ...formats.map((item) => item.count));

  return (
    <AnalyticsCard title={t("title")}>
      <ul className="grid gap-3">
        {formats.map((item) => (
          <MeterRow
            key={item.label ?? "unknown"}
            label={item.label ?? t("unknown")}
            percent={barPercent(item.count, max)}
            value={String(item.count)}
            barClassName="bg-ai"
          />
        ))}
      </ul>
    </AnalyticsCard>
  );
}
