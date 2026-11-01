import { UpdateStageDto } from '../src/workflow/dto/workflow.dto';
import { WorkflowStage } from '../src/workflow/entities/workflow-stage.entity';
import { RejectionReason, StageStatus } from '../src/workflow/workflow.enums';
import {
  applyStageUpdate,
  resolveDate
} from '../src/utils/workflow-stage.utils';

const completedAt = new Date('2026-10-01T10:00:00Z');

function stage(overrides: Partial<WorkflowStage> = {}): WorkflowStage {
  return {
    status: StageStatus.IN_PROGRESS,
    isRequired: true,
    artifactUrl: 'https://repo.example',
    scheduledAt: new Date('2026-11-05T10:00:00Z'),
    deadlineAt: null,
    completedAt: null,
    rejectionReason: null,
    ...overrides
  } as WorkflowStage;
}

describe('resolveDate', () => {
  it('keeps the date when the field is not sent', () => {
    expect(resolveDate(undefined, completedAt)).toBe(completedAt);
  });
  it('clears the date for null or an empty string', () => {
    expect(resolveDate(null, completedAt)).toBeNull();
    expect(resolveDate('', completedAt)).toBeNull();
  });
  it('parses a sent date', () => {
    expect(resolveDate('2026-11-10T09:00:00Z', null)).toEqual(
      new Date('2026-11-10T09:00:00Z')
    );
  });
});

describe('applyStageUpdate', () => {
  it('changes only the fields that were sent', () => {
    const current = stage();
    applyStageUpdate(current, { deadlineAt: '2026-11-20' } as UpdateStageDto);
    expect(current.status).toBe(StageStatus.IN_PROGRESS);
    expect(current.artifactUrl).toBe('https://repo.example');
    expect(current.scheduledAt).toEqual(new Date('2026-11-05T10:00:00Z'));
    expect(current.deadlineAt).toEqual(new Date('2026-11-20'));
  });
  it('records completion once and keeps the first completion date', () => {
    const fresh = stage();
    applyStageUpdate(fresh, {
      status: StageStatus.COMPLETED
    } as UpdateStageDto);
    expect(fresh.completedAt).toEqual(expect.any(Date));

    const done = stage({ status: StageStatus.COMPLETED, completedAt });
    applyStageUpdate(done, {
      status: StageStatus.CANCELLED_BY_COMPANY
    } as UpdateStageDto);
    expect(done.completedAt).toBe(completedAt);
  });
  it('gives a skipped or reopened stage no completion date', () => {
    const skipped = stage({ status: StageStatus.COMPLETED, completedAt });
    applyStageUpdate(skipped, {
      status: StageStatus.SKIPPED
    } as UpdateStageDto);
    expect(skipped.completedAt).toBeNull();
  });
  it('keeps a rejection reason only on a cancelled stage', () => {
    const rejected = stage();
    applyStageUpdate(rejected, {
      status: StageStatus.CANCELLED,
      rejectionReason: RejectionReason.SALARY
    } as UpdateStageDto);
    expect(rejected.rejectionReason).toBe(RejectionReason.SALARY);

    applyStageUpdate(rejected, {
      status: StageStatus.IN_PROGRESS
    } as UpdateStageDto);
    expect(rejected.rejectionReason).toBeNull();
  });
});
