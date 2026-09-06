import {
  OpenAiContentItem,
  OpenAiOutputItem,
  OpenAiResponse
} from '../import/types/openai-response.types';
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function isContent(value: unknown): value is OpenAiContentItem {
  return (
    isRecord(value) &&
    (value.type === undefined || typeof value.type === 'string') &&
    (value.text === undefined || typeof value.text === 'string')
  );
}
function isOutput(value: unknown): value is OpenAiOutputItem {
  return (
    isRecord(value) &&
    (value.content === undefined ||
      (Array.isArray(value.content) && value.content.every(isContent)))
  );
}
export function isOpenAiResponse(value: unknown): value is OpenAiResponse {
  return (
    isRecord(value) &&
    (value.output === undefined ||
      (Array.isArray(value.output) && value.output.every(isOutput)))
  );
}
