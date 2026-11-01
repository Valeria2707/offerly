import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxEvent } from './outbox-event.entity';
import { OutboxPublisherService } from './outbox-publisher.service';
import { OUTBOX_CLIENT_ID } from './outbox.constants';

@Module({})
export class OutboxModule {
  /** `clientId` is the Kafka client name, usually the service name. */
  static register(clientId: string): DynamicModule {
    return {
      module: OutboxModule,
      imports: [TypeOrmModule.forFeature([OutboxEvent])],
      providers: [
        { provide: OUTBOX_CLIENT_ID, useValue: clientId },
        OutboxPublisherService
      ]
    };
  }
}
