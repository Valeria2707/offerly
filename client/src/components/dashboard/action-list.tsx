import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { vacancyStageRoute } from "@/constants/routes";
import { useStageName } from "@/hooks/use-stage-name";
import { actionNote } from "@/lib/dashboard";
import { cn } from "@/lib/utils";
import type { Reminder } from "@/types/calendar";
import type { StageStatus } from "@/types/workflow";

export function ActionList({
  reminders,
  companyOf,
  pending,
  onRecord,
}: {
  reminders: Reminder[];
  companyOf: (vacancyId: string) => string | null;
  pending: boolean;
  onRecord: (reminder: Reminder, status: StageStatus) => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const stageName = useStageName();

  return (
    <DashboardCard title={t("dashboard.actions.title")}>
      {reminders.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("dashboard.actions.empty")}
        </p>
      ) : (
        <ul className="grid divide-y divide-border">
          {reminders.map((reminder) => {
            const record = reminder.kind === "record_result";
            const company = companyOf(reminder.vacancyId);

            return (
              <li
                key={`${reminder.kind}-${reminder.stageId}`}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    record ? "bg-rejected" : "bg-terracotta",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {record ? `${t("dashboard.actions.record")} · ` : ""}
                    {stageName(reminder.name)}
                    {company && ` · ${company}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {actionNote(reminder, t, locale)}
                  </p>
                </div>

                {record ? (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={pending}
                      onClick={() => onRecord(reminder, "completed")}
                    >
                      {t("dashboard.actions.passed")}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={pending}
                      onClick={() => onRecord(reminder, "cancelled")}
                    >
                      {t("dashboard.actions.rejected")}
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    nativeButton={false}
                    render={
                      <Link
                        href={vacancyStageRoute(
                          reminder.vacancyId,
                          reminder.stageId,
                        )}
                      />
                    }
                  >
                    {t("common.actions.open")}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
}
