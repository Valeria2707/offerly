export const PDF_MIME_TYPE = 'application/pdf';
export const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
export const PDF_FILE_SIGNATURE = '%PDF-';
export const ZIP_FILE_SIGNATURE = [0x50, 0x4b];

export const CV_MIN_EXTRACTED_CHARACTERS = 80;
export const CV_MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
export const CV_SCHEMA_VERSION = '1.0';
export const OPENAI_REQUEST_TIMEOUT_MS = 60_000;
export const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

export const CV_EXTRACTION_INSTRUCTIONS = [
  'Extract only facts explicitly present in the CV into the provided schema.',
  'Never guess missing values; use null or an empty array.',
  'Dates must be YYYY or YYYY-MM when the source is precise enough.',
  'Keep achievements faithful to the source and do not embellish them.',
  'Career preferences (desiredPosition, level, workFormat, expectedSalary) are not CV facts and must always be null.',
  'A skill level must be null unless the CV explicitly states it.'
].join(' ');
