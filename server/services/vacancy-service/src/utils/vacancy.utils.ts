import { VacancyDraftDto } from '../vacancy/dto/vacancy.dto';
import { VacancyStatus } from '../vacancy/enums/vacancy-status.enum';
import { VacancyData, VacancyDraftData } from '../vacancy/vacancy.types';

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
    status: VacancyStatus.SAVED,
    nextStep: null
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
