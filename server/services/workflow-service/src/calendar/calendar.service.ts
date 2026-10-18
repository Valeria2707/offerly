import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import { Between, In, Not, Repository } from 'typeorm';
import { buildCalendar, IcsEvent } from '../utils/ics.utils';
import { buildReminders, isFinished } from '../utils/reminders.utils';
import { WorkflowStage } from '../workflow/entities/workflow-stage.entity';
import {
  CalendarEventDto,
  ReminderDto,
  ReminderSettingsDto,
  UpdateReminderSettingsDto
} from './dto/calendar.dto';
import {
  ALARM_MINUTES_BEFORE,
  CALENDAR_NAME,
  FINISHED_STATUSES,
  SUBSCRIPTION_MONTHS,
  TRAILING_SLASHES
} from './calendar.constants';
import { ReminderSettings } from './entities/reminder-settings.entity';

const OPEN_STATUSES = Not(In([...FINISHED_STATUSES]));

function toEvent(stage: WorkflowStage): CalendarEventDto {
  return {
    stageId: stage.id,
    workflowId: stage.workflowId,
    vacancyId: stage.workflow.vacancyId,
    name: stage.name,
    category: stage.category,
    status: stage.status,
    scheduledAt: stage.scheduledAt,
    deadlineAt: stage.deadlineAt
  };
}

@Injectable()
export class CalendarService {
  readonly appUrl: string;
  constructor(
    @InjectRepository(WorkflowStage)
    readonly stages: Repository<WorkflowStage>,
    @InjectRepository(ReminderSettings)
    readonly settingsRepository: Repository<ReminderSettings>,
    config: ConfigService
  ) {
    this.appUrl = config
      .get<string>('APP_BASE_URL', 'http://localhost:3001')
      .replace(TRAILING_SLASHES, '');
  }

  async events(
    userId: string,
    from: string,
    to: string
  ): Promise<CalendarEventDto[]> {
    const window = Between(new Date(from), new Date(to));
    const stages = await this.stages.find({
      where: [
        { workflow: { userId }, scheduledAt: window },
        { workflow: { userId }, deadlineAt: window }
      ],
      relations: { workflow: true },
      order: { scheduledAt: 'ASC', deadlineAt: 'ASC' }
    });
    return stages.map(toEvent);
  }

  async reminders(userId: string): Promise<ReminderDto[]> {
    const settings = await this.load(userId);
    const stages = await this.openStages(userId);
    return buildReminders(stages, new Date(), settings).map(
      ({ stage, kind, days }) => ({ ...toEvent(stage), kind, days })
    );
  }

  async settings(userId: string): Promise<ReminderSettingsDto> {
    return toSettings(await this.load(userId));
  }

  async update(
    userId: string,
    input: UpdateReminderSettingsDto
  ): Promise<ReminderSettingsDto> {
    const settings = await this.load(userId);
    await this.settingsRepository.save(Object.assign(settings, input));
    return toSettings(await this.load(userId));
  }

  async subscribe(userId: string): Promise<ReminderSettingsDto> {
    const settings = await this.load(userId);
    if (settings.calendarToken) return toSettings(settings);
    settings.calendarToken = randomBytes(24).toString('base64url');
    return toSettings(await this.settingsRepository.save(settings));
  }

  async calendarByToken(token: string): Promise<string> {
    const settings = await this.settingsRepository.findOneBy({
      calendarToken: token
    });
    if (!settings) throw new NotFoundException('Calendar not found');
    const now = new Date();
    const until = new Date(now);
    until.setMonth(until.getMonth() + SUBSCRIPTION_MONTHS);
    const stages = await this.stages.find({
      where: [
        {
          workflow: { userId: settings.userId },
          scheduledAt: Between(now, until)
        },
        {
          workflow: { userId: settings.userId },
          deadlineAt: Between(now, until)
        }
      ],
      relations: { workflow: true }
    });
    return buildCalendar(CALENDAR_NAME, this.toIcsEvents(stages), now);
  }

  async load(userId: string): Promise<ReminderSettings> {
    const existing = await this.settingsRepository.findOneBy({ userId });
    if (existing) return existing;
    await this.settingsRepository.insert({ userId });
    return this.settingsRepository.findOneByOrFail({ userId });
  }

  openStages(userId: string): Promise<WorkflowStage[]> {
    return this.stages.find({
      where: { workflow: { userId }, status: OPEN_STATUSES },
      relations: { workflow: true }
    });
  }

  private toIcsEvents(stages: WorkflowStage[]): IcsEvent[] {
    const events: IcsEvent[] = [];
    for (const stage of stages) {
      if (isFinished(stage)) continue;
      const url = `${this.appUrl}/vacancies/${stage.workflow.vacancyId}`;
      if (stage.scheduledAt)
        events.push({
          uid: `stage-${stage.id}@offerly`,
          summary: stage.name,
          url,
          start: stage.scheduledAt,
          alarmMinutesBefore: ALARM_MINUTES_BEFORE
        });
      if (stage.deadlineAt)
        events.push({
          uid: `deadline-${stage.id}@offerly`,
          summary: `Дедлайн: ${stage.name}`,
          url,
          start: stage.deadlineAt,
          allDay: true
        });
    }
    return events;
  }
}

function toSettings(settings: ReminderSettings): ReminderSettingsDto {
  return {
    emailEnabled: settings.emailEnabled,
    beforeInterview: settings.beforeInterview,
    afterStage: settings.afterStage,
    beforeDeadline: settings.beforeDeadline,
    silence: settings.silence,
    weeklyDigest: settings.weeklyDigest,
    quietFrom: settings.quietFrom,
    quietTo: settings.quietTo,
    calendarToken: settings.calendarToken
  };
}
