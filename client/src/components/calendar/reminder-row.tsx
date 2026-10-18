import Link from "next/link";

import { Button } from "@/components/ui/button";
import { REMINDER_ACTION_LABELS } from "@/constants/calendar";
import { vacancyRoute, vacancyStageRoute } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { reminderView } from "@/lib/reminders";
import type { Reminder } from "@/types/calendar";

export function ReminderRow({
  reminder,
  vacancyLabel,
}: {
  reminder: Reminder;
  vacancyLabel: string | null;
}) {
  const view = reminderView(reminder);
  const href =
    view.action === "open"
      ? vacancyRoute(reminder.vacancyId)
      : vacancyStageRoute(reminder.vacancyId, reminder.stageId);

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl py-3.5 pr-4",
        view.urgent ? "bg-warning-muted" : "bg-muted",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "w-[3px] shrink-0 self-stretch rounded-r-sm",
          view.urgent ? "bg-terracotta" : "bg-primary",
        )}
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {view.title}
          {vacancyLabel && (
            <span className="font-normal text-muted-foreground">
              {" · "}
              {vacancyLabel}
            </span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{view.note}</p>
      </div>

      <Button
        size="sm"
        nativeButton={false}
        variant={view.urgent ? "default" : "secondary"}
        className={cn(view.urgent && "bg-terracotta hover:bg-terracotta/85")}
        render={<Link href={href}>{REMINDER_ACTION_LABELS[view.action]}</Link>}
      />
    </div>
  );
}
