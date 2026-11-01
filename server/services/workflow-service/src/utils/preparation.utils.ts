import { randomUUID } from 'node:crypto';
import { isRecord } from '@offerly/helpers';
import { readText, readTexts } from './record.utils';
import { normalizeSkill, profileSkills } from './skills.utils';
import { QuestionAnswerItem } from '../preparation/dto/preparation-content.dto';
import { QUESTION_KEYS } from '../preparation/preparation.constants';
import { PreparationType } from '../preparation/preparation.enums';
import {
  PastQuestion,
  PreparationContext,
  PreparationData,
  StackAnalysis
} from '../preparation/preparation.types';

export const formatList = (items: string[]): string =>
  items.length ? items.join(', ') : 'not specified';

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

export function describePastQuestions(questions: PastQuestion[]): string {
  if (!questions.length) return '';

  const lines = questions.map((item) => {
    const where = item.sameVacancy
      ? `${item.stageName}, same company`
      : `${item.stageName}, another company`;
    const hard = item.wasHard ? ' — the candidate struggled here' : '';
    return `- [${where}] ${item.question}${hard}`;
  });

  return [
    'Questions this candidate was really asked at earlier interviews:',
    ...lines,
    'Use them as evidence of what this market actually asks. Cover the topics the candidate struggled with, and do not repeat word for word a question they already answered well.'
  ].join('\n');
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
