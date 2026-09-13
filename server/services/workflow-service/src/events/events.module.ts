import { Module } from '@nestjs/common';
import { WorkflowModule } from '../workflow/workflow.module';
import { VacancyCreatedConsumer } from './vacancy-created.consumer';
@Module({ imports: [WorkflowModule], providers: [VacancyCreatedConsumer] })
export class EventsModule {}
