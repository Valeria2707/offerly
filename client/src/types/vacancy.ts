export const VACANCY_STATUSES = [
  "saved",
  "applied",
  "hr",
  "interview",
  "technical",
  "final",
  "offer",
  "rejected",
  "closed",
] as const;

export type VacancyStatus = (typeof VACANCY_STATUSES)[number];

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
  status: VacancyStatus;
  lifecycle: VacancyLifecycle;
  nextStep: string | null;
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
