export const VACANCY_LIFECYCLES = ["active", "archived", "closed"] as const;

export type VacancyLifecycle = (typeof VACANCY_LIFECYCLES)[number];

export type VacancyDraft = {
  title: string;
  company: string;
  location: string | null;
  workFormat: string | null;
  employmentType: string | null;
  level: string | null;
  salaryRange: string | null;
  postedAt: string | null;
  description: string | null;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceRequirement: string | null;
  educationRequirement: string | null;
  languageRequirements: string[];
  sourceUrl: string | null;
};

export type Vacancy = VacancyDraft & {
  id: string;
  lifecycle: VacancyLifecycle;
  createdAt: string;
  updatedAt: string;
};

export type VacancyPatch = Partial<VacancyDraft> & {
  lifecycle?: VacancyLifecycle;
};

export type VacancyImport = {
  id: string;
  sourceUrl: string | null;
  draft: VacancyDraft;
  appliedAt: string | null;
  createdAt: string;
};
