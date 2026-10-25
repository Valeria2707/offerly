"use client";

import { addMonths, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import { CalendarMonth } from "@/components/calendar/calendar-month";
import { CalendarSkeleton } from "@/components/calendar/calendar-skeleton";
import { ReminderSettingsCard } from "@/components/calendar/reminder-settings-card";
import { TodayReminders } from "@/components/calendar/today-reminders";
import { WeekList } from "@/components/calendar/week-list";
import { IconButton } from "@/components/core/icon-button";
import { Button } from "@/components/ui/button";
import {
  useCalendarMonth,
  useCreateCalendarSubscription,
  useReminderSettings,
  useReminders,
  useRescheduleStage,
  useUpdateReminderSettings,
} from "@/hooks/use-calendar";
import { useCurrentUser } from "@/hooks/use-auth";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useStageName } from "@/hooks/use-stage-name";
import { useVacancies } from "@/hooks/use-vacancies";
import {
  dayTitle,
  entriesOfWeek,
  monthTitle,
  toEntries,
  type CalendarEntry,
} from "@/lib/calendar";
import type { ReminderSettingsPatch } from "@/types/calendar";

export default function CalendarPage() {
  const t = useTranslations("calendar");
  const locale = useLocale();
  const stageName = useStageName();
  const errorMessage = useErrorMessage();
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(() => startOfMonth(now));

  const { data: events, isPending, error } = useCalendarMonth(month);
  const { data: reminders } = useReminders();
  const { data: settings } = useReminderSettings();
  const { data: vacancies } = useVacancies();
  const { data: user } = useCurrentUser();

  const updateSettings = useUpdateReminderSettings();
  const subscribe = useCreateCalendarSubscription();
  const reschedule = useRescheduleStage();

  const companies = useMemo(
    () => new Map((vacancies ?? []).map((item) => [item.id, item.company])),
    [vacancies],
  );

  const entries = useMemo(() => toEntries(events ?? []), [events]);
  const week = entriesOfWeek(entries, now);
  const overdue = (reminders ?? []).filter(
    (reminder) => reminder.kind === "record_result",
  ).length;

  const notify = (cause: unknown) =>
    toast.error(errorMessage(cause), { id: "calendar-error" });

  const companyOf = (vacancyId: string) => companies.get(vacancyId) ?? null;

  const chipLabel = (entry: CalendarEntry) =>
    [companyOf(entry.event.vacancyId), stageName(entry.event.name)]
      .filter(Boolean)
      .join(" · ");

  const changeSettings = (patch: ReminderSettingsPatch) =>
    updateSettings.mutate(patch, { onError: notify });

  const moveStage = (entry: CalendarEntry, iso: string | null) =>
    reschedule.mutate(
      {
        vacancyId: entry.event.vacancyId,
        workflowId: entry.event.workflowId,
        stageId: entry.event.stageId,
        patch:
          entry.kind === "meeting" ? { scheduledAt: iso } : { deadlineAt: iso },
      },
      { onError: notify },
    );

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground first-letter:uppercase">
            {dayTitle(now, locale)}
            {overdue > 0 && ` · ${t("overdue", { count: overdue })}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <IconButton
            label={t("previousMonth")}
            onClick={() => setMonth(addMonths(month, -1))}
          >
            <ChevronLeft className="size-4" />
          </IconButton>

          <IconButton
            label={t("nextMonth")}
            onClick={() => setMonth(addMonths(month, 1))}
          >
            <ChevronRight className="size-4" />
          </IconButton>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMonth(startOfMonth(now))}
          >
            {t("today")}
          </Button>
        </div>
      </header>

      <FormError error={error} />

      {reminders && (
        <TodayReminders reminders={reminders} labelOf={companyOf} />
      )}

      {isPending ? (
        <CalendarSkeleton />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <section className="rounded-xl bg-card ring-1 ring-foreground/10">
            <h2 className="px-5 py-4 font-heading text-base font-bold first-letter:uppercase">
              {monthTitle(month, locale)}
            </h2>

            <CalendarMonth
              month={month}
              entries={entries}
              now={now}
              labelOf={chipLabel}
            />
          </section>

          <div className="relative">
            <div className="lg:absolute lg:inset-0">
              <WeekList
                entries={week}
                now={now}
                pending={reschedule.isPending}
                labelOf={companyOf}
                onReschedule={moveStage}
              />
            </div>
          </div>
        </div>
      )}

      {settings && (
        <ReminderSettingsCard
          settings={settings}
          email={user?.email ?? null}
          pending={updateSettings.isPending || subscribe.isPending}
          onChange={changeSettings}
          onSubscribe={() => subscribe.mutate(undefined, { onError: notify })}
        />
      )}
    </div>
  );
}
