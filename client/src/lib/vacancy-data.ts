import type { VacancyDraft } from "@/types/vacancy";

const emptyToNull = (value: string | null) => value?.trim() || null;

export function toVacancyDraft(values: VacancyDraft): VacancyDraft {
  return {
    title: values.title.trim(),
    company: values.company.trim(),
    location: emptyToNull(values.location),
    workFormat: emptyToNull(values.workFormat),
    employmentType: emptyToNull(values.employmentType),
    level: emptyToNull(values.level),
    salaryRange: emptyToNull(values.salaryRange),
    postedAt: emptyToNull(values.postedAt),
    description: emptyToNull(values.description),
    requiredSkills: values.requiredSkills.filter(Boolean),
    preferredSkills: values.preferredSkills.filter(Boolean),
    experienceRequirement: emptyToNull(values.experienceRequirement),
    educationRequirement: emptyToNull(values.educationRequirement),
    languageRequirements: values.languageRequirements.filter(Boolean),
    sourceUrl: emptyToNull(values.sourceUrl),
  };
}
