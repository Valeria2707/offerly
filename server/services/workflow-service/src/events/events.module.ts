import { Module } from '@nestjs/common';
import { WorkflowModule } from '../workflow/workflow.module';
import { VacancyEventsConsumer } from './vacancy-events.consumer';

@Module({ imports: [WorkflowModule], providers: [VacancyEventsConsumer] })
export class EventsModule {}
