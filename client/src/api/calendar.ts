import { CALENDAR_ROUTES, WORKFLOW_API_BASE_URL } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type {
  CalendarEvent,
  Reminder,
  ReminderSettings,
  ReminderSettingsPatch,
} from "@/types/calendar";

const withWorkflowService = { baseUrl: WORKFLOW_API_BASE_URL };

export const calendarEventsRequest = (from: string, to: string) =>
  apiRequest<CalendarEvent[]>(CALENDAR_ROUTES.calendar(from, to), {
    ...withWorkflowService,
  });

export const remindersRequest = () =>
  apiRequest<Reminder[]>(CALENDAR_ROUTES.reminders, {
    ...withWorkflowService,
  });

export const reminderSettingsRequest = () =>
  apiRequest<ReminderSettings>(CALENDAR_ROUTES.settings, {
    ...withWorkflowService,
  });

export const updateReminderSettingsRequest = (patch: ReminderSettingsPatch) =>
  apiRequest<ReminderSettings>(CALENDAR_ROUTES.settings, {
    ...withWorkflowService,
    method: "PATCH",
    body: patch,
  });

export const createCalendarSubscriptionRequest = () =>
  apiRequest<ReminderSettings>(CALENDAR_ROUTES.subscription, {
    ...withWorkflowService,
    method: "POST",
  });
