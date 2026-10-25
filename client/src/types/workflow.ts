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
  "cancelled_by_company",
] as const;

export type StageStatus = (typeof STAGE_STATUSES)[number];

export const REJECTION_REASONS = [
  "skills",
  "experience",
  "salary",
  "language",
  "location",
  "culture_fit",
  "test_task",
  "position_closed",
  "other_candidate",
  "candidate_declined",
  "no_reason",
  "other",
] as const;

export type RejectionReason = (typeof REJECTION_REASONS)[number];

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

export type StageNote = {
  id: string;
  stageId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type StageQuestion = {
  id: string;
  stageId: string;
  question: string;
  answer: string | null;
  wasHard: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StageQuestionDraft = {
  question: string;
  answer?: string | null;
  wasHard?: boolean;
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
  rejectionReason: RejectionReason | null;
  notes: StageNote[];
  questions: StageQuestion[];
  artifactUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkflowStagePatch = {
  status?: StageStatus;
  rejectionReason?: RejectionReason | null;
  scheduledAt?: string | null;
  deadlineAt?: string | null;
  artifactUrl?: string | null;
};

export type StageBrief = {
  id: string;
  code: string | null;
  name: string;
  category: StageCategory;
  status: StageStatus;
  scheduledAt: string | null;
  deadlineAt: string | null;
  completedAt: string | null;
  rejectionReason: RejectionReason | null;
};

export type WorkflowSummary = {
  vacancyId: string;
  stageCount: number;
  completedCount: number;
  rejected: boolean;
  offered: boolean;
  currentStage: StageBrief | null;
  reachedStage: StageBrief | null;
};

export type ApplicationWorkflow = {
  id: string;
  vacancyId: string;
  userId: string;
  stages: WorkflowStage[];
  createdAt: string;
  updatedAt: string;
};
