import type { ReminderAction } from "@/lib/reminders";
import type { StageCategory } from "@/types/workflow";

export const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

export const STAGE_CATEGORY_SHORT_LABELS: Record<StageCategory, string> = {
  screening: "скринінг",
  technical: "технічний",
  behavioral: "розмовний",
  administrative: "адмін",
};

export const REMINDER_ACTION_LABELS: Record<ReminderAction, string> = {
  record: "Внести",
  prepare: "Готуватись",
  open: "Відкрити",
};
