import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Kafka, Producer } from 'kafkajs';
import { IsNull, LessThan, Repository } from 'typeorm';
import { OutboxEvent } from './outbox-event.entity';
import {
  OUTBOX_BATCH_SIZE,
  OUTBOX_CLIENT_ID,
  OUTBOX_MAX_ATTEMPTS,
  OUTBOX_POLL_MS
} from './outbox.constants';

@Injectable()
export class OutboxPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisherService.name);
  private readonly producer: Producer;
  private readonly events: Repository<OutboxEvent>;
  private timer?: NodeJS.Timeout;
  private publishing = false;

  constructor(
    config: ConfigService,
    @InjectRepository(OutboxEvent)
    eventsRepository: Repository<OutboxEvent>,
    @Inject(OUTBOX_CLIENT_ID) clientId: string
  ) {
    this.events = eventsRepository;
    this.producer = new Kafka({
      clientId,
      brokers: config.getOrThrow<string>('KAFKA_BROKERS').split(',')
    }).producer();
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
    this.timer = setInterval(() => void this.publishPending(), OUTBOX_POLL_MS);
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
        where: {
          publishedAt: IsNull(),
          attempts: LessThan(OUTBOX_MAX_ATTEMPTS)
        },
        order: { createdAt: 'ASC' },
        take: OUTBOX_BATCH_SIZE
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
