import type { VacancyStatus } from "@/types/vacancy";

export const VACANCY_STATUS_LABELS: Record<VacancyStatus, string> = {
  saved: "Збережено",
  applied: "Подано",
  hr: "HR",
  interview: "Співбесіда",
  technical: "Технічна",
  final: "Фінальна",
  offer: "Оффер",
  rejected: "Відмова",
  closed: "Закрито",
};

export const VACANCY_STATUS_CLASSES: Record<VacancyStatus, string> = {
  saved: "bg-secondary text-muted-foreground",
  applied: "bg-secondary text-muted-foreground",
  hr: "bg-warning-muted text-warning",
  interview: "bg-warning-muted text-warning",
  technical: "bg-warning-muted text-warning",
  final: "bg-ai-muted text-ai",
  offer: "bg-success-muted text-success",
  rejected: "bg-destructive/10 text-destructive",
  closed: "bg-muted text-subtle",
};

export const INTERVIEW_STATUSES: VacancyStatus[] = [
  "hr",
  "interview",
  "technical",
  "final",
];

export const CLOSED_STATUSES: VacancyStatus[] = ["rejected", "closed"];
