export const STAGE_CATEGORIES = [
  "screening",
  "technical",
  "behavioral",
  "administrative",
] as const;

export type StageCategory = (typeof STAGE_CATEGORIES)[number];

export const STAGE_STATUSES = [
  "not_started",
  "scheduled",
  "in_progress",
  "awaiting_result",
  "completed",
  "cancelled",
  "skipped",
] as const;

export type StageStatus = (typeof STAGE_STATUSES)[number];

export type StageType = {
  id: string;
  ownerUserId: string | null;
  code: string | null;
  name: string;
  category: StageCategory;
  expectedDurationMinutes: number | null;
  requiresPreparation: boolean;
  supportsDeadline: boolean;
  producesArtifact: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StageTypeDraft = {
  name: string;
  category: StageCategory;
  expectedDurationMinutes: number | null;
  requiresPreparation: boolean;
  supportsDeadline: boolean;
  producesArtifact: boolean;
};

export type WorkflowStage = {
  id: string;
  workflowId: string;
  stageTypeId: string;
  name: string;
  category: StageCategory;
  position: number;
  isRequired: boolean;
  status: StageStatus;
  scheduledAt: string | null;
  deadlineAt: string | null;
  completedAt: string | null;
  note: string | null;
  artifactUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationWorkflow = {
  id: string;
  vacancyId: string;
  userId: string;
  stages: WorkflowStage[];
  createdAt: string;
  updatedAt: string;
};
