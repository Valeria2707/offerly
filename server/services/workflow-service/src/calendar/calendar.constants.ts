import { StageStatus } from '../workflow/workflow.enums';

export const SILENCE_DAYS = 10;

export const DEADLINE_DAYS = 2;

export const FINISHED_STATUSES = new Set([
  StageStatus.COMPLETED,
  StageStatus.CANCELLED,
  StageStatus.SKIPPED
]);

export const SUBSCRIPTION_MONTHS = 6;
export const ALARM_MINUTES_BEFORE = 24 * 60;
export const CALENDAR_NAME = 'Offerly — співбесіди';

export const DEFAULT_EVENT_DURATION_MINUTES = 60;

export const ICS_LINE_LIMIT = 75;

export const REMINDER_TICK_MS = 15 * 60 * 1000;
export const MONDAY = 1;

export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
export const TRAILING_SLASHES = /\/+$/;
