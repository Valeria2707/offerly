import { differenceInCalendarDays, format } from "date-fns";
import { uk } from "date-fns/locale";

import {
  ACTION_REMINDER_KINDS,
  PROFILE_HINT_LIMIT,
} from "@/constants/dashboard";
import {
  eventTime,
  isFinished,
  relativeDay,
  toEntries,
  type CalendarEntry,
} from "@/lib/calendar";
import { stageName } from "@/lib/workflow";
import type { CalendarEvent, Reminder } from "@/types/calendar";
import type { ProfileData } from "@/types/profile";
import type { Vacancy } from "@/types/vacancy";
import type { StageBrief, WorkflowSummary } from "@/types/workflow";

export type DashboardStats = {
  active: number;
  awaiting: number;
  rejected: number;
  offers: number;
};

export type ActiveProcess = {
  vacancy: Vacancy;
  stage: StageBrief;
  silentDays: number | null;
};

const isInProgress = (summary: WorkflowSummary | undefined) =>
  Boolean(summary?.currentStage && !summary.rejected && !summary.offered);

export function dashboardStats(
  vacancies: Vacancy[],
  summaries: Map<string, WorkflowSummary>,
): DashboardStats {
  const all = vacancies.map((vacancy) => summaries.get(vacancy.id));
  const active = vacancies
    .filter((vacancy) => vacancy.lifecycle === "active")
    .map((vacancy) => summaries.get(vacancy.id))
    .filter(isInProgress);

  return {
    active: active.length,
    awaiting: active.filter(
      (summary) => summary?.currentStage?.status === "awaiting_result",
    ).length,
    rejected: all.filter((summary) => summary?.rejected).length,
    offers: all.filter((summary) => summary?.offered).length,
  };
}

const nextDate = (stage: StageBrief) =>
  stage.scheduledAt ?? stage.deadlineAt ?? null;

export function activeProcesses(
  vacancies: Vacancy[],
  summaries: Map<string, WorkflowSummary>,
  reminders: Reminder[],
): ActiveProcess[] {
  const silence = new Map(
    reminders
      .filter((reminder) => reminder.kind === "silence")
      .map((reminder) => [reminder.stageId, Math.abs(reminder.days)]),
  );

  return vacancies
    .filter((vacancy) => vacancy.lifecycle === "active")
    .flatMap((vacancy) => {
      const summary = summaries.get(vacancy.id);
      if (!summary?.currentStage || !isInProgress(summary)) return [];

      const stage = summary.currentStage;
      return [{ vacancy, stage, silentDays: silence.get(stage.id) ?? null }];
    })
    .sort((left, right) => {
      const a = nextDate(left.stage);
      const b = nextDate(right.stage);
      if (a && b) return a.localeCompare(b);
      if (a) return -1;
      if (b) return 1;
      return 0;
    });
}

export function processNote(process: ActiveProcess): string {
  const { stage, silentDays } = process;
  const name = stageName(stage.name);

  if (silentDays !== null) return `Чекаєш відповіді ${silentDays} дн.`;
  if (stage.scheduledAt)
    return `${name}: ${format(new Date(stage.scheduledAt), "EEEEEE, HH:mm", { locale: uk })}`;
  if (stage.deadlineAt)
    return `${name} до ${format(new Date(stage.deadlineAt), "d MMM", { locale: uk })}`;
  if (stage.status === "awaiting_result") return `${name}: чекаєш відповіді`;

  return name;
}

export function whenLabel(entry: CalendarEntry, now: Date): string {
  const days = differenceInCalendarDays(entry.at, now);
  const day =
    days >= 0 && days <= 1
      ? `${relativeDay(days)}, ${format(entry.at, "d MMM", { locale: uk })}`
      : format(entry.at, "EEEEEE, d MMM", { locale: uk });

  return entry.kind === "meeting" ? `${day} · ${eventTime(entry.at)}` : day;
}

export function countdownLabel(at: Date, now: Date): string {
  return relativeDay(differenceInCalendarDays(at, now));
}

export function actionReminders(reminders: Reminder[]): Reminder[] {
  return reminders.filter((reminder) =>
    ACTION_REMINDER_KINDS.includes(reminder.kind),
  );
}

export function actionNote(reminder: Reminder): string {
  if (reminder.kind === "deadline_soon")
    return `дедлайн ${relativeDay(reminder.days)}`;

  const time = reminder.scheduledAt
    ? ` о ${eventTime(new Date(reminder.scheduledAt))}`
    : "";
  return `була ${relativeDay(reminder.days)}${time}`;
}

const PROFILE_SECTIONS: {
  label: string;
  filled: (data: ProfileData) => boolean;
}[] = [
  { label: "імʼя", filled: (data) => Boolean(data.basics.fullName) },
  { label: "заголовок", filled: (data) => Boolean(data.basics.headline) },
  { label: "опис про себе", filled: (data) => Boolean(data.basics.summary) },
  {
    label: "бажану посаду",
    filled: (data) => Boolean(data.preferences.desiredPosition),
  },
  { label: "навички", filled: (data) => data.skills.length > 0 },
  { label: "досвід", filled: (data) => data.experience.length > 0 },
  { label: "освіту", filled: (data) => data.education.length > 0 },
  { label: "проєкти", filled: (data) => data.projects.length > 0 },
  { label: "мови", filled: (data) => data.languages.length > 0 },
];

export function profileProgress(data: ProfileData): {
  percent: number;
  missing: string[];
} {
  const missing = PROFILE_SECTIONS.filter((section) => !section.filled(data));

  return {
    percent: Math.round(
      ((PROFILE_SECTIONS.length - missing.length) / PROFILE_SECTIONS.length) *
        100,
    ),
    missing: missing
      .slice(0, PROFILE_HINT_LIMIT)
      .map((section) => section.label),
  };
}

export function upcomingEntries(
  events: CalendarEvent[],
  now: Date,
): CalendarEntry[] {
  return toEntries(events).filter(
    (entry) =>
      !isFinished(entry.event) &&
      differenceInCalendarDays(entry.at, now) >= 0 &&
      (entry.kind === "deadline" || entry.at.getTime() >= now.getTime()),
  );
}

export function companyMark(company: string): string {
  const words = company.trim().split(/\s+/);
  const mark =
    words.length > 1 ? words.map((word) => word[0]).join("") : company;

  return mark.slice(0, 2).toUpperCase();
}

function pluralizeTasks(count: number): string {
  const lastTwo = count % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return "справ";

  const last = count % 10;
  if (last === 1) return "справа";
  if (last >= 2 && last <= 4) return "справи";
  return "справ";
}

export function tasksLabel(count: number): string {
  if (count === 0) return "термінових справ немає";
  return `${count} ${pluralizeTasks(count)} на сьогодні`;
}
