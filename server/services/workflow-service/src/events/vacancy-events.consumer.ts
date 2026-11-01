import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KAFKA_TOPICS } from '@offerly/helpers';
import { Consumer, Kafka } from 'kafkajs';
import { SERVICE_NAME } from '../app.constants';
import { WorkflowService } from '../workflow/workflow.service';
import { WORKFLOW_CONSUMER_GROUP } from './events.constants';
import {
  parseVacancyCreatedEvent,
  parseVacancyDeletedEvent
} from './vacancy-created.event';

@Injectable()
export class VacancyEventsConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(VacancyEventsConsumer.name);
  private readonly consumer: Consumer;

  constructor(
    config: ConfigService,
    private readonly workflows: WorkflowService
  ) {
    this.consumer = new Kafka({
      clientId: SERVICE_NAME,
      brokers: config.getOrThrow<string>('KAFKA_BROKERS').split(',')
    }).consumer({ groupId: WORKFLOW_CONSUMER_GROUP });
  }

  async onModuleInit(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: [KAFKA_TOPICS.VACANCY_CREATED, KAFKA_TOPICS.VACANCY_DELETED],
      fromBeginning: true
    });
    await this.consumer.run({
      eachMessage: ({ topic, message }) => this.handle(topic, message.value)
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer.disconnect();
  }

  private async handle(topic: string, raw: Buffer | null): Promise<void> {
    if (!raw) return;
    let value: unknown;
    try {
      value = JSON.parse(raw.toString());
    } catch {
      this.logger.warn(`Ignored malformed ${topic} event JSON`);
      return;
    }
    if (topic === KAFKA_TOPICS.VACANCY_DELETED) {
      const deleted = await parseVacancyDeletedEvent(value);
      if (!deleted) return this.logger.warn(`Ignored invalid ${topic} event`);
      await this.workflows.removeByVacancy(
        deleted.data.vacancyId,
        deleted.data.userId
      );
      return;
    }
    const created = await parseVacancyCreatedEvent(value);
    if (!created) return this.logger.warn(`Ignored invalid ${topic} event`);
    await this.workflows.createDefault(
      created.data.vacancyId,
      created.data.userId
    );
  }
}
