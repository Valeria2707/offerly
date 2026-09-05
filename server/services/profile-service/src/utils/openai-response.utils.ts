import { OpenAiContentItem, OpenAiOutputItem, OpenAiResponse } from '../cv/types/openai-response.types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isOpenAiContentItem(value: unknown): value is OpenAiContentItem {
  return isRecord(value)
    && (value.type === undefined || typeof value.type === 'string')
    && (value.text === undefined || typeof value.text === 'string');
}

function isOpenAiOutputItem(value: unknown): value is OpenAiOutputItem {
  return isRecord(value)
    && (value.type === undefined || typeof value.type === 'string')
    && (value.content === undefined || (Array.isArray(value.content) && value.content.every(isOpenAiContentItem)));
}

export function isOpenAiResponse(value: unknown): value is OpenAiResponse {
  return isRecord(value)
    && (value.output === undefined || (Array.isArray(value.output) && value.output.every(isOpenAiOutputItem)));
}
