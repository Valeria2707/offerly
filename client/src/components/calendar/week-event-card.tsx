"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { vacancyRoute, vacancyStageRoute } from "@/constants/routes";
import { STAGE_CATEGORY_CLASSES } from "@/constants/workflow";
import { useStageName } from "@/hooks/use-stage-name";
import { eventTime, type CalendarEntry } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import { fromDateInput, toDateInput, toDateTimeInput } from "@/lib/workflow";

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
  const t = useTranslations("calendar");
  const stageName = useStageName();
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
          {t(`categoryShort.${entry.event.category}`)}
        </span>

        {isEditing ? (
          <Input
            type={meeting ? "datetime-local" : "date"}
            aria-label={t("reschedule")}
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
            aria-label={t("reschedule")}
            onClick={() => setIsEditing(true)}
            className="ml-auto font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none"
          >
            {meeting ? eventTime(entry.at) : t("deadline")}
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
              {meeting ? t("actions.prepare") : t("actions.open")}
            </Link>
          }
        />
      </div>
    </div>
  );
}
