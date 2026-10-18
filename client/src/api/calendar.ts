import { CALENDAR_ROUTES, WORKFLOW_API_BASE_URL } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type {
  CalendarEvent,
  Reminder,
  ReminderSettings,
  ReminderSettingsPatch,
} from "@/types/calendar";

const withWorkflowService = { baseUrl: WORKFLOW_API_BASE_URL };

export const calendarEventsRequest = (token: string, from: string, to: string) =>
  apiRequest<CalendarEvent[]>(CALENDAR_ROUTES.calendar(from, to), {
    ...withWorkflowService,
    token,
  });

export const remindersRequest = (token: string) =>
  apiRequest<Reminder[]>(CALENDAR_ROUTES.reminders, {
    ...withWorkflowService,
    token,
  });

export const reminderSettingsRequest = (token: string) =>
  apiRequest<ReminderSettings>(CALENDAR_ROUTES.settings, {
    ...withWorkflowService,
    token,
  });

export const updateReminderSettingsRequest = (
  token: string,
  patch: ReminderSettingsPatch,
) =>
  apiRequest<ReminderSettings>(CALENDAR_ROUTES.settings, {
    ...withWorkflowService,
    method: "PATCH",
    body: patch,
    token,
  });

export const createCalendarSubscriptionRequest = (token: string) =>
  apiRequest<ReminderSettings>(CALENDAR_ROUTES.subscription, {
    ...withWorkflowService,
    method: "POST",
    token,
  });
