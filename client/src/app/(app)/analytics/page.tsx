"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { AnalyticsPeriodFilter } from "@/components/analytics/analytics-period-filter";
import { AnalyticsSkeleton } from "@/components/analytics/analytics-skeleton";
import { AnalyticsSummary } from "@/components/analytics/analytics-summary";
import { CategorySuccess } from "@/components/analytics/category-success";
import { HiringFunnel } from "@/components/analytics/hiring-funnel";
import { OutcomeBreakdown } from "@/components/analytics/outcome-breakdown";
import { SkillDemand } from "@/components/analytics/skill-demand";
import { WeeklyActivity } from "@/components/analytics/weekly-activity";
import { WorkFormats } from "@/components/analytics/work-formats";
import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";
import {
  ANALYTICS_PERIOD_OPTIONS,
  DEFAULT_ANALYTICS_PERIOD,
} from "@/constants/analytics";
import { ROUTES } from "@/constants/routes";
import { useAnalytics } from "@/hooks/use-analytics";

export default function AnalyticsPage() {
  const t = useTranslations("analytics");
  const [value, setValue] = useState(DEFAULT_ANALYTICS_PERIOD);
  const period =
    ANALYTICS_PERIOD_OPTIONS.find((option) => option.value === value)
      ?.period ?? null;

  const { data, isPending, error } = useAnalytics(period);

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <AnalyticsPeriodFilter value={value} onChange={setValue} />
      </header>

      <FormError error={error} />

      {isPending ? (
        <AnalyticsSkeleton />
      ) : (
        data && (
          <div className="grid gap-4">
            <AnalyticsSummary summary={data.summary} period={data.period} />

            {data.summary.added === 0 ? (
              <section className="grid justify-items-start gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
                <h2 className="font-heading text-base font-bold">
                  {t("empty.title")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("empty.description")}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={ROUTES.vacancies} />}
                >
                  {t("empty.action")}
                </Button>
              </section>
            ) : (
              <>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                  <HiringFunnel funnel={data.funnel} />
                  <OutcomeBreakdown outcomes={data.outcomes} />
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                  <WeeklyActivity weeks={data.weekly} />
                  <CategorySuccess categories={data.categories} />
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                  <SkillDemand skills={data.skills} />
                  <WorkFormats formats={data.workFormats} />
                </div>
              </>
            )}
          </div>
        )
      )}
    </div>
  );
}
