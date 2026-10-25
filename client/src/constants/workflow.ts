import type { StageCategory, StageStatus } from "@/types/workflow";

export const STAGE_CATEGORY_CLASSES: Record<StageCategory, string> = {
  screening: "bg-secondary text-muted-foreground",
  technical: "bg-success-muted text-success",
  behavioral: "bg-ai-muted text-ai",
  administrative: "bg-warning-muted text-warning",
};

export const STAGE_STATUS_CLASSES: Record<StageStatus, string> = {
  not_started: "bg-muted text-subtle",
  scheduled: "bg-warning-muted text-warning",
  in_progress: "bg-warning-muted text-warning",
  awaiting_result: "bg-warning-muted text-warning",
  completed: "bg-success-muted text-success",
  cancelled: "bg-rejected-muted text-rejected",
  skipped: "bg-muted text-subtle",
  cancelled_by_company: "bg-muted text-subtle",
};

export const SYSTEM_STAGE_KEYS = {
  Submitted: "submitted",
  "HR screening": "hrScreening",
  "Pre-tech screening": "preTechScreening",
  "Test task": "testTask",
  "Technical interview": "technicalInterview",
  "Live coding": "liveCoding",
  "System Design": "systemDesign",
  "Team interview": "teamInterview",
  "Culture fit": "cultureFit",
  "Final interview": "finalInterview",
  "Offer negotiation": "offerNegotiation",
  Offer: "offer",
  Rejection: "rejection",
} as const;

export type SystemStageName = keyof typeof SYSTEM_STAGE_KEYS;

export const CLOSED_STAGE_STATUSES: StageStatus[] = [
  "completed",
  "cancelled",
  "skipped",
  "cancelled_by_company",
];

export const MAX_STAGE_DURATION_MINUTES = 1440;

export const QUESTION_MAX_LENGTH = 2000;
export const ANSWER_MAX_LENGTH = 5000;
