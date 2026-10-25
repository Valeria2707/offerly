import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import type { Locale } from "@/constants/i18n";
import { CLOSED_STAGE_STATUSES } from "@/constants/workflow";
import { dateFnsLocale } from "@/lib/date-locale";
import type { CalendarEvent } from "@/types/calendar";

const WEEK_OPTIONS = { weekStartsOn: 1 } as const;

export type CalendarEntry = {
  key: string;
  kind: "meeting" | "deadline";
  at: Date;
  event: CalendarEvent;
};

export function monthTitle(month: Date, locale: Locale): string {
  return format(month, "LLLL yyyy", { locale: dateFnsLocale(locale) });
}

export function dayTitle(day: Date, locale: Locale): string {
  return format(day, "EEEE, d MMMM", { locale: dateFnsLocale(locale) });
}

export function eventTime(value: Date): string {
  return format(value, "HH:mm");
}

export function monthGrid(month: Date): Date[] {
  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), WEEK_OPTIONS),
    end: endOfWeek(endOfMonth(month), WEEK_OPTIONS),
  });
}

export function monthRange(month: Date): { from: string; to: string } {
  const days = monthGrid(month);

  return {
    from: days[0].toISOString(),
    to: addDays(days[days.length - 1], 1).toISOString(),
  };
}

export function toEntries(events: CalendarEvent[]): CalendarEntry[] {
  const entries: CalendarEntry[] = [];

  for (const event of events) {
    if (event.scheduledAt)
      entries.push({
        key: `meeting-${event.stageId}`,
        kind: "meeting",
        at: new Date(event.scheduledAt),
        event,
      });

    if (event.deadlineAt)
      entries.push({
        key: `deadline-${event.stageId}`,
        kind: "deadline",
        at: new Date(event.deadlineAt),
        event,
      });
  }

  return entries.sort((left, right) => left.at.getTime() - right.at.getTime());
}

export function isFinished(event: CalendarEvent): boolean {
  return CLOSED_STAGE_STATUSES.includes(event.status);
}

export function isOverdue(entry: CalendarEntry, now: Date): boolean {
  return (
    entry.kind === "meeting" &&
    entry.at.getTime() < now.getTime() &&
    !isFinished(entry.event)
  );
}

export function entriesOfDay(
  entries: CalendarEntry[],
  day: Date,
): CalendarEntry[] {
  return entries.filter((entry) => isSameDay(entry.at, day));
}

export function entriesOfWeek(
  entries: CalendarEntry[],
  now: Date,
): CalendarEntry[] {
  return entries.filter((entry) => {
    const days = differenceInCalendarDays(entry.at, now);
    return days >= 0 && days < 7 && !isFinished(entry.event);
  });
}

export function relativeDay(days: number, locale: Locale): string {
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
    days,
    "day",
  );
}

export function weekdayLabels(locale: Locale): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });

  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(new Date(2024, 0, 1 + index)),
  );
}
