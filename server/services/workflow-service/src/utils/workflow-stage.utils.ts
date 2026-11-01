import { UpdateStageDto } from '../workflow/dto/workflow.dto';
import { WorkflowStage } from '../workflow/entities/workflow-stage.entity';
import { COMPLETED_AT_STATUSES } from '../workflow/workflow.constants';
import { StageStatus } from '../workflow/workflow.enums';

export function resolveDate(
  value: string | null | undefined,
  current: Date | null
): Date | null {
  if (value === undefined) return current;
  if (!value) return null;
  return new Date(value);
}

export function applyStageUpdate(
  stage: WorkflowStage,
  input: UpdateStageDto
): void {
  if (input.isRequired !== undefined) stage.isRequired = input.isRequired;
  if (input.artifactUrl !== undefined) stage.artifactUrl = input.artifactUrl;
  if (input.rejectionReason !== undefined)
    stage.rejectionReason = input.rejectionReason;
  stage.scheduledAt = resolveDate(input.scheduledAt, stage.scheduledAt);
  stage.deadlineAt = resolveDate(input.deadlineAt, stage.deadlineAt);
  if (input.status) {
    stage.status = input.status;
    stage.completedAt = COMPLETED_AT_STATUSES.has(input.status)
      ? (stage.completedAt ?? new Date())
      : null;
  }
  if (stage.status !== StageStatus.CANCELLED) stage.rejectionReason = null;
}
