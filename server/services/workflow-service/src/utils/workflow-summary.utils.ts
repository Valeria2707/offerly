import { ApplicationWorkflow } from '../workflow/entities/application-workflow.entity';
import { WorkflowStage } from '../workflow/entities/workflow-stage.entity';
import {
  StageBriefDto,
  WorkflowSummaryDto
} from '../workflow/dto/workflow-summary.dto';
import { STAGE_CODES } from '../stage-type/stage-type.constants';
import {
  FINISHED_STATUSES,
  NOT_REACHED_STATUSES
} from '../workflow/workflow.constants';
import { StageStatus } from '../workflow/workflow.enums';

function toBrief(stage: WorkflowStage): StageBriefDto {
  return {
    id: stage.id,
    code: stage.stageType?.code ?? null,
    name: stage.name,
    category: stage.category,
    status: stage.status,
    scheduledAt: stage.scheduledAt,
    deadlineAt: stage.deadlineAt,
    completedAt: stage.completedAt,
    rejectionReason: stage.rejectionReason
  };
}

export function toWorkflowSummary(
  workflow: ApplicationWorkflow
): WorkflowSummaryDto {
  const stages = workflow.stages;
  const current = stages.find((stage) => !FINISHED_STATUSES.has(stage.status));
  const reached = [...stages]
    .reverse()
    .find((stage) => !NOT_REACHED_STATUSES.has(stage.status));
  return {
    vacancyId: workflow.vacancyId,
    stageCount: stages.length,
    completedCount: stages.filter(
      (stage) => stage.status === StageStatus.COMPLETED
    ).length,
    rejected: stages.some((stage) => stage.status === StageStatus.CANCELLED),
    offered: stages.some(
      (stage) =>
        stage.stageType?.code === STAGE_CODES.OFFER &&
        stage.status === StageStatus.COMPLETED
    ),
    currentStage: current ? toBrief(current) : null,
    reachedStage: reached ? toBrief(reached) : null
  };
}
