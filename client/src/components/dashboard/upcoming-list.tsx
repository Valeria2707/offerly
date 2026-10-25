import { useLocale, useTranslations } from "next-intl";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import {
  DEADLINE_LINE_CLASS,
  UPCOMING_LINE_CLASSES,
} from "@/constants/dashboard";
import { ROUTES } from "@/constants/routes";
import { useStageName } from "@/hooks/use-stage-name";
import type { CalendarEntry } from "@/lib/calendar";
import { whenLabel } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

export function UpcomingList({
  entries,
  companyOf,
  now,
}: {
  entries: CalendarEntry[];
  companyOf: (vacancyId: string) => string | null;
  now: Date;
}) {
  const t = useTranslations("dashboard.upcoming");
  const locale = useLocale();
  const stageName = useStageName();

  return (
    <DashboardCard
      title={t("title")}
      link={{ href: ROUTES.calendar, label: t("link") }}
    >
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <ol className="grid gap-3">
          {entries.map((entry) => {
            const company = companyOf(entry.event.vacancyId);

            return (
              <li key={entry.key} className="flex gap-3">
                <span
                  aria-hidden
                  className={cn(
                    "w-[3px] shrink-0 rounded-full",
                    entry.kind === "deadline"
                      ? DEADLINE_LINE_CLASS
                      : UPCOMING_LINE_CLASSES[entry.event.category],
                  )}
                />
                <div className="grid min-w-0">
                  <p className="truncate text-sm">
                    <span className="font-medium">
                      {entry.kind === "deadline"
                        ? t("deadline")
                        : stageName(entry.event.name)}
                    </span>
                    {company && ` · ${company}`}
                  </p>
                  <p className="font-mono text-[11px] text-subtle">
                    {whenLabel(entry, now, locale)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </DashboardCard>
  );
}
