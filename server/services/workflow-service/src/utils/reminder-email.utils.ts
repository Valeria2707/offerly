import { escapeHtml } from '@offerly/helpers';
import { format, getISOWeek, getISOWeekYear } from 'date-fns';
import { uk } from 'date-fns/locale';
import { DIGEST_MAX_ITEMS } from '../calendar/calendar.constants';
import { WorkflowStage } from '../workflow/entities/workflow-stage.entity';
import { StageStatus } from '../workflow/workflow.enums';
import { daysBetween } from './reminders.utils';

function minutesOfDay(value: string): number {
  const [hours, minutes] = value.split(':');
  return Number(hours) * 60 + Number(minutes);
}

export function isQuiet(now: Date, from: string, to: string): boolean {
  const current = now.getHours() * 60 + now.getMinutes();
  const start = minutesOfDay(from);
  const end = minutesOfDay(to);
  if (start <= end) return current >= start && current < end;
  return current >= start || current < end;
}

export function isoWeek(value: Date): string {
  return `${getISOWeekYear(value)}-W${getISOWeek(value)}`;
}

const formatDate = (value: Date | null): string =>
  value ? format(value, 'd MMMM, HH:mm', { locale: uk }) : '';

const vacancyLink = (appUrl: string, stage: WorkflowStage): string =>
  `${appUrl}/vacancies/${stage.workflow.vacancyId}`;

export function stageHtml(stage: WorkflowStage, appUrl: string): string {
  return `<p>${escapeHtml(stage.name)} — ${formatDate(stage.scheduledAt)}.</p><p><a href="${vacancyLink(appUrl, stage)}">Відкрити вакансію</a></p>`;
}

export function digestHtml(
  stages: WorkflowStage[],
  now: Date,
  appUrl: string
): string {
  const upcoming = stages
    .filter(
      (stage) => stage.scheduledAt && daysBetween(now, stage.scheduledAt) >= 0
    )
    .sort(
      (left, right) =>
        (left.scheduledAt?.getTime() ?? 0) - (right.scheduledAt?.getTime() ?? 0)
    );
  const waiting = stages.filter(
    (stage) => stage.status === StageStatus.AWAITING_RESULT
  );
  const rows = upcoming
    .slice(0, DIGEST_MAX_ITEMS)
    .map(
      (stage) =>
        `<li>${escapeHtml(stage.name)} — ${formatDate(stage.scheduledAt)}</li>`
    )
    .join('');
  const hidden = upcoming.length - DIGEST_MAX_ITEMS;
  return [
    `<p>Попереду ${upcoming.length} подій, чекають на результат ${waiting.length}.</p>`,
    rows ? `<ul>${rows}</ul>` : '',
    hidden > 0 ? `<p>…і ще ${hidden}.</p>` : '',
    `<p><a href="${appUrl}/calendar">Відкрити календар</a></p>`
  ].join('');
}
