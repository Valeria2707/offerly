import type { StageCategory, StageStatus } from "@/types/workflow";

export const REMINDER_KINDS = [
  "record_result",
  "interview_today",
  "interview_tomorrow",
  "deadline_soon",
  "silence",
  "weekly_digest",
] as const;

export type ReminderKind = (typeof REMINDER_KINDS)[number];

export type CalendarEvent = {
  stageId: string;
  vacancyId: string;
  workflowId: string;
  name: string;
  category: StageCategory;
  status: StageStatus;
  scheduledAt: string | null;
  deadlineAt: string | null;
};

export type Reminder = CalendarEvent & {
  kind: ReminderKind;
  days: number;
};

export type ReminderSettings = {
  emailEnabled: boolean;
  beforeInterview: boolean;
  afterStage: boolean;
  beforeDeadline: boolean;
  silence: boolean;
  weeklyDigest: boolean;
  quietFrom: string;
  quietTo: string;
  calendarToken: string | null;
};

export type ReminderSettingsPatch = Partial<
  Omit<ReminderSettings, "calendarToken">
>;
