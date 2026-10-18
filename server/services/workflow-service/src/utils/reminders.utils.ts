import { differenceInCalendarDays } from 'date-fns';
import {
  DEADLINE_DAYS,
  FINISHED_STATUSES,
  SILENCE_DAYS
} from '../calendar/calendar.constants';
import { ReminderKind } from '../calendar/calendar.enums';
import { WorkflowStage } from '../workflow/entities/workflow-stage.entity';
import { StageStatus } from '../workflow/workflow.enums';

export type ReminderRules = {
  beforeInterview: boolean;
  afterStage: boolean;
  beforeDeadline: boolean;
  silence: boolean;
};

export type StageReminder = {
  stage: WorkflowStage;
  kind: ReminderKind;
  days: number;
};

export function daysBetween(now: Date, target: Date): number {
  return differenceInCalendarDays(target, now);
}

export function isFinished(stage: WorkflowStage): boolean {
  return FINISHED_STATUSES.has(stage.status);
}

function match(
  stage: WorkflowStage,
  now: Date,
  rules: ReminderRules
): StageReminder | null {
  if (isFinished(stage)) return null;
  const scheduled = stage.scheduledAt;
  const deadline = stage.deadlineAt;
  if (rules.afterStage && scheduled && scheduled.getTime() < now.getTime())
    return {
      stage,
      kind: ReminderKind.RECORD_RESULT,
      days: daysBetween(now, scheduled)
    };
  if (rules.beforeInterview && scheduled && daysBetween(now, scheduled) === 0)
    return { stage, kind: ReminderKind.INTERVIEW_TODAY, days: 0 };
  if (rules.beforeDeadline && deadline) {
    const days = daysBetween(now, deadline);
    if (days >= 0 && days <= DEADLINE_DAYS)
      return { stage, kind: ReminderKind.DEADLINE_SOON, days };
  }
  if (
    rules.silence &&
    stage.status === StageStatus.AWAITING_RESULT &&
    daysBetween(stage.updatedAt, now) >= SILENCE_DAYS
  )
    return {
      stage,
      kind: ReminderKind.SILENCE,
      days: -daysBetween(stage.updatedAt, now)
    };
  return null;
}

export function buildReminders(
  stages: WorkflowStage[],
  now: Date,
  rules: ReminderRules
): StageReminder[] {
  return stages
    .map((stage) => match(stage, now, rules))
    .filter((reminder): reminder is StageReminder => reminder !== null)
    .sort((left, right) => left.days - right.days);
}
