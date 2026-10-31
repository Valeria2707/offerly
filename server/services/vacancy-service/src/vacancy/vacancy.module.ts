import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportModule } from '../import/import.module';
import { Vacancy } from './entities/vacancy.entity';
import { VacancyImport } from './entities/vacancy-import.entity';
import { VacancyController } from './vacancy.controller';
import { VacancyRepository } from './vacancy.repository';
import { VacancyService } from './vacancy.service';
import { OutboxEvent } from '../outbox/entities/outbox-event.entity';
import { AiOperation } from '../ai-log/ai-operation.entity';
import { AiLogService } from '../ai-log/ai-log.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vacancy,
      VacancyImport,
      OutboxEvent,
      AiOperation
    ]),
    ImportModule
  ],
  controllers: [VacancyController],
  providers: [VacancyRepository, VacancyService, AiLogService]
})
export class VacancyModule {}
