import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka } from 'kafkajs';
import { WorkflowService } from '../workflow/workflow.service';
import {
  VACANCY_CREATED_TOPIC,
  WORKFLOW_CONSUMER_GROUP
} from './events.constants';
import { parseVacancyCreatedEvent } from './vacancy-created.event';

@Injectable()
export class VacancyCreatedConsumer implements OnModuleInit, OnModuleDestroy {
  logger = new Logger(VacancyCreatedConsumer.name);
  consumer: Consumer;

  constructor(
    config: ConfigService,
    readonly workflows: WorkflowService
  ) {
    this.consumer = new Kafka({
      clientId: 'workflow-service',
      brokers: config.getOrThrow<string>('KAFKA_BROKERS').split(',')
    }).consumer({ groupId: WORKFLOW_CONSUMER_GROUP });
  }

  async onModuleInit(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: VACANCY_CREATED_TOPIC,
      fromBeginning: true
    });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        let parsed: unknown;
        try {
          parsed = JSON.parse(message.value.toString());
        } catch {
          this.logger.warn('Ignored malformed vacancy event JSON');
          return;
        }
        const event = await parseVacancyCreatedEvent(parsed);
        if (!event) {
          this.logger.warn('Ignored invalid vacancy event');
          return;
        }
        await this.workflows.createDefault(
          event.data.vacancyId,
          event.data.userId
        );
      }
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer.disconnect();
  }
}
