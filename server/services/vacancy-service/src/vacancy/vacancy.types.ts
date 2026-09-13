import { VacancyLifecycle } from './enums/vacancy-lifecycle.enum';
export interface VacancyDraftData {
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
}

export interface VacancyData extends VacancyDraftData {
  lifecycle: VacancyLifecycle;
}
