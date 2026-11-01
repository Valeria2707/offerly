import { DAY_MS } from '@offerly/helpers';

export const ANALYTICS_PERIODS = [7, 30, 90] as const;

export const WEEK_MS = 7 * DAY_MS;
export const MIN_WEEKS = 4;
export const MAX_WEEKS = 13;
export const ALL_TIME_WEEKS = 12;

export const TOP_SKILLS_LIMIT = 8;

export const ACTIVE_LIFECYCLE = 'active';
