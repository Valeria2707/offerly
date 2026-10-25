import { FunnelStep } from '../src/analytics/analytics.enums';
import { AnalyticsVacancy } from '../src/analytics/analytics.types';
import {
  buildAnalytics,
  buildSkills,
  startOfWeek,
  toVacancies,
  weekCount
} from '../src/utils/analytics.utils';
import { ApplicationWorkflow } from '../src/workflow/entities/application-workflow.entity';
import { WorkflowStage } from '../src/workflow/entities/workflow-stage.entity';
import { StageCategory, StageStatus } from '../src/workflow/workflow.enums';

const NOW = new Date('2026-10-25T12:00:00Z');

const vacancy = (
  id: string,
  createdAt: string,
  overrides: Partial<AnalyticsVacancy> = {}
): AnalyticsVacancy => ({
  id,
  createdAt: new Date(createdAt),
  lifecycle: 'active',
  workFormat: 'Remote',
  requiredSkills: [],
  ...overrides
});

const stage = (
  code: string,
  category: StageCategory,
  status: StageStatus,
  completedAt: string | null = null
): WorkflowStage =>
  ({
    stageType: { code },
    category,
    status,
    completedAt: completedAt ? new Date(completedAt) : null
  }) as unknown as WorkflowStage;

const workflow = (
  vacancyId: string,
  stages: WorkflowStage[]
): ApplicationWorkflow =>
  ({ vacancyId, stages }) as unknown as ApplicationWorkflow;

describe('analytics utils', () => {
  const vacancies = [
    vacancy('offer', '2026-10-01T00:00:00Z', {
      requiredSkills: ['React', 'Docker']
    }),
    vacancy('rejected', '2026-10-10T00:00:00Z', {
      requiredSkills: ['react', 'TypeScript'],
      workFormat: 'Hybrid'
    }),
    vacancy('waiting', '2026-10-20T00:00:00Z', { workFormat: null }),
    vacancy('old', '2026-08-01T00:00:00Z')
  ];
  const workflows = [
    workflow('offer', [
      stage('submitted', StageCategory.ADMINISTRATIVE, StageStatus.COMPLETED),
      stage(
        'hr_screening',
        StageCategory.SCREENING,
        StageStatus.COMPLETED,
        '2026-10-05T00:00:00Z'
      ),
      stage(
        'technical_interview',
        StageCategory.TECHNICAL,
        StageStatus.COMPLETED,
        '2026-10-08T00:00:00Z'
      ),
      stage(
        'offer',
        StageCategory.ADMINISTRATIVE,
        StageStatus.COMPLETED,
        '2026-10-11T00:00:00Z'
      )
    ]),
    workflow('rejected', [
      stage(
        'hr_screening',
        StageCategory.SCREENING,
        StageStatus.COMPLETED,
        '2026-10-12T00:00:00Z'
      ),
      stage(
        'technical_interview',
        StageCategory.TECHNICAL,
        StageStatus.CANCELLED,
        '2026-10-16T00:00:00Z'
      )
    ]),
    workflow('waiting', [
      stage(
        'hr_screening',
        StageCategory.SCREENING,
        StageStatus.AWAITING_RESULT
      )
    ])
  ];
  const result = buildAnalytics({
    vacancies,
    workflows,
    profileSkills: ['React'],
    period: 30,
    now: NOW
  });

  it('summarises only vacancies added inside the period', () => {
    expect(result.summary).toEqual({
      added: 3,
      addedPrevious: 0,
      active: 1,
      awaiting: 1,
      offers: 1,
      offerRate: 33,
      averageDays: 8
    });
    expect(result.outcomes).toEqual({
      inProgress: 0,
      awaiting: 1,
      offered: 1,
      closed: 1
    });
  });

  it('counts how far each process got', () => {
    expect(result.funnel).toEqual([
      { step: FunnelStep.ADDED, count: 3 },
      { step: FunnelStep.SCREENING, count: 3 },
      { step: FunnelStep.TECHNICAL, count: 2 },
      { step: FunnelStep.FINAL, count: 0 },
      { step: FunnelStep.OFFER, count: 1 }
    ]);
  });

  it('rates stage categories and ignores the auto-completed submit', () => {
    const technical = result.categories.find(
      (item) => item.category === StageCategory.TECHNICAL
    );
    const administrative = result.categories.find(
      (item) => item.category === StageCategory.ADMINISTRATIVE
    );
    expect(technical).toEqual({
      category: StageCategory.TECHNICAL,
      passed: 1,
      failed: 1,
      rate: 50
    });
    expect(administrative?.passed).toBe(1);
  });

  it('groups skills case-insensitively and marks profile gaps', () => {
    expect(result.skills[0]).toEqual({
      name: 'React',
      count: 2,
      inProfile: true
    });
    expect(result.skills.find((item) => item.name === 'Docker')).toEqual({
      name: 'Docker',
      count: 1,
      inProfile: false
    });
    expect(buildSkills([], [])).toEqual([]);
  });

  it('keeps unknown work formats as null', () => {
    expect(result.workFormats).toEqual(
      expect.arrayContaining([
        { label: 'Remote', count: 1 },
        { label: 'Hybrid', count: 1 },
        { label: null, count: 1 }
      ])
    );
  });

  it('builds Monday-based weeks ending with the current one', () => {
    expect(startOfWeek(NOW).toISOString().slice(0, 10)).toBe('2026-10-19');
    expect(weekCount(7)).toBe(4);
    expect(weekCount(90)).toBe(13);
    expect(weekCount(null)).toBe(12);
    expect(result.weekly[result.weekly.length - 1]).toEqual({
      weekStart: '2026-10-19',
      vacancies: 1,
      stages: 0
    });
  });

  it('returns no previous period for the whole history', () => {
    const all = buildAnalytics({
      vacancies,
      workflows,
      profileSkills: [],
      period: null,
      now: NOW
    });
    expect(all.summary.added).toBe(4);
    expect(all.summary.addedPrevious).toBeNull();
  });

  it('skips malformed vacancies from the upstream list', () => {
    expect(
      toVacancies([
        { id: 'a' },
        null,
        { id: 'b', createdAt: NOW.toISOString() }
      ])
    ).toHaveLength(1);
  });
});
