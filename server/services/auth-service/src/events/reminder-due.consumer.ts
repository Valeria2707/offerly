import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Consumer, Kafka } from 'kafkajs';
import { Repository } from 'typeorm';
import { MailService } from '../auth/mail.service';
import { UsersService } from '../auth/users.service';
import { SentNotification } from './entities/sent-notification.entity';
import { AUTH_CONSUMER_GROUP, REMINDER_DUE_TOPIC } from './events.constants';
import { parseReminderDueEvent } from './reminder-due.event';

@Injectable()
export class ReminderDueConsumer implements OnModuleInit, OnModuleDestroy {
  logger = new Logger(ReminderDueConsumer.name);
  consumer: Consumer;

  constructor(
    config: ConfigService,
    @InjectRepository(SentNotification)
    readonly sent: Repository<SentNotification>,
    readonly users: UsersService,
    readonly mail: MailService
  ) {
    this.consumer = new Kafka({
      clientId: 'auth-service',
      brokers: config.getOrThrow<string>('KAFKA_BROKERS').split(',')
    }).consumer({ groupId: AUTH_CONSUMER_GROUP });
  }

  async onModuleInit(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: REMINDER_DUE_TOPIC,
      fromBeginning: true
    });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        let parsed: unknown;
        try {
          parsed = JSON.parse(message.value.toString());
        } catch {
          this.logger.warn('Ignored malformed reminder event JSON');
          return;
        }
        const event = await parseReminderDueEvent(parsed);
        if (!event) {
          this.logger.warn('Ignored invalid reminder event');
          return;
        }
        await this.deliver(event.eventId, event.data);
      }
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer.disconnect();
  }

  private async deliver(
    eventId: string,
    data: { userId: string; title: string; body: string }
  ): Promise<void> {
    if (await this.sent.existsBy({ eventId })) return;
    const user = await this.users.findById(data.userId);
    if (!user) {
      this.logger.warn(`Reminder for unknown user ${data.userId}`);
      return;
    }
    await this.mail.send(user.email, data.title, data.body);
    await this.sent.save(
      this.sent.create({ eventId, eventType: REMINDER_DUE_TOPIC })
    );
  }
}
