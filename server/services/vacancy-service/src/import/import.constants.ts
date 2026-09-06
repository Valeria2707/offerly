export const PAGE_FETCH_TIMEOUT_MS = 15_000;
export const PAGE_MAX_BYTES = 2 * 1024 * 1024;
export const PAGE_MAX_REDIRECTS = 5;
export const PAGE_MAX_CHARACTERS = 100_000;
export const OPENAI_TIMEOUT_MS = 60_000;
export const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
export const VACANCY_EXTRACTION_INSTRUCTIONS = [
  'Extract only facts explicitly present in the job posting.',
  'Never guess missing values; use null or an empty array.',
  'Normalize postedAt to YYYY-MM-DD only when a precise date is available.',
  'Separate mandatory skills from preferred or nice-to-have skills.',
  'Keep the full meaningful job description without navigation, cookie, or marketing boilerplate.',
  'Use the canonical technology name while preserving factual meaning.'
].join(' ');
