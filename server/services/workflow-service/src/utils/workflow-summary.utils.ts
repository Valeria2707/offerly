import { ApplicationWorkflow } from '../workflow/entities/application-workflow.entity';
import { WorkflowStage } from '../workflow/entities/workflow-stage.entity';
import {
  StageBriefDto,
  WorkflowSummaryDto
} from '../workflow/dto/workflow-summary.dto';
import { StageStatus } from '../workflow/workflow.enums';

const CLOSED_STATUSES = new Set([
  StageStatus.COMPLETED,
  StageStatus.CANCELLED,
  StageStatus.SKIPPED
]);

const NOT_REACHED_STATUSES = new Set([
  StageStatus.NOT_STARTED,
  StageStatus.SKIPPED
]);

export const OFFER_STAGE_CODE = 'offer';

function toBrief(stage: WorkflowStage): StageBriefDto {
  return {
    id: stage.id,
    code: stage.stageType?.code ?? null,
    name: stage.name,
    category: stage.category,
    status: stage.status,
    scheduledAt: stage.scheduledAt,
    deadlineAt: stage.deadlineAt,
    completedAt: stage.completedAt
  };
}

export function toWorkflowSummary(
  workflow: ApplicationWorkflow
): WorkflowSummaryDto {
  const stages = workflow.stages;
  const current = stages.find((stage) => !CLOSED_STATUSES.has(stage.status));
  const reached = [...stages]
    .reverse()
    .find((stage) => !NOT_REACHED_STATUSES.has(stage.status));
  return {
    vacancyId: workflow.vacancyId,
    stageCount: stages.length,
    completedCount: stages.filter(
      (stage) => stage.status === StageStatus.COMPLETED
    ).length,
    rejected: stages.some(
      (stage) => stage.status === StageStatus.CANCELLED
    ),
    offered: stages.some(
      (stage) =>
        stage.stageType?.code === OFFER_STAGE_CODE &&
        stage.status === StageStatus.COMPLETED
    ),
    currentStage: current ? toBrief(current) : null,
    reachedStage: reached ? toBrief(reached) : null
  };
}
