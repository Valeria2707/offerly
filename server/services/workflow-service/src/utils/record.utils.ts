import { isRecord } from '@offerly/helpers';

export const readText = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

export const readTexts = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.map(readText).filter((item): item is string => item !== null)
    : [];

export const readRecords = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? value.filter(isRecord) : [];

export function pickFields(
  record: Record<string, unknown>,
  keys: string[]
): Record<string, unknown> {
  return Object.fromEntries(
    keys.filter((key) => key in record).map((key) => [key, record[key]])
  );
}
