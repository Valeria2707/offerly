import { differenceInCalendarDays, isSameDay } from "date-fns";

import { WeekEventCard } from "@/components/calendar/week-event-card";
import { dayTitle, relativeDay, type CalendarEntry } from "@/lib/calendar";

function headingOf(day: Date, now: Date): string {
  const days = differenceInCalendarDays(day, now);

  return days <= 1 ? relativeDay(days) : dayTitle(day);
}

export function WeekList({
  entries,
  now,
  pending,
  labelOf,
  onReschedule,
}: {
  entries: CalendarEntry[];
  now: Date;
  pending: boolean;
  labelOf: (vacancyId: string) => string | null;
  onReschedule: (entry: CalendarEntry, iso: string | null) => void;
}) {
  const days = entries.reduce<Date[]>((unique, entry) => {
    if (!unique.some((day) => isSameDay(day, entry.at))) unique.push(entry.at);
    return unique;
  }, []);

  return (
    <section className="flex h-full min-w-0 flex-col gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <div className="flex shrink-0 items-baseline justify-between">
        <h2 className="font-heading text-base font-bold">Цього тижня</h2>
        <span className="text-xs text-subtle">{entries.length}</span>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Найближчі сім днів вільні.
        </p>
      ) : (
        <div className="-mr-2 grid min-h-0 flex-1 content-start gap-3 overflow-y-auto pr-2">
          {days.map((day) => (
            <div key={day.toISOString()} className="grid min-w-0 gap-1.5">
              <h3 className="text-xs font-semibold text-muted-foreground first-letter:uppercase">
                {headingOf(day, now)}
              </h3>

              {entries
                .filter((entry) => isSameDay(entry.at, day))
                .map((entry) => (
                  <WeekEventCard
                    key={entry.key}
                    entry={entry}
                    company={labelOf(entry.event.vacancyId)}
                    pending={pending}
                    onReschedule={onReschedule}
                  />
                ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
