import {
  CLOSED_STAGE_STATUSES,
  STAGE_STATUS_LABELS,
} from "@/constants/workflow";
import { eventTime, relativeDay } from "@/lib/calendar";
import { stageName } from "@/lib/workflow";
import type { Reminder } from "@/types/calendar";
import type { WorkflowStage } from "@/types/workflow";

export type ReminderAction = "record" | "prepare" | "open";

export type ReminderView = {
  title: string;
  note: string;
  action: ReminderAction;
  urgent: boolean;
};

export function reminderView(reminder: Reminder): ReminderView {
  const name = stageName(reminder.name);

  switch (reminder.kind) {
    case "record_result":
      return {
        title: `Внести результат · ${name}`,
        note: `Співбесіда була ${relativeDay(reminder.days)}, статус досі «${STAGE_STATUS_LABELS[reminder.status]}». Питання забуваються за кілька днів.`,
        action: "record",
        urgent: true,
      };
    case "interview_today":
    case "interview_tomorrow":
      return {
        title: reminder.scheduledAt
          ? `${name} ${relativeDay(reminder.days)} о ${eventTime(new Date(reminder.scheduledAt))}`
          : name,
        note: "Варто перечитати підготовку перед розмовою.",
        action: "prepare",
        urgent: false,
      };
    case "deadline_soon":
      return {
        title: `Дедлайн ${relativeDay(reminder.days)} · ${name}`,
        note: "Залишилось небагато часу, щоб завершити й надіслати.",
        action: "open",
        urgent: reminder.days === 0,
      };
    default:
      return {
        title: `Тиша ${Math.abs(reminder.days)} дн. · ${name}`,
        note: "Компанія давно не відповідає. Можна написати рекрутеру.",
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
        title: `Внести результат · ${name}`,
        at: scheduled,
        tone: "action",
      });

    if (deadline && deadline.getTime() > now.getTime())
      reminders.push({
        key: `deadline-${stage.id}`,
        title: `Дедлайн · ${name}`,
        at: deadline,
        tone: "deadline",
      });
  }

  return reminders.sort(
    (left, right) => left.at.getTime() - right.at.getTime(),
  );
}
