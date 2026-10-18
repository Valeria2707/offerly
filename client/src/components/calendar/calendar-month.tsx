import { isSameDay, isSameMonth, startOfDay } from "date-fns";

import { CalendarChip } from "@/components/calendar/calendar-chip";
import { WEEKDAY_LABELS } from "@/constants/calendar";
import { entriesOfDay, monthGrid, type CalendarEntry } from "@/lib/calendar";
import { cn } from "@/lib/utils";

export function CalendarMonth({
  month,
  entries,
  now,
  labelOf,
}: {
  month: Date;
  entries: CalendarEntry[];
  now: Date;
  labelOf: (entry: CalendarEntry) => string;
}) {
  const days = monthGrid(month);
  const today = startOfDay(now).getTime();

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-foreground/10">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2.5 py-2 font-mono text-[10px] tracking-[0.12em] text-subtle uppercase"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const outside = !isSameMonth(day, month);
          const past = startOfDay(day).getTime() < today;

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "grid min-h-22 content-start gap-1 border-r border-b border-foreground/10 p-1.5 [&:nth-child(7n)]:border-r-0",
                past && "bg-secondary/35",
              )}
            >
              <span
                className={cn(
                  "px-0.5 text-xs text-muted-foreground tabular-nums",
                  outside && "text-subtle/60",
                  isSameDay(day, now) &&
                    "flex size-5 items-center justify-center rounded-full bg-foreground px-0 font-semibold text-background",
                )}
              >
                {day.getDate()}
              </span>

              {entriesOfDay(entries, day).map((entry) => (
                <CalendarChip
                  key={entry.key}
                  entry={entry}
                  now={now}
                  label={labelOf(entry)}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
