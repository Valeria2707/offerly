"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, startOfDay } from "date-fns";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  calendarEventsRequest,
  createCalendarSubscriptionRequest,
  reminderSettingsRequest,
  remindersRequest,
  updateReminderSettingsRequest,
} from "@/api/calendar";
import { monthRange } from "@/lib/calendar";
import { useAuthStore } from "@/stores/auth-store";
import type { ReminderSettings, ReminderSettingsPatch } from "@/types/calendar";

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
    queryFn: () => calendarEventsRequest(from, to),
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
    queryFn: () => remindersRequest(),
    enabled: Boolean(accessToken),
  });
}

export function useReminderSettings() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: calendarKeys.settings,
    queryFn: () => reminderSettingsRequest(),
    enabled: Boolean(accessToken),
  });
}

export function useUpdateReminderSettings() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: (patch: ReminderSettingsPatch) =>
      updateReminderSettingsRequest(patch),
    onSuccess: (settings: ReminderSettings) => {
      toast.success(t("toasts.settingsSaved"));
      queryClient.setQueryData(calendarKeys.settings, settings);
      queryClient.invalidateQueries({ queryKey: calendarKeys.reminders });
    },
  });
}

export function useCreateCalendarSubscription() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: () => createCalendarSubscriptionRequest(),
    onSuccess: (settings: ReminderSettings) => {
      toast.success(t("toasts.subscriptionReady"));
      queryClient.setQueryData(calendarKeys.settings, settings);
    },
  });
}
