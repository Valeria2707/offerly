import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { SentNotification } from './entities/sent-notification.entity';
import { ReminderDueConsumer } from './reminder-due.consumer';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([SentNotification])],
  providers: [ReminderDueConsumer]
})
export class EventsModule {}
