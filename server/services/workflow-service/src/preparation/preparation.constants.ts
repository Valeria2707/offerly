import { PreparationType } from './preparation.enums';

export const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
export const OPENAI_TIMEOUT_MS = 60_000;
export const OPENAI_SCHEMA_NAME = 'stage_preparation';

export const DEFAULT_VACANCY_SERVICE_URL = 'http://localhost:3003';
export const DEFAULT_PROFILE_SERVICE_URL = 'http://localhost:3002';
export const CONTEXT_TIMEOUT_MS = 10_000;
export const VACANCY_PATH = (vacancyId: string): string =>
  `/api/v1/vacancies/${encodeURIComponent(vacancyId)}`;
export const PROFILE_PATH = '/api/v1/profile';

export const VACANCY_CONTEXT_FIELDS = [
  'title',
  'company',
  'location',
  'workFormat',
  'employmentType',
  'level',
  'salaryRange',
  'description',
  'requiredSkills',
  'preferredSkills',
  'experienceRequirement',
  'educationRequirement',
  'languageRequirements'
];

export const PROFILE_CONTEXT_FIELDS = [
  'preferences',
  'skills',
  'experience',
  'education',
  'projects',
  'languages'
];
export const PROFILE_BASICS_CONTEXT_FIELDS = [
  'fullName',
  'headline',
  'summary'
];

export const CV_STAGE_CODE = 'submitted';

export const TECHNICAL_SCREENING_CODES = new Set(['pre_tech_screening']);

export const NO_PREPARATION_CODES = new Set(['rejection']);

export const QUESTION_KEYS: Record<PreparationType, string | null> = {
  [PreparationType.CV_COVER_LETTER]: null,
  [PreparationType.HR_SCREENING]: 'commonQuestions',
  [PreparationType.TECHNICAL]: 'theoreticalQuestions',
  [PreparationType.CUSTOM]: 'items'
};

export const INSTRUCTIONS_MAX_LENGTH = 5000;
export const USER_ANSWER_MAX_LENGTH = 10_000;
export const TEXT_MAX_LENGTH = 5000;
export const LIST_ITEM_MAX_LENGTH = 1000;
export const TERM_MAX_LENGTH = 200;
export const COVER_LETTER_MAX_LENGTH = 10_000;
