import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Kafka, Producer } from 'kafkajs';
import { IsNull, Repository } from 'typeorm';
import { OutboxEvent } from './entities/outbox-event.entity';

@Injectable()
export class OutboxPublisherService implements OnModuleInit, OnModuleDestroy {
  logger = new Logger(OutboxPublisherService.name);
  producer: Producer;
  events: Repository<OutboxEvent>;
  timer?: NodeJS.Timeout;
  publishing = false;

  constructor(
    config: ConfigService,
    @InjectRepository(OutboxEvent)
    eventsRepository: Repository<OutboxEvent>
  ) {
    this.events = eventsRepository;
    this.producer = new Kafka({
      clientId: 'vacancy-service',
      brokers: config.getOrThrow<string>('KAFKA_BROKERS').split(',')
    }).producer();
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
    this.timer = setInterval(() => void this.publishPending(), 1_000);
    await this.publishPending();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    await this.producer.disconnect();
  }

  async publishPending(): Promise<void> {
    if (this.publishing) return;
    this.publishing = true;
    try {
      const pending = await this.events.find({
        where: { publishedAt: IsNull() },
        order: { createdAt: 'ASC' },
        take: 50
      });
      for (const event of pending) {
        try {
          await this.producer.send({
            topic: event.eventType,
            messages: [
              { key: event.aggregateId, value: JSON.stringify(event.payload) }
            ]
          });
          event.publishedAt = new Date();
        } catch (error: unknown) {
          event.attempts += 1;
          this.logger.error(
            `Failed to publish outbox event ${event.id}`,
            error instanceof Error ? error.stack : undefined
          );
        }
        await this.events.save(event);
      }
    } finally {
      this.publishing = false;
    }
  }
}
