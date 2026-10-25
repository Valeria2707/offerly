import { useTranslations } from "next-intl";

import { AnalyticsCard } from "@/components/analytics/analytics-card";
import { MeterRow } from "@/components/analytics/meter-row";
import { FUNNEL_STEP_CLASSES } from "@/constants/analytics";
import { barPercent, funnelTotal, sharePercent } from "@/lib/analytics";
import type { FunnelStepCount } from "@/types/analytics";

export function HiringFunnel({ funnel }: { funnel: FunnelStepCount[] }) {
  const t = useTranslations("analytics.funnel");
  const total = funnelTotal(funnel);

  return (
    <AnalyticsCard
      title={t("title")}
      caption={t("caption")}
    >
      <ol className="grid gap-3">
        {funnel.map((item) => {
          const share = sharePercent(item.count, total);

          return (
            <MeterRow
              key={item.step}
              label={t(`steps.${item.step}`)}
              percent={barPercent(item.count, total)}
              value={
                item.step === "added" || share === null
                  ? String(item.count)
                  : `${item.count} · ${share}%`
              }
              barClassName={FUNNEL_STEP_CLASSES[item.step]}
            />
          );
        })}
      </ol>
    </AnalyticsCard>
  );
}
