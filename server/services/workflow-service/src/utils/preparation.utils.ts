import { randomUUID } from 'node:crypto';
import { isRecord } from '@offerly/helpers';
import { QuestionAnswerItem } from '../preparation/dto/preparation-content.dto';
import { QUESTION_KEYS } from '../preparation/preparation.constants';
import { PreparationType } from '../preparation/preparation.enums';
import {
  PreparationContext,
  PreparationData,
  StackAnalysis
} from '../preparation/preparation.types';

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

export function toServiceBaseUrl(value: string): string {
  const url = new URL(value);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error('Invalid preparation context service URL');
  return value.replace(/\/$/, '');
}

export const normalizeSkill = (skill: string): string =>
  skill.toLowerCase().replace(/[\s._-]+/g, '');

export const formatList = (items: string[]): string =>
  items.length ? items.join(', ') : 'not specified';

export function profileSkills(profile: Record<string, unknown>): string[] {
  const names = [
    ...readRecords(profile.skills).map((skill) => readText(skill.name)),
    ...readRecords(profile.experience).flatMap((item) =>
      readTexts(item.skills)
    ),
    ...readRecords(profile.projects).flatMap((item) => readTexts(item.skills))
  ].filter((name): name is string => name !== null);
  return [
    ...new Map(names.map((name) => [normalizeSkill(name), name])).values()
  ];
}

export function analyzeStack(context: PreparationContext): StackAnalysis {
  const { vacancy, profile } = context;
  const requiredSkills = readTexts(vacancy.requiredSkills);
  const preferredSkills = readTexts(vacancy.preferredSkills);
  const known = new Set(profileSkills(profile).map(normalizeSkill));
  const has = (skill: string): boolean => known.has(normalizeSkill(skill));
  return {
    role: readText(vacancy.title) ?? 'the role',
    company: readText(vacancy.company) ?? 'the company',
    level: readText(vacancy.level),
    requiredSkills,
    preferredSkills,
    matchedSkills: [...requiredSkills, ...preferredSkills].filter(has),
    missingRequiredSkills: requiredSkills.filter((skill) => !has(skill)),
    experienceRequirement: readText(vacancy.experienceRequirement),
    languageRequirements: readTexts(vacancy.languageRequirements)
  };
}

export function describeStack(stack: StackAnalysis): string {
  return [
    `Target role: ${stack.role} at ${stack.company}${stack.level ? ` (level: ${stack.level})` : ''}.`,
    `Required stack: ${formatList(stack.requiredSkills)}.`,
    `Nice-to-have stack: ${formatList(stack.preferredSkills)}.`,
    `Already present in the candidate profile: ${formatList(stack.matchedSkills)}.`,
    `Required but NOT visible in the profile (main gaps): ${formatList(stack.missingRequiredSkills)}.`,
    stack.experienceRequirement
      ? `Experience requirement: ${stack.experienceRequirement}.`
      : null,
    stack.languageRequirements.length
      ? `Language requirements: ${formatList(stack.languageRequirements)}.`
      : null
  ]
    .filter(Boolean)
    .join('\n');
}

export function questionItems(data: PreparationData): QuestionAnswerItem[] {
  switch (data.type) {
    case PreparationType.CV_COVER_LETTER:
      return [];
    case PreparationType.HR_SCREENING:
      return data.content.commonQuestions;
    case PreparationType.TECHNICAL:
      return data.content.theoreticalQuestions;
    case PreparationType.CUSTOM:
      return data.content.items;
  }
}

export function withQuestionIds(
  type: PreparationType,
  value: unknown
): unknown {
  const key = QUESTION_KEYS[type];
  if (!key || !isRecord(value) || !Array.isArray(value[key])) return value;
  return {
    ...value,
    [key]: value[key].map((item: unknown) =>
      isRecord(item) ? { ...item, id: randomUUID() } : item
    )
  };
}
