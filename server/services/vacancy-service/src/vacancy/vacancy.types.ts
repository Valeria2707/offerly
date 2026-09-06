import { VacancyStatus } from './enums/vacancy-status.enum';
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
  status: VacancyStatus;
  nextStep: string | null;
}
