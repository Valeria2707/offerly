import { useLocale, useTranslations } from "next-intl";

import { AnalyticsCard } from "@/components/analytics/analytics-card";
import { WEEKLY_SERIES } from "@/constants/analytics";
import { axisTicks, barPercent, weekLabel, weekRange } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { WeeklyActivity as Week } from "@/types/analytics";

export function WeeklyActivity({ weeks }: { weeks: Week[] }) {
  const t = useTranslations("analytics.weekly");
  const locale = useLocale();
  const ticks = axisTicks(
    Math.max(0, ...weeks.flatMap((week) => [week.vacancies, week.stages])),
  );
  const top = ticks[ticks.length - 1];
  const offset = (tick: number) => ({ bottom: `${(tick / top) * 100}%` });

  return (
    <AnalyticsCard title={t("title")}>
      <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2">
        <div aria-hidden className="relative h-40">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 translate-y-1/2 font-mono text-[10px] text-subtle"
              style={offset(tick)}
            >
              {tick}
            </span>
          ))}
        </div>

        <div className="relative h-40 border-b border-border">
          {ticks.slice(1).map((tick) => (
            <span
              key={tick}
              aria-hidden
              className="absolute inset-x-0 border-t border-dashed border-border"
              style={offset(tick)}
            />
          ))}

          <ol className="relative flex h-full items-end gap-2">
            {weeks.map((week) => (
              <li
                key={week.weekStart}
                tabIndex={0}
                aria-label={t("weekLabel", {
                  range: weekRange(week.weekStart, locale),
                  vacancies: week.vacancies,
                  stages: week.stages,
                })}
                className="group relative flex h-full min-w-0 flex-1 items-end justify-center gap-0.5 rounded-t-md outline-none hover:bg-muted focus-visible:bg-muted"
              >
                {WEEKLY_SERIES.map((series) => (
                  <span
                    key={series.key}
                    aria-hidden
                    className={cn(
                      "w-full max-w-4 rounded-t-sm",
                      series.className,
                    )}
                    style={{ height: `${barPercent(week[series.key], top)}%` }}
                  />
                ))}

                <div
                  aria-hidden
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-lg bg-foreground px-3 py-2 text-xs whitespace-nowrap text-background group-hover:grid group-focus-visible:grid"
                >
                  <span className="font-medium">
                    {weekRange(week.weekStart, locale)}
                  </span>
                  {WEEKLY_SERIES.map((series) => (
                    <span key={series.key}>
                      {t(series.key)}: {week[series.key]}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <span aria-hidden />
        <div aria-hidden className="mt-2 flex gap-2">
          {weeks.map((week, index) => (
            <span
              key={week.weekStart}
              title={weekRange(week.weekStart, locale)}
              className="min-w-0 flex-1 truncate text-center font-mono text-[10px] text-subtle"
            >
              {weeks.length <= 6 || index % 2 === 0
                ? weekLabel(week.weekStart, locale)
                : ""}
            </span>
          ))}
        </div>
      </div>

      <ul className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {WEEKLY_SERIES.map((series) => (
          <li key={series.key} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className={cn("size-2.5 rounded-sm", series.className)}
            />
            {t(series.key)}
          </li>
        ))}
      </ul>
    </AnalyticsCard>
  );
}
