"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, startOfDay } from "date-fns";

import {
  calendarEventsRequest,
  createCalendarSubscriptionRequest,
  reminderSettingsRequest,
  remindersRequest,
  updateReminderSettingsRequest,
} from "@/api/calendar";
import { updateWorkflowStageRequest } from "@/api/workflow";
import { workflowKeys } from "@/hooks/use-workflow";
import { monthRange } from "@/lib/calendar";
import { getAccessToken, useAuthStore } from "@/stores/auth-store";
import type { ReminderSettings, ReminderSettingsPatch } from "@/types/calendar";
import type { WorkflowStagePatch } from "@/types/workflow";

export const calendarKeys = {
  all: ["calendar"] as const,
  month: (from: string) => ["calendar", "month", from] as const,
  reminders: ["calendar", "reminders"] as const,
  settings: ["calendar", "settings"] as const,
  upcoming: (days: number) => ["calendar", "upcoming", days] as const,
};

export function useCalendarMonth(month: Date) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { from, to } = monthRange(month);

  return useQuery({
    queryKey: calendarKeys.month(from),
    queryFn: () => calendarEventsRequest(getAccessToken()!, from, to),
    enabled: Boolean(accessToken),
  });
}

export function useUpcomingEvents(days: number) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: calendarKeys.upcoming(days),
    queryFn: () => {
      const from = startOfDay(new Date());
      return calendarEventsRequest(
        getAccessToken()!,
        from.toISOString(),
        addDays(from, days).toISOString(),
      );
    },
    enabled: Boolean(accessToken),
  });
}

export function useReminders() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: calendarKeys.reminders,
    queryFn: () => remindersRequest(getAccessToken()!),
    enabled: Boolean(accessToken),
  });
}

export function useReminderSettings() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: calendarKeys.settings,
    queryFn: () => reminderSettingsRequest(getAccessToken()!),
    enabled: Boolean(accessToken),
  });
}

export function useUpdateReminderSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: ReminderSettingsPatch) =>
      updateReminderSettingsRequest(getAccessToken()!, patch),
    onSuccess: (settings: ReminderSettings) => {
      queryClient.setQueryData(calendarKeys.settings, settings);
      queryClient.invalidateQueries({ queryKey: calendarKeys.reminders });
    },
  });
}

export function useCreateCalendarSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createCalendarSubscriptionRequest(getAccessToken()!),
    onSuccess: (settings: ReminderSettings) => {
      queryClient.setQueryData(calendarKeys.settings, settings);
    },
  });
}

export function useRescheduleStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowId,
      stageId,
      patch,
    }: {
      vacancyId: string;
      workflowId: string;
      stageId: string;
      patch: WorkflowStagePatch;
    }) =>
      updateWorkflowStageRequest(getAccessToken()!, workflowId, stageId, patch),
    onSuccess: (_stage, { vacancyId }) => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      queryClient.invalidateQueries({
        queryKey: workflowKeys.vacancy(vacancyId),
      });
      queryClient.invalidateQueries({ queryKey: ["workflows", "summary"] });
    },
  });
}
