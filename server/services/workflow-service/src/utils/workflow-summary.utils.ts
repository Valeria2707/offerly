import { ApplicationWorkflow } from '../workflow/entities/application-workflow.entity';
import { WorkflowSummaryDto } from '../workflow/dto/workflow-summary.dto';
import { StageStatus } from '../workflow/workflow.enums';

const CLOSED_STATUSES = new Set([
  StageStatus.COMPLETED,
  StageStatus.CANCELLED,
  StageStatus.SKIPPED
]);

export const OFFER_STAGE_CODE = 'offer';

export function toWorkflowSummary(
  workflow: ApplicationWorkflow
): WorkflowSummaryDto {
  const stages = workflow.stages;
  const current = stages.find((stage) => !CLOSED_STATUSES.has(stage.status));
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
    currentStage: current
      ? {
          id: current.id,
          name: current.name,
          category: current.category,
          status: current.status,
          scheduledAt: current.scheduledAt,
          deadlineAt: current.deadlineAt
        }
      : null
  };
}
