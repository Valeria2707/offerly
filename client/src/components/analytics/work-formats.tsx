import { AnalyticsCard } from "@/components/analytics/analytics-card";
import { MeterRow } from "@/components/analytics/meter-row";
import { UNKNOWN_WORK_FORMAT_LABEL } from "@/constants/analytics";
import { barPercent } from "@/lib/analytics";
import type { WorkFormatCount } from "@/types/analytics";

export function WorkFormats({ formats }: { formats: WorkFormatCount[] }) {
  const max = Math.max(0, ...formats.map((item) => item.count));

  return (
    <AnalyticsCard title="Формат роботи">
      <ul className="grid gap-3">
        {formats.map((item) => (
          <MeterRow
            key={item.label ?? UNKNOWN_WORK_FORMAT_LABEL}
            label={item.label ?? UNKNOWN_WORK_FORMAT_LABEL}
            percent={barPercent(item.count, max)}
            value={String(item.count)}
            barClassName="bg-ai"
          />
        ))}
      </ul>
    </AnalyticsCard>
  );
}
