import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { format, getDay, getISOWeek, getISOWeekYear } from 'date-fns';
import { uk } from 'date-fns/locale';
import { randomUUID } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import { OutboxEvent } from '../outbox/entities/outbox-event.entity';
import { REMINDER_DUE_TOPIC } from '../outbox/outbox.constants';
import { daysBetween } from '../utils/reminders.utils';
import { WorkflowStage } from '../workflow/entities/workflow-stage.entity';
import { StageStatus } from '../workflow/workflow.enums';
import { CalendarService } from './calendar.service';
import { MONDAY, REMINDER_TICK_MS } from './calendar.constants';
import { ReminderKind } from './calendar.enums';
import { ReminderSettings } from './entities/reminder-settings.entity';
import { SentReminder } from './entities/sent-reminder.entity';

function minutesOfDay(value: string): number {
  const [hours, minutes] = value.split(':');
  return Number(hours) * 60 + Number(minutes);
}

export function isQuiet(now: Date, from: string, to: string): boolean {
  const current = now.getHours() * 60 + now.getMinutes();
  const start = minutesOfDay(from);
  const end = minutesOfDay(to);
  return start <= end
    ? current >= start && current < end
    : current >= start || current < end;
}

function isoWeek(value: Date): string {
  return `${getISOWeekYear(value)}-W${getISOWeek(value)}`;
}

function formatDate(value: Date): string {
  return format(value, 'd MMMM, HH:mm', { locale: uk });
}

@Injectable()
export class ReminderPublisherService implements OnModuleInit, OnModuleDestroy {
  logger = new Logger(ReminderPublisherService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(ReminderSettings)
    readonly settings: Repository<ReminderSettings>,
    @InjectRepository(SentReminder)
    readonly sent: Repository<SentReminder>,
    readonly calendar: CalendarService,
    readonly dataSource: DataSource
  ) {}

  onModuleInit(): void {
    void this.tick();
    this.timer = setInterval(() => void this.tick(), REMINDER_TICK_MS);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async tick(): Promise<void> {
    const now = new Date();
    const recipients = await this.settings.findBy({ emailEnabled: true });
    for (const settings of recipients) {
      if (isQuiet(now, settings.quietFrom, settings.quietTo)) continue;
      try {
        await this.notify(settings, now);
      } catch (error) {
        this.logger.error(
          `Failed to queue reminders for user ${settings.userId}`,
          error instanceof Error ? error.stack : undefined
        );
      }
    }
  }

  private async notify(settings: ReminderSettings, now: Date): Promise<void> {
    const stages = await this.calendar.openStages(settings.userId);
    if (settings.beforeInterview)
      for (const stage of stages) {
        if (!stage.scheduledAt) continue;
        if (daysBetween(now, stage.scheduledAt) !== 1) continue;
        await this.queueOnce(
          settings.userId,
          ReminderKind.INTERVIEW_TOMORROW,
          stage.id,
          `Завтра: ${stage.name}`,
          this.stageHtml(stage)
        );
      }
    if (settings.weeklyDigest && getDay(now) === MONDAY)
      await this.queueOnce(
        settings.userId,
        ReminderKind.WEEKLY_DIGEST,
        isoWeek(now),
        'Тиждень у пошуку роботи',
        this.digestHtml(stages, now)
      );
  }

  private async queueOnce(
    userId: string,
    kind: ReminderKind,
    subjectId: string,
    title: string,
    body: string
  ): Promise<void> {
    if (await this.sent.existsBy({ userId, kind, subjectId })) return;
    await this.dataSource.transaction(async (manager) => {
      await manager.save(
        SentReminder,
        manager.create(SentReminder, { userId, kind, subjectId })
      );
      await manager.save(
        OutboxEvent,
        manager.create(OutboxEvent, {
          aggregateId: userId,
          eventType: REMINDER_DUE_TOPIC,
          payload: {
            eventId: randomUUID(),
            eventType: REMINDER_DUE_TOPIC,
            occurredAt: new Date().toISOString(),
            producer: 'workflow-service',
            data: { userId, kind, subjectId, title, body }
          },
          publishedAt: null,
          attempts: 0
        })
      );
    });
  }

  private link(stage: WorkflowStage): string {
    return `${this.calendar.appUrl}/vacancies/${stage.workflow.vacancyId}`;
  }

  private stageHtml(stage: WorkflowStage): string {
    const when = stage.scheduledAt ? formatDate(stage.scheduledAt) : '';
    return `<p>${stage.name} — ${when}.</p><p><a href="${this.link(stage)}">Відкрити вакансію</a></p>`;
  }

  private digestHtml(stages: WorkflowStage[], now: Date): string {
    const upcoming = stages
      .filter(
        (stage) => stage.scheduledAt && daysBetween(now, stage.scheduledAt) >= 0
      )
      .sort(
        (left, right) =>
          (left.scheduledAt?.getTime() ?? 0) -
          (right.scheduledAt?.getTime() ?? 0)
      );
    const waiting = stages.filter(
      (stage) => stage.status === StageStatus.AWAITING_RESULT
    );
    const rows = upcoming
      .map(
        (stage) =>
          `<li>${stage.name} — ${stage.scheduledAt ? formatDate(stage.scheduledAt) : ''}</li>`
      )
      .join('');
    return [
      `<p>Попереду ${upcoming.length} подій, чекають на результат ${waiting.length}.</p>`,
      rows ? `<ul>${rows}</ul>` : '',
      `<p><a href="${this.calendar.appUrl}/calendar">Відкрити календар</a></p>`
    ].join('');
  }
}
