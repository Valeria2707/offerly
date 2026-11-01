import { StageStatus } from './workflow.enums';

export const FINISHED_STATUSES = new Set<StageStatus>([
  StageStatus.COMPLETED,
  StageStatus.CANCELLED,
  StageStatus.SKIPPED,
  StageStatus.CANCELLED_BY_COMPANY
]);

export const COMPLETED_AT_STATUSES = new Set<StageStatus>([
  StageStatus.COMPLETED,
  StageStatus.CANCELLED,
  StageStatus.CANCELLED_BY_COMPANY
]);

export const NOT_REACHED_STATUSES = new Set<StageStatus>([
  StageStatus.NOT_STARTED,
  StageStatus.SKIPPED,
  StageStatus.CANCELLED_BY_COMPANY
]);
