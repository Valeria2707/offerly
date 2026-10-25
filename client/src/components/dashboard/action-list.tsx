import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { vacancyStageRoute } from "@/constants/routes";
import { actionNote } from "@/lib/dashboard";
import { cn } from "@/lib/utils";
import { stageName } from "@/lib/workflow";
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
  return (
    <DashboardCard title="Потребує дії">
      {reminders.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Усе під контролем — термінових справ немає.
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
                    {record ? "Запиши результат · " : ""}
                    {stageName(reminder.name)}
                    {company && ` · ${company}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {actionNote(reminder)}
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
                      Пройдено
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={pending}
                      onClick={() => onRecord(reminder, "cancelled")}
                    >
                      Відмова
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
                    Відкрити
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
