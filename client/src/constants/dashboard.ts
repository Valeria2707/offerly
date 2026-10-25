import type { ReminderKind } from "@/types/calendar";
import type { StageCategory } from "@/types/workflow";

export const UPCOMING_DAYS = 14;
export const UPCOMING_LIMIT = 4;
export const ACTIVE_PROCESSES_LIMIT = 5;
export const PROFILE_HINT_LIMIT = 2;

export const UPCOMING_LINE_CLASSES: Record<StageCategory, string> = {
  screening: "bg-subtle",
  technical: "bg-primary",
  behavioral: "bg-ai",
  administrative: "bg-warning",
};

export const DEADLINE_LINE_CLASS = "bg-terracotta";

export const ACTION_REMINDER_KINDS: ReminderKind[] = [
  "record_result",
  "deadline_soon",
];
