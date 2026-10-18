import Link from "next/link";

import { STAGE_CATEGORY_CLASSES } from "@/constants/workflow";
import { vacancyRoute } from "@/constants/routes";
import { eventTime, isFinished, isOverdue, type CalendarEntry } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import { stageName } from "@/lib/workflow";

export function CalendarChip({
  entry,
  label,
  now,
}: {
  entry: CalendarEntry;
  label: string;
  now: Date;
}) {
  const overdue = isOverdue(entry, now);
  const finished = isFinished(entry.event);

  return (
    <Link
      href={vacancyRoute(entry.event.vacancyId)}
      title={`${stageName(entry.event.name)} · ${label}`}
      className={cn(
        "flex items-center gap-1.5 truncate rounded-md px-1.5 py-0.5 text-[11px] transition-opacity hover:opacity-80",
        entry.kind === "deadline"
          ? "rounded-l-none border-l-2 border-dashed border-current text-muted-foreground"
          : STAGE_CATEGORY_CLASSES[entry.event.category],
        finished && "bg-transparent text-subtle line-through",
        overdue && "bg-rejected-muted text-rejected",
      )}
    >
      {entry.kind === "meeting" && (
        <span className="shrink-0 font-mono text-[9.5px] opacity-75">
          {eventTime(entry.at)}
        </span>
      )}
      <span className="truncate">
        {entry.kind === "deadline" ? "до: " : ""}
        {label}
      </span>
    </Link>
  );
}
