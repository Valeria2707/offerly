import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AuditProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AuditProducerService.name);
  private readonly producer: Producer;

  constructor(config: ConfigService) {
    const brokers = config.getOrThrow<string>('KAFKA_BROKERS').split(',');
    this.producer = new Kafka({ clientId: 'auth-service', brokers }).producer();
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
  }

  async publish(topic: string, userId: string): Promise<void> {
    const event = {
      eventId: randomUUID(),
      eventType: topic,
      occurredAt: new Date().toISOString(),
      producer: 'auth-service',
      data: { userId }
    };
    try {
      await this.producer.send({ topic, messages: [{ key: userId, value: JSON.stringify(event) }] });
    } catch (error: unknown) {
      this.logger.error(`Failed to publish ${topic}`, error instanceof Error ? error.stack : undefined);
    }
  }
}
