import { useTranslations } from "next-intl";

import { ReminderRow } from "@/components/calendar/reminder-row";
import type { Reminder } from "@/types/calendar";

export function TodayReminders({
  reminders,
  labelOf,
}: {
  reminders: Reminder[];
  labelOf: (vacancyId: string) => string | null;
}) {
  const t = useTranslations("calendar");

  if (reminders.length === 0) return null;

  return (
    <section className="grid gap-2.5 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
      <h2 className="font-heading text-base font-bold">{t("today")}</h2>

      {reminders.map((reminder) => (
        <ReminderRow
          key={`${reminder.kind}-${reminder.stageId}`}
          reminder={reminder}
          vacancyLabel={labelOf(reminder.vacancyId)}
        />
      ))}
    </section>
  );
}
