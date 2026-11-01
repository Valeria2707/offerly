import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createIntegrationEvent, KAFKA_TOPICS } from '@offerly/helpers';
import { OutboxEvent } from '@offerly/nest-common';
import { getDay } from 'date-fns';
import { DataSource, Repository } from 'typeorm';
import { SERVICE_NAME } from '../app.constants';
import {
  digestHtml,
  isoWeek,
  isQuiet,
  stageHtml
} from '../utils/reminder-email.utils';
import { daysBetween } from '../utils/reminders.utils';
import { CalendarService } from './calendar.service';
import { MONDAY, REMINDER_TICK_MS } from './calendar.constants';
import { ReminderKind } from './calendar.enums';
import { ReminderSettings } from './entities/reminder-settings.entity';
import { SentReminder } from './entities/sent-reminder.entity';

@Injectable()
export class ReminderPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReminderPublisherService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(ReminderSettings)
    private readonly settings: Repository<ReminderSettings>,
    @InjectRepository(SentReminder)
    private readonly sent: Repository<SentReminder>,
    private readonly calendar: CalendarService,
    private readonly dataSource: DataSource
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
    let recipients: ReminderSettings[];
    try {
      recipients = await this.settings.findBy({ emailEnabled: true });
    } catch (error) {
      this.logger.error(
        'Failed to load reminder recipients',
        error instanceof Error ? error.stack : undefined
      );
      return;
    }
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
          stageHtml(stage, this.calendar.appUrl)
        );
      }
    if (settings.weeklyDigest && getDay(now) === MONDAY)
      await this.queueOnce(
        settings.userId,
        ReminderKind.WEEKLY_DIGEST,
        isoWeek(now),
        'Тиждень у пошуку роботи',
        digestHtml(stages, now, this.calendar.appUrl)
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
          eventType: KAFKA_TOPICS.REMINDER_DUE,
          payload: createIntegrationEvent(
            KAFKA_TOPICS.REMINDER_DUE,
            SERVICE_NAME,
            { userId, kind, subjectId, title, body }
          ),
          publishedAt: null,
          attempts: 0
        })
      );
    });
  }
}
