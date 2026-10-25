import { isRecord } from '@offerly/helpers';
import {
  ACTIVE_LIFECYCLE,
  ALL_TIME_WEEKS,
  AUTO_STAGE_CODE,
  DAY_MS,
  MAX_WEEKS,
  MIN_WEEKS,
  NOT_REACHED_STATUSES,
  TOP_SKILLS_LIMIT,
  WEEK_MS
} from '../analytics/analytics.constants';
import { FunnelStep, ProcessOutcome } from '../analytics/analytics.enums';
import { AnalyticsVacancy } from '../analytics/analytics.types';
import {
  AnalyticsDto,
  AnalyticsOutcomesDto,
  AnalyticsSummaryDto,
  CategoryResultDto,
  FunnelStepDto,
  SkillDemandDto,
  WeeklyActivityDto,
  WorkFormatDto
} from '../analytics/dto/analytics.dto';
import { ApplicationWorkflow } from '../workflow/entities/application-workflow.entity';
import { WorkflowStage } from '../workflow/entities/workflow-stage.entity';
import { StageCategory, StageStatus } from '../workflow/workflow.enums';
import {
  normalizeSkill,
  profileSkills,
  readText,
  readTexts
} from './preparation.utils';
import { toWorkflowSummary } from './workflow-summary.utils';

export interface Process {
  vacancy: AnalyticsVacancy;
  stages: WorkflowStage[];
  outcome: ProcessOutcome;
  finished: boolean;
}

export interface AnalyticsInput {
  vacancies: AnalyticsVacancy[];
  workflows: ApplicationWorkflow[];
  profileSkills: string[];
  period: number | null;
  now: Date;
}

const percent = (part: number, total: number): number | null =>
  total ? Math.round((part / total) * 100) : null;

const isCounted = (stage: WorkflowStage): boolean =>
  stage.stageType?.code !== AUTO_STAGE_CODE;

export function toVacancies(value: unknown[]): AnalyticsVacancy[] {
  return value.filter(isRecord).flatMap((item) => {
    const id = readText(item.id);
    const createdAt = readText(item.createdAt);
    if (!id || !createdAt) return [];
    return [
      {
        id,
        createdAt: new Date(createdAt),
        lifecycle: readText(item.lifecycle) ?? ACTIVE_LIFECYCLE,
        workFormat: readText(item.workFormat),
        requiredSkills: readTexts(item.requiredSkills)
      }
    ];
  });
}

export function toProfileSkills(value: unknown): string[] {
  return isRecord(value) && isRecord(value.data)
    ? profileSkills(value.data)
    : [];
}

function outcomeOf(
  vacancy: AnalyticsVacancy,
  stages: WorkflowStage[],
  offered: boolean,
  rejected: boolean
): ProcessOutcome {
  if (offered) return ProcessOutcome.OFFERED;
  if (rejected || vacancy.lifecycle !== ACTIVE_LIFECYCLE)
    return ProcessOutcome.CLOSED;
  if (stages.some((stage) => stage.status === StageStatus.AWAITING_RESULT))
    return ProcessOutcome.AWAITING;
  return ProcessOutcome.IN_PROGRESS;
}

export function toProcess(
  vacancy: AnalyticsVacancy,
  workflow: ApplicationWorkflow | undefined
): Process {
  if (!workflow)
    return {
      vacancy,
      stages: [],
      outcome: outcomeOf(vacancy, [], false, false),
      finished: false
    };
  const { offered, rejected } = toWorkflowSummary(workflow);
  return {
    vacancy,
    stages: workflow.stages,
    outcome: outcomeOf(vacancy, workflow.stages, offered, rejected),
    finished: offered || rejected
  };
}

function finishedAt(stages: WorkflowStage[]): number | null {
  const latest = Math.max(
    0,
    ...stages.map((stage) => stage.completedAt?.getTime() ?? 0)
  );
  return latest || null;
}

function averageDays(processes: Process[]): number | null {
  const days = processes.flatMap((process) => {
    const end = process.finished ? finishedAt(process.stages) : null;
    return end ? [(end - process.vacancy.createdAt.getTime()) / DAY_MS] : [];
  });
  if (!days.length) return null;
  return Math.round(days.reduce((sum, day) => sum + day, 0) / days.length);
}

const countOutcome = (processes: Process[], outcome: ProcessOutcome): number =>
  processes.filter((process) => process.outcome === outcome).length;

export function buildOutcomes(processes: Process[]): AnalyticsOutcomesDto {
  return {
    inProgress: countOutcome(processes, ProcessOutcome.IN_PROGRESS),
    awaiting: countOutcome(processes, ProcessOutcome.AWAITING),
    offered: countOutcome(processes, ProcessOutcome.OFFERED),
    closed: countOutcome(processes, ProcessOutcome.CLOSED)
  };
}

function buildSummary(
  processes: Process[],
  outcomes: AnalyticsOutcomesDto,
  addedPrevious: number | null
): AnalyticsSummaryDto {
  return {
    added: processes.length,
    addedPrevious,
    active: outcomes.inProgress + outcomes.awaiting,
    awaiting: outcomes.awaiting,
    offers: outcomes.offered,
    offerRate: percent(outcomes.offered, processes.length) ?? 0,
    averageDays: averageDays(processes)
  };
}

const FUNNEL_CATEGORIES: [FunnelStep, StageCategory][] = [
  [FunnelStep.SCREENING, StageCategory.SCREENING],
  [FunnelStep.TECHNICAL, StageCategory.TECHNICAL],
  [FunnelStep.FINAL, StageCategory.BEHAVIORAL]
];

