import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxEvent } from '../outbox/entities/outbox-event.entity';
import { WorkflowStage } from '../workflow/entities/workflow-stage.entity';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { ReminderSettings } from './entities/reminder-settings.entity';
import { SentReminder } from './entities/sent-reminder.entity';
import { ReminderPublisherService } from './reminder-publisher.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkflowStage,
      ReminderSettings,
      SentReminder,
      OutboxEvent
    ])
  ],
  controllers: [CalendarController],
  providers: [CalendarService, ReminderPublisherService]
})
export class CalendarModule {}
