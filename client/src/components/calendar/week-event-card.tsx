"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STAGE_CATEGORY_SHORT_LABELS } from "@/constants/calendar";
import { vacancyRoute, vacancyStageRoute } from "@/constants/routes";
import { STAGE_CATEGORY_CLASSES } from "@/constants/workflow";
import { eventTime, type CalendarEntry } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import {
  fromDateInput,
  stageName,
  toDateInput,
  toDateTimeInput,
} from "@/lib/workflow";

export function WeekEventCard({
  entry,
  company,
  pending,
  onReschedule,
}: {
  entry: CalendarEntry;
  company: string | null;
  pending: boolean;
  onReschedule: (entry: CalendarEntry, iso: string | null) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const meeting = entry.kind === "meeting";
  const iso = entry.at.toISOString();

  const commit = (value: string) => {
    setIsEditing(false);

    const next = fromDateInput(value);
    if (next && next !== iso) onReschedule(entry, next);
  };

  return (
    <div className="grid min-w-0 gap-2 rounded-xl bg-muted p-3">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.07em] uppercase",
            STAGE_CATEGORY_CLASSES[entry.event.category],
          )}
        >
          {STAGE_CATEGORY_SHORT_LABELS[entry.event.category]}
        </span>

        {isEditing ? (
          <Input
            type={meeting ? "datetime-local" : "date"}
            aria-label="Перенести етап"
            autoFocus
            defaultValue={meeting ? toDateTimeInput(iso) : toDateInput(iso)}
            className="ml-auto h-7 w-fit rounded-lg text-xs"
            onBlur={(event) => commit(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") setIsEditing(false);
            }}
          />
        ) : (
          <button
            type="button"
            disabled={pending}
            aria-label="Перенести етап"
            onClick={() => setIsEditing(true)}
            className="ml-auto font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none"
          >
            {meeting ? eventTime(entry.at) : "дедлайн"}
          </button>
        )}
      </div>

      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">
          {stageName(entry.event.name)}
          {company && (
            <span className="font-normal text-muted-foreground">
              {" · "}
              {company}
            </span>
          )}
        </span>

        <Button
          size="xs"
          nativeButton={false}
          className="shrink-0"
          variant={meeting ? "default" : "secondary"}
          render={
            <Link
              href={
                meeting
                  ? vacancyStageRoute(
                      entry.event.vacancyId,
                      entry.event.stageId,
                    )
                  : vacancyRoute(entry.event.vacancyId)
              }
            >
              {meeting ? "Готуватись" : "Відкрити"}
            </Link>
          }
        />
      </div>
    </div>
  );
}
