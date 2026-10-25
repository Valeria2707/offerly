export interface AnalyticsVacancy {
  id: string;
  createdAt: Date;
  lifecycle: string;
  workFormat: string | null;
  requiredSkills: string[];
}
