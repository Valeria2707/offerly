import { StageStatus } from '../workflow/workflow.enums';

export const ANALYTICS_PERIODS = [7, 30, 90] as const;

export const VACANCIES_PATH = '/api/v1/vacancies';
export const SOURCE_TIMEOUT_MS = 10_000;

export const DAY_MS = 24 * 60 * 60 * 1000;
export const WEEK_MS = 7 * DAY_MS;
export const MIN_WEEKS = 4;
export const MAX_WEEKS = 13;
export const ALL_TIME_WEEKS = 12;

export const TOP_SKILLS_LIMIT = 8;

export const ACTIVE_LIFECYCLE = 'active';

export const AUTO_STAGE_CODE = 'submitted';

export const NOT_REACHED_STATUSES = new Set([
  StageStatus.NOT_STARTED,
  StageStatus.SKIPPED,
  StageStatus.CANCELLED_BY_COMPANY
]);
