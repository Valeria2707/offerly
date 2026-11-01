import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportModule } from '../import/import.module';
import { Vacancy } from './entities/vacancy.entity';
import { VacancyImport } from './entities/vacancy-import.entity';
import { VacancyController } from './vacancy.controller';
import { VacancyRepository } from './vacancy.repository';
import { VacancyService } from './vacancy.service';
import { AiLogModule, OutboxEvent } from '@offerly/nest-common';
@Module({
  imports: [
    TypeOrmModule.forFeature([Vacancy, VacancyImport, OutboxEvent]),
    ImportModule,
    AiLogModule
  ],
  controllers: [VacancyController],
  providers: [VacancyRepository, VacancyService]
})
export class VacancyModule {}
