"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import { ActionList } from "@/components/dashboard/action-list";
import { ActiveProcesses } from "@/components/dashboard/active-processes";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { NextEventCard } from "@/components/dashboard/next-event-card";
import { ProfileProgress } from "@/components/dashboard/profile-progress";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { UpcomingList } from "@/components/dashboard/upcoming-list";
import { Button } from "@/components/ui/button";
import {
  ACTIVE_PROCESSES_LIMIT,
  UPCOMING_DAYS,
  UPCOMING_LIMIT,
} from "@/constants/dashboard";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/hooks/use-auth";
import { useReminders, useUpcomingEvents } from "@/hooks/use-calendar";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useProfile } from "@/hooks/use-profile";
import { useVacancies } from "@/hooks/use-vacancies";
import {
  useRecordStageResult,
  useWorkflowSummaries,
} from "@/hooks/use-workflow";
import { dayTitle } from "@/lib/calendar";
import {
  actionReminders,
  activeProcesses,
  dashboardStats,
  upcomingEntries,
} from "@/lib/dashboard";
import { cn } from "@/lib/utils";
import type { Reminder } from "@/types/calendar";
import type { StageStatus, WorkflowSummary } from "@/types/workflow";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const errorMessage = useErrorMessage();
  const now = useMemo(() => new Date(), []);

  const { data: user } = useCurrentUser();
  const { data: vacancies, isPending, error } = useVacancies();
  const vacancyIds = (vacancies ?? []).map((vacancy) => vacancy.id);
  const { data: summaries } = useWorkflowSummaries(vacancyIds);
  const { data: reminders } = useReminders();
  const { data: events } = useUpcomingEvents(UPCOMING_DAYS);
  const { data: profile } = useProfile();
  const record = useRecordStageResult();

  const vacancyById = useMemo(
    () => new Map((vacancies ?? []).map((vacancy) => [vacancy.id, vacancy])),
    [vacancies],
  );

  const companyOf = (vacancyId: string) =>
    vacancyById.get(vacancyId)?.company ?? null;

  const actions = actionReminders(reminders ?? []);
  const entries = upcomingEntries(events ?? [], now);
  const nextMeeting = entries.find((entry) => entry.kind === "meeting") ?? null;
  const summaryMap = summaries ?? new Map<string, WorkflowSummary>();
  const loading = isPending || (vacancyIds.length > 0 && !summaries);

  const recordResult = (reminder: Reminder, status: StageStatus) =>
    record.mutate(
      {
        vacancyId: reminder.vacancyId,
        workflowId: reminder.workflowId,
        stageId: reminder.stageId,
        status,
      },
      {
        onError: (cause) =>
          toast.error(errorMessage(cause), { id: "dashboard-error" }),
      },
    );

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {user?.name
              ? t("greetingName", { name: user.name.split(" ")[0] })
              : t("greeting")}
          </h1>
          <p className="text-sm text-muted-foreground first-letter:uppercase">
            {dayTitle(now, locale)} · {t("tasks", { count: actions.length })}
          </p>
        </div>

        <Button nativeButton={false} render={<Link href={ROUTES.vacancies} />}>
          {t("quickActions.addVacancy")}
        </Button>
      </header>

      <FormError error={error} />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {nextMeeting && (
            <NextEventCard
              entry={nextMeeting}
              vacancy={vacancyById.get(nextMeeting.event.vacancyId) ?? null}
              now={now}
            />
          )}

          <DashboardStats
            stats={dashboardStats(vacancies ?? [], summaryMap)}
            className={cn(!nextMeeting && "sm:grid-cols-4 lg:col-span-2")}
          />

          <div className="grid content-start gap-4">
            <ActionList
              reminders={actions}
              companyOf={companyOf}
              pending={record.isPending}
              onRecord={recordResult}
            />
            <ActiveProcesses
              processes={activeProcesses(
                vacancies ?? [],
                summaryMap,
                reminders ?? [],
              ).slice(0, ACTIVE_PROCESSES_LIMIT)}
            />
          </div>

          <div className="grid content-start gap-4">
            <UpcomingList
              entries={entries.slice(0, UPCOMING_LIMIT)}
              companyOf={companyOf}
              now={now}
            />
            <QuickActions />
            {profile && <ProfileProgress data={profile.data} />}
          </div>
        </div>
      )}
    </div>
  );
}
