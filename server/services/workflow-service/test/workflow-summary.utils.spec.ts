import { toWorkflowSummary } from '../src/utils/workflow-summary.utils';
import { ApplicationWorkflow } from '../src/workflow/entities/application-workflow.entity';
import { WorkflowStage } from '../src/workflow/entities/workflow-stage.entity';
import { StageCategory, StageStatus } from '../src/workflow/workflow.enums';

const stage = (
  id: string,
  code: string,
  category: StageCategory,
  status: StageStatus
): WorkflowStage =>
  ({
    id,
    stageType: { code },
    name: code,
    category,
    status,
    scheduledAt: null,
    deadlineAt: null,
    completedAt: null
  }) as unknown as WorkflowStage;

const workflow = (stages: WorkflowStage[]): ApplicationWorkflow =>
  ({ vacancyId: 'vacancy', stages }) as unknown as ApplicationWorkflow;

describe('toWorkflowSummary', () => {
  it('reports the furthest reached stage and the first unfinished one', () => {
    const summary = toWorkflowSummary(
      workflow([
        stage(
          'a',
          'submitted',
          StageCategory.ADMINISTRATIVE,
          StageStatus.COMPLETED
        ),
        stage(
          'b',
          'hr_screening',
          StageCategory.SCREENING,
          StageStatus.SKIPPED
        ),
        stage(
          'c',
          'test_task',
          StageCategory.TECHNICAL,
          StageStatus.IN_PROGRESS
        ),
        stage(
          'd',
          'offer',
          StageCategory.ADMINISTRATIVE,
          StageStatus.NOT_STARTED
        )
      ])
    );
    expect(summary.reachedStage?.id).toBe('c');
    expect(summary.reachedStage?.code).toBe('test_task');
    expect(summary.currentStage?.id).toBe('c');
  });

  it('treats the rejected stage as reached', () => {
    const summary = toWorkflowSummary(
      workflow([
        stage(
          'a',
          'submitted',
          StageCategory.ADMINISTRATIVE,
          StageStatus.COMPLETED
        ),
        stage(
          'b',
          'hr_screening',
          StageCategory.SCREENING,
          StageStatus.CANCELLED
        ),
        stage(
          'c',
          'offer',
          StageCategory.ADMINISTRATIVE,
          StageStatus.NOT_STARTED
        )
      ])
    );
    expect(summary.rejected).toBe(true);
    expect(summary.reachedStage?.id).toBe('b');
  });

  it('has no reached stage when nothing has started', () => {
    expect(toWorkflowSummary(workflow([])).reachedStage).toBeNull();
  });
});
