import { useTranslations } from "next-intl";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ANALYTICS_PERIOD_OPTIONS } from "@/constants/analytics";

export function AnalyticsPeriodFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("analytics.periods");

  return (
    <Tabs value={value} onValueChange={(next) => onChange(String(next))}>
      <TabsList aria-label={t("label")} className="h-9 bg-secondary p-1">
        {ANALYTICS_PERIOD_OPTIONS.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className="px-3 data-active:bg-card"
          >
            {t(option.value)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
