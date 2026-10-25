import type {
  AnalyticsOutcomes,
  AnalyticsPeriod,
  FunnelStep,
} from "@/types/analytics";

export const ANALYTICS_PERIOD_OPTIONS: {
  value: string;
  label: string;
  period: AnalyticsPeriod;
}[] = [
  { value: "7", label: "7 днів", period: 7 },
  { value: "30", label: "30 днів", period: 30 },
  { value: "90", label: "90 днів", period: 90 },
  { value: "all", label: "Весь час", period: null },
];

export const DEFAULT_ANALYTICS_PERIOD = "30";

export const FUNNEL_STEP_LABELS: Record<FunnelStep, string> = {
  added: "Додано",
  screening: "Скринінг",
  technical: "Технічні",
  final: "Фінальні",
  offer: "Оффер",
};

export const FUNNEL_STEP_CLASSES: Record<FunnelStep, string> = {
  added: "bg-primary/25",
  screening: "bg-primary/40",
  technical: "bg-primary/60",
  final: "bg-primary/80",
  offer: "bg-primary",
};

export const OUTCOME_ITEMS: {
  key: keyof AnalyticsOutcomes;
  label: string;
  className: string;
}[] = [
  { key: "inProgress", label: "В процесі", className: "bg-primary" },
  { key: "awaiting", label: "Чекають відповіді", className: "bg-warning" },
  { key: "offered", label: "Оффер", className: "bg-ai" },
  { key: "closed", label: "Відмова / архів", className: "bg-rejected" },
];

export const WEEKLY_SERIES = [
  { key: "vacancies", label: "Нові вакансії", className: "bg-primary" },
  { key: "stages", label: "Пройдені етапи", className: "bg-terracotta" },
] as const;

export const UNKNOWN_WORK_FORMAT_LABEL = "Не вказано";

export const MIN_BAR_PERCENT = 3;

export const AXIS_STEPS = 4;

export const DAYS_IN_WEEK = 7;
export const DAY_MS = 86_400_000;
