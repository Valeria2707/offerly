import { format } from "date-fns";
import { uk } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { vacancyReminders } from "@/lib/reminders";
import type { WorkflowStage } from "@/types/workflow";

const TONE_CLASSES = {
  meeting: "bg-primary",
  deadline: "bg-warning",
  action: "bg-terracotta",
} as const;

export function WorkflowReminders({
  stages,
  now,
}: {
  stages: WorkflowStage[];
  now: Date;
}) {
  const reminders = vacancyReminders(stages, now);

  return (
    <section className="grid gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <div className="flex items-baseline justify-between">
        <h2 className="font-heading text-base font-bold">Нагадування</h2>
        {reminders.length > 0 && (
          <span className="text-xs text-subtle">{reminders.length}</span>
        )}
      </div>

      {reminders.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          З’являться самі, щойно у етапу буде дата зустрічі або дедлайн.
        </p>
      ) : (
        <ul className="grid gap-2.5">
          {reminders.map((reminder) => (
            <li key={reminder.key} className="flex gap-2.5">
              <span
                aria-hidden
                className={cn(
                  "w-[3px] shrink-0 rounded-sm",
                  TONE_CLASSES[reminder.tone],
                )}
              />

              <div className="min-w-0">
                <p className="text-[13px] font-semibold">{reminder.title}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {format(reminder.at, "EEE, d MMM · HH:mm", { locale: uk })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
