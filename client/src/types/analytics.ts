import type { StageCategory } from "@/types/workflow";

export const ANALYTICS_PERIODS = [7, 30, 90] as const;

export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number] | null;

export type FunnelStep = "added" | "screening" | "technical" | "final" | "offer";

export type AnalyticsSummary = {
  added: number;
  addedPrevious: number | null;
  active: number;
  awaiting: number;
  offers: number;
  offerRate: number;
  averageDays: number | null;
};

export type FunnelStepCount = {
  step: FunnelStep;
  count: number;
};

export type AnalyticsOutcomes = {
  inProgress: number;
  awaiting: number;
  offered: number;
  closed: number;
};

export type WeeklyActivity = {
  weekStart: string;
  vacancies: number;
  stages: number;
};

export type CategoryResult = {
  category: StageCategory;
  passed: number;
  failed: number;
  rate: number | null;
};

export type SkillDemand = {
  name: string;
  count: number;
  inProfile: boolean;
};

export type WorkFormatCount = {
  label: string | null;
  count: number;
};

export type Analytics = {
  period: number | null;
  summary: AnalyticsSummary;
  funnel: FunnelStepCount[];
  outcomes: AnalyticsOutcomes;
  weekly: WeeklyActivity[];
  categories: CategoryResult[];
  skills: SkillDemand[];
  workFormats: WorkFormatCount[];
};
