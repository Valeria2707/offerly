import { API_PREFIX } from '@offerly/helpers';

export const UPSTREAM_TIMEOUT_MS = 10_000;
export const VACANCIES_PATH = `/${API_PREFIX}/vacancies`;
export const PROFILE_PATH = `/${API_PREFIX}/profile`;

export const vacancyPath = (vacancyId: string): string =>
  `${VACANCIES_PATH}/${encodeURIComponent(vacancyId)}`;
