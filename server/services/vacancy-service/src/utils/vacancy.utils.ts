import { VacancyDraftDto } from '../vacancy/dto/vacancy.dto';
import { VacancyLifecycle } from '../vacancy/enums/vacancy-lifecycle.enum';
import { VacancyData, VacancyDraftData } from '../vacancy/vacancy.types';
import { calculateSha256 } from '@offerly/helpers';
import { TRAILING_SLASHES_PATTERN, WHITESPACE_PATTERN } from './text.constants';

function normalizeFingerprintValue(value: string): string {
  return value
    .trim()
    .replace(WHITESPACE_PATTERN, ' ')
    .toLocaleLowerCase('en-US');
}

export function normalizeVacancySourceUrl(url: string): string {
  const normalized = new URL(url.trim());
  normalized.hash = '';
  normalized.hostname = normalized.hostname.toLowerCase();
  if (normalized.pathname !== '/')
    normalized.pathname = normalized.pathname.replace(
      TRAILING_SLASHES_PATTERN,
      ''
    );
  normalized.searchParams.sort();
  return normalized.toString();
}

export function createVacancySourceHash(content: string): string {
  return calculateSha256(normalizeFingerprintValue(content));
}

export function createVacancyFingerprint(data: VacancyDraftData): string {
  const values = [
    data.title,
    data.company,
    data.location,
    data.workFormat,
    data.employmentType,
    data.level,
    data.salaryRange,
    data.description,
    data.experienceRequirement,
    data.educationRequirement,
    ...[...data.requiredSkills].sort(),
    ...[...data.preferredSkills].sort(),
    ...[...data.languageRequirements].sort()
  ];
  return calculateSha256(
    values.map((value) => normalizeFingerprintValue(value ?? '')).join('\n')
  );
}

export function toVacancyData(input: VacancyDraftDto): VacancyData {
  return {
    title: input.title,
    company: input.company,
    location: input.location ?? null,
    workFormat: input.workFormat ?? null,
    employmentType: input.employmentType ?? null,
    level: input.level ?? null,
    salaryRange: input.salaryRange ?? null,
    postedAt: input.postedAt ?? null,
    description: input.description ?? null,
    requiredSkills: input.requiredSkills ?? [],
    preferredSkills: input.preferredSkills ?? [],
    experienceRequirement: input.experienceRequirement ?? null,
    educationRequirement: input.educationRequirement ?? null,
    languageRequirements: input.languageRequirements ?? [],
    sourceUrl: input.sourceUrl ?? null,
    lifecycle: VacancyLifecycle.ACTIVE
  };
}

export function resolveVacancyImportDraft(
  original: VacancyDraftData,
  edited?: VacancyDraftDto
): VacancyData {
  const draft = edited
    ? { ...edited, sourceUrl: edited.sourceUrl ?? original.sourceUrl }
    : original;
  return toVacancyData(draft);
}