const reached = (stages: WorkflowStage[], category: StageCategory): boolean =>
  stages.some(
    (stage) =>
      stage.category === category && !NOT_REACHED_STATUSES.has(stage.status)
  );

export function buildFunnel(processes: Process[]): FunnelStepDto[] {
  return [
    { step: FunnelStep.ADDED, count: processes.length },
    ...FUNNEL_CATEGORIES.map(([step, category]) => ({
      step,
      count: processes.filter((process) => reached(process.stages, category))
        .length
    })),
    {
      step: FunnelStep.OFFER,
      count: countOutcome(processes, ProcessOutcome.OFFERED)
    }
  ];
}

export function startOfWeek(date: Date): Date {
  const day = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  const sinceMonday = (new Date(day).getUTCDay() + 6) % 7;
  return new Date(day - sinceMonday * DAY_MS);
}

export function weekCount(period: number | null): number {
  if (!period) return ALL_TIME_WEEKS;
  return Math.min(MAX_WEEKS, Math.max(MIN_WEEKS, Math.ceil(period / 7)));
}

export function buildWeekly(
  vacancies: AnalyticsVacancy[],
  stages: WorkflowStage[],
  period: number | null,
  now: Date
): WeeklyActivityDto[] {
  const count = weekCount(period);
  const first = startOfWeek(now).getTime() - (count - 1) * WEEK_MS;
  const weeks = Array.from({ length: count }, (_, index) => ({
    weekStart: new Date(first + index * WEEK_MS).toISOString().slice(0, 10),
    vacancies: 0,
    stages: 0
  }));
  const weekOf = (date: Date) =>
    weeks[Math.floor((date.getTime() - first) / WEEK_MS)];
  for (const vacancy of vacancies) {
    const week = weekOf(vacancy.createdAt);
    if (week) week.vacancies += 1;
  }
  for (const stage of stages) {
    if (stage.status !== StageStatus.COMPLETED || !stage.completedAt) continue;
    const week = weekOf(stage.completedAt);
    if (week) week.stages += 1;
  }
  return weeks;
}

export function buildCategories(stages: WorkflowStage[]): CategoryResultDto[] {
  return Object.values(StageCategory).map((category) => {
    const own = stages.filter((stage) => stage.category === category);
    const passed = own.filter(
      (stage) => stage.status === StageStatus.COMPLETED
    ).length;
    const failed = own.filter(
      (stage) => stage.status === StageStatus.CANCELLED
    ).length;
    return { category, passed, failed, rate: percent(passed, passed + failed) };
  });
}

export function buildSkills(
  vacancies: AnalyticsVacancy[],
  known: string[]
): SkillDemandDto[] {
  const knownKeys = new Set(known.map(normalizeSkill));
  const demand = new Map<string, { name: string; count: number }>();
  for (const vacancy of vacancies) {
    const seen = new Set<string>();
    for (const name of vacancy.requiredSkills) {
      const key = normalizeSkill(name);
      if (seen.has(key)) continue;
      seen.add(key);
      const entry = demand.get(key) ?? { name, count: 0 };
      entry.count += 1;
      demand.set(key, entry);
    }
  }
  return [...demand.entries()]
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, TOP_SKILLS_LIMIT)
    .map(([key, { name, count }]) => ({
      name,
      count,
      inProfile: knownKeys.has(key)
    }));
}

export function buildWorkFormats(
  vacancies: AnalyticsVacancy[]
): WorkFormatDto[] {
  const formats = new Map<string, WorkFormatDto>();
  for (const vacancy of vacancies) {
    const key = vacancy.workFormat?.toLowerCase() ?? '';
    const entry = formats.get(key) ?? { label: vacancy.workFormat, count: 0 };
    entry.count += 1;
    formats.set(key, entry);
  }
  return [...formats.values()].sort((a, b) => b.count - a.count);
}

const addedBetween = (
  vacancies: AnalyticsVacancy[],
  from: number,
  to: number
): AnalyticsVacancy[] =>
  vacancies.filter((vacancy) => {
    const time = vacancy.createdAt.getTime();
    return time >= from && time < to;
  });

export function buildAnalytics(input: AnalyticsInput): AnalyticsDto {
  const { vacancies, workflows, period, now } = input;
  const span = period ? period * DAY_MS : null;
  const end = now.getTime() + DAY_MS;
  const start = span ? now.getTime() - span : null;
  const workflowOf = new Map(
    workflows.map((workflow) => [workflow.vacancyId, workflow])
  );
  const inPeriod = start ? addedBetween(vacancies, start, end) : vacancies;
  const addedPrevious =
    span && start ? addedBetween(vacancies, start - span, start).length : null;
  const processes = inPeriod.map((vacancy) =>
    toProcess(vacancy, workflowOf.get(vacancy.id))
  );
  const allStages = vacancies
    .flatMap((vacancy) => workflowOf.get(vacancy.id)?.stages ?? [])
    .filter(isCounted);
  const outcomes = buildOutcomes(processes);
  return {
    period,
    summary: buildSummary(processes, outcomes, addedPrevious),
    funnel: buildFunnel(processes),
    outcomes,
    weekly: buildWeekly(vacancies, allStages, period, now),
    categories: buildCategories(
      processes.flatMap((process) => process.stages).filter(isCounted)
    ),
    skills: buildSkills(inPeriod, input.profileSkills),
    workFormats: buildWorkFormats(inPeriod)
  };
}
