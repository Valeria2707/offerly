import { differenceInCalendarDays, format } from "date-fns";

import {
  ACTION_REMINDER_KINDS,
  PROFILE_HINT_LIMIT,
} from "@/constants/dashboard";
import type { Locale } from "@/constants/i18n";
import {
  eventTime,
  isFinished,
  relativeDay,
  toEntries,
  type CalendarEntry,
} from "@/lib/calendar";
import { dateFnsLocale } from "@/lib/date-locale";
import type { Translator } from "@/lib/i18n";
import type { StageNameFormatter } from "@/lib/workflow";
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

export function processNote(
  process: ActiveProcess,
  t: Translator,
  stageName: StageNameFormatter,
  locale: Locale,
): string {
  const { stage, silentDays } = process;
  const name = stageName(stage.name);
  const options = { locale: dateFnsLocale(locale) };

  if (silentDays !== null)
    return t("dashboard.processes.silent", { days: silentDays });
  if (stage.scheduledAt)
    return t("dashboard.processes.scheduled", {
      name,
      when: format(new Date(stage.scheduledAt), "EEEEEE, HH:mm", options),
    });
  if (stage.deadlineAt)
    return t("dashboard.processes.deadline", {
      name,
      date: format(new Date(stage.deadlineAt), "d MMM", options),
    });
  if (stage.status === "awaiting_result")
    return t("dashboard.processes.awaiting", { name });

  return name;
}

export function whenLabel(
  entry: CalendarEntry,
  now: Date,
  locale: Locale,
): string {
  const options = { locale: dateFnsLocale(locale) };
  const days = differenceInCalendarDays(entry.at, now);
  const day =
    days >= 0 && days <= 1
      ? `${relativeDay(days, locale)}, ${format(entry.at, "d MMM", options)}`
      : format(entry.at, "EEEEEE, d MMM", options);

  return entry.kind === "meeting" ? `${day} · ${eventTime(entry.at)}` : day;
}

export function countdownLabel(at: Date, now: Date, locale: Locale): string {
  return relativeDay(differenceInCalendarDays(at, now), locale);
}

export function actionReminders(reminders: Reminder[]): Reminder[] {
  return reminders.filter((reminder) =>
    ACTION_REMINDER_KINDS.includes(reminder.kind),
  );
}

export function actionNote(
  reminder: Reminder,
  t: Translator,
  locale: Locale,
): string {
  const when = relativeDay(reminder.days, locale);

  if (reminder.kind === "deadline_soon")
    return t("dashboard.actions.deadlineNote", { when });
  if (reminder.scheduledAt)
    return t("dashboard.actions.wasAt", {
      when,
      time: eventTime(new Date(reminder.scheduledAt)),
    });
  return t("dashboard.actions.was", { when });
}

export type ProfileSectionKey =
  | "name"
  | "headline"
  | "summary"
  | "desiredPosition"
  | "skills"
  | "experience"
  | "education"
  | "projects"
  | "languages";

const PROFILE_SECTIONS: {
  key: ProfileSectionKey;
  filled: (data: ProfileData) => boolean;
}[] = [
  { key: "name", filled: (data) => Boolean(data.basics.fullName) },
  { key: "headline", filled: (data) => Boolean(data.basics.headline) },
  { key: "summary", filled: (data) => Boolean(data.basics.summary) },
  {
    key: "desiredPosition",
    filled: (data) => Boolean(data.preferences.desiredPosition),
  },
  { key: "skills", filled: (data) => data.skills.length > 0 },
  { key: "experience", filled: (data) => data.experience.length > 0 },
  { key: "education", filled: (data) => data.education.length > 0 },
  { key: "projects", filled: (data) => data.projects.length > 0 },
  { key: "languages", filled: (data) => data.languages.length > 0 },
];

export function profileProgress(data: ProfileData): {
  percent: number;
  missing: ProfileSectionKey[];
} {
  const missing = PROFILE_SECTIONS.filter((section) => !section.filled(data));

  return {
    percent: Math.round(
      ((PROFILE_SECTIONS.length - missing.length) / PROFILE_SECTIONS.length) *
        100,
    ),
    missing: missing.slice(0, PROFILE_HINT_LIMIT).map((section) => section.key),
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
