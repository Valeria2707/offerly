import type { Locale } from "@/constants/i18n";
import { CLOSED_STAGE_STATUSES } from "@/constants/workflow";
import { eventTime, relativeDay } from "@/lib/calendar";
import type { Translator } from "@/lib/i18n";
import type { StageNameFormatter } from "@/lib/workflow";
import type { Reminder } from "@/types/calendar";
import type { WorkflowStage } from "@/types/workflow";

export type ReminderAction = "record" | "prepare" | "open";

export type ReminderView = {
  title: string;
  note: string;
  action: ReminderAction;
  urgent: boolean;
};

export function reminderView(
  reminder: Reminder,
  t: Translator,
  stageName: StageNameFormatter,
  locale: Locale,
): ReminderView {
  const name = stageName(reminder.name);
  const when = relativeDay(reminder.days, locale);

  switch (reminder.kind) {
    case "record_result":
      return {
        title: t("calendar.reminder.recordTitle", { name }),
        note: t("calendar.reminder.recordNote", {
          when,
          status: t(`workflow.status.${reminder.status}`),
        }),
        action: "record",
        urgent: true,
      };
    case "interview_today":
    case "interview_tomorrow":
      return {
        title: reminder.scheduledAt
          ? t("calendar.reminder.interviewTitle", {
              name,
              when,
              time: eventTime(new Date(reminder.scheduledAt)),
            })
          : name,
        note: t("calendar.reminder.interviewNote"),
        action: "prepare",
        urgent: false,
      };
    case "deadline_soon":
      return {
        title: t("calendar.reminder.deadlineTitle", { name, when }),
        note: t("calendar.reminder.deadlineNote"),
        action: "open",
        urgent: reminder.days === 0,
      };
    default:
      return {
        title: t("calendar.reminder.silenceTitle", {
          name,
          days: Math.abs(reminder.days),
        }),
        note: t("calendar.reminder.silenceNote"),
        action: "open",
        urgent: false,
      };
  }
}

export type VacancyReminder = {
  key: string;
  title: string;
  at: Date;
  tone: "meeting" | "deadline" | "action";
};

export function vacancyReminders(
  stages: WorkflowStage[],
  now: Date,
  t: Translator,
  stageName: StageNameFormatter,
): VacancyReminder[] {
  const reminders: VacancyReminder[] = [];

  for (const stage of stages) {
    if (CLOSED_STAGE_STATUSES.includes(stage.status)) continue;

    const name = stageName(stage.name);
    const scheduled = stage.scheduledAt ? new Date(stage.scheduledAt) : null;
    const deadline = stage.deadlineAt ? new Date(stage.deadlineAt) : null;

    if (scheduled && scheduled.getTime() > now.getTime())
      reminders.push({
        key: `meeting-${stage.id}`,
        title: name,
        at: scheduled,
        tone: "meeting",
      });

    if (scheduled && scheduled.getTime() <= now.getTime())
      reminders.push({
        key: `result-${stage.id}`,
        title: t("calendar.reminder.recordTitle", { name }),
        at: scheduled,
        tone: "action",
      });

    if (deadline && deadline.getTime() > now.getTime())
      reminders.push({
        key: `deadline-${stage.id}`,
        title: t("calendar.reminder.deadlineShort", { name }),
        at: deadline,
        tone: "deadline",
      });
  }

  return reminders.sort(
    (left, right) => left.at.getTime() - right.at.getTime(),
  );
}
