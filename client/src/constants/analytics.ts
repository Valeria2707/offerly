import type {
  AnalyticsOutcomes,
  AnalyticsPeriod,
  FunnelStep,
} from "@/types/analytics";

/** Підписи — у `messages/*.json` → `analytics`. */

export type AnalyticsPeriodValue = "7" | "30" | "90" | "all";

export const ANALYTICS_PERIOD_OPTIONS: {
  value: AnalyticsPeriodValue;
  period: AnalyticsPeriod;
}[] = [
  { value: "7", period: 7 },
  { value: "30", period: 30 },
  { value: "90", period: 90 },
  { value: "all", period: null },
];

export const DEFAULT_ANALYTICS_PERIOD = "30";

export const FUNNEL_STEP_CLASSES: Record<FunnelStep, string> = {
  added: "bg-primary/25",
  screening: "bg-primary/40",
  technical: "bg-primary/60",
  final: "bg-primary/80",
  offer: "bg-primary",
};

export const OUTCOME_ITEMS: {
  key: keyof AnalyticsOutcomes;
  className: string;
}[] = [
  { key: "inProgress", className: "bg-primary" },
  { key: "awaiting", className: "bg-warning" },
  { key: "offered", className: "bg-ai" },
  { key: "closed", className: "bg-rejected" },
];

export const WEEKLY_SERIES = [
  { key: "vacancies", className: "bg-primary" },
  { key: "stages", className: "bg-terracotta" },
] as const;

export const MIN_BAR_PERCENT = 3;

export const AXIS_STEPS = 4;

export const DAYS_IN_WEEK = 7;
export const DAY_MS = 86_400_000;
