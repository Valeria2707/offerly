import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createIntegrationEvent } from '@offerly/helpers';
import { Kafka, Producer } from 'kafkajs';
import { SERVICE_NAME } from '../app.constants';

@Injectable()
export class AuditProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AuditProducerService.name);
  private readonly producer: Producer;

  constructor(config: ConfigService) {
    const brokers = config.getOrThrow<string>('KAFKA_BROKERS').split(',');
    this.producer = new Kafka({ clientId: SERVICE_NAME, brokers }).producer();
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
  }

  async publish(topic: string, userId: string): Promise<void> {
    const event = createIntegrationEvent(topic, SERVICE_NAME, { userId });
    try {
      await this.producer.send({
        topic,
        messages: [{ key: userId, value: JSON.stringify(event) }]
      });
    } catch (error: unknown) {
      this.logger.error(
        `Failed to publish ${topic}`,
        error instanceof Error ? error.stack : undefined
      );
    }
  }
}
