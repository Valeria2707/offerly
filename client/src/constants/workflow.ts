import type { StageCategory, StageStatus } from "@/types/workflow";

export const STAGE_CATEGORY_LABELS: Record<StageCategory, string> = {
  screening: "Скринінг",
  technical: "Технічний",
  behavioral: "Поведінковий",
  administrative: "Адміністративний",
};

export const STAGE_CATEGORY_CLASSES: Record<StageCategory, string> = {
  screening: "bg-secondary text-muted-foreground",
  technical: "bg-success-muted text-success",
  behavioral: "bg-ai-muted text-ai",
  administrative: "bg-warning-muted text-warning",
};

export const STAGE_STATUS_LABELS: Record<StageStatus, string> = {
  not_started: "Ще не було",
  scheduled: "Заплановано",
  in_progress: "Триває",
  awaiting_result: "Очікую результат",
  completed: "Пройдено",
  cancelled: "Скасовано",
  skipped: "Пропущено",
};

export const STAGE_STATUS_CLASSES: Record<StageStatus, string> = {
  not_started: "bg-muted text-subtle",
  scheduled: "bg-warning-muted text-warning",
  in_progress: "bg-warning-muted text-warning",
  awaiting_result: "bg-warning-muted text-warning",
  completed: "bg-success-muted text-success",
  cancelled: "bg-muted text-subtle",
  skipped: "bg-muted text-subtle",
};

export const SYSTEM_STAGE_NAMES: Record<string, string> = {
  Submitted: "Подано",
  "HR screening": "HR-скринінг",
  "Pre-tech screening": "Pre-tech скринінг",
  "Test task": "Тестове завдання",
  "Technical interview": "Технічна співбесіда",
  "Live coding": "Live coding",
  "System Design": "System Design",
  "Team interview": "Співбесіда з командою",
  "Culture fit": "Culture fit",
  "Final interview": "Фінальна співбесіда",
  "Offer negotiation": "Переговори про оффер",
  Offer: "Оффер",
  Rejection: "Відмова",
};

export const CLOSED_STAGE_STATUSES: StageStatus[] = [
  "completed",
  "cancelled",
  "skipped",
];

export const MAX_STAGE_DURATION_MINUTES = 1440;
