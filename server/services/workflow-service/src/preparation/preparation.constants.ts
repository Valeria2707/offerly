import { STAGE_CODES } from '../stage-type/stage-type.constants';
import { PreparationType } from './preparation.enums';

export const OPENAI_SCHEMA_NAME = 'stage_preparation';
export const REVIEW_SCHEMA_NAME = 'answer_review';

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

export const PROFILE_BASICS_CONTEXT_FIELDS = ['headline', 'summary'];

export const PREPARATION_LANGUAGES = ['uk', 'en'] as const;

export const TECHNICAL_SCREENING_CODES = new Set<string>([
  STAGE_CODES.PRE_TECH_SCREENING
]);

export const NO_PREPARATION_CODES = new Set(['rejection']);

export const QUESTION_KEYS: Record<PreparationType, string | null> = {
  [PreparationType.CV_COVER_LETTER]: null,
  [PreparationType.HR_SCREENING]: 'commonQuestions',
  [PreparationType.TECHNICAL]: 'theoreticalQuestions',
  [PreparationType.CUSTOM]: 'items'
};

export const PAST_QUESTIONS_LIMIT = 40;
export const PAST_QUESTION_MAX_LENGTH = 300;

export const INSTRUCTIONS_MAX_LENGTH = 5000;
export const USER_ANSWER_MAX_LENGTH = 10_000;
export const TEXT_MAX_LENGTH = 5000;
export const LIST_ITEM_MAX_LENGTH = 1000;
export const TERM_MAX_LENGTH = 200;
export const COVER_LETTER_MAX_LENGTH = 10_000;

export const REVIEW_SCORE_MIN = 1;
export const REVIEW_SCORE_MAX = 5;
export const REVIEW_LIST_MAX_ITEMS = 6;
