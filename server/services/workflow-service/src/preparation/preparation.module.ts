import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StageType } from '../stage-type/entities/stage-type.entity';
import { WorkflowModule } from '../workflow/workflow.module';
import { StagePreparation } from './entities/stage-preparation.entity';
import { HrGeneratorService } from './hr-generator.service';
import { PreparationController } from './preparation.controller';
import { PreparationSourceService } from './preparation-source.service';
import { PreparationService } from './preparation.service';

@Module({
  imports: [
    WorkflowModule,
    TypeOrmModule.forFeature([StagePreparation, StageType])
  ],
  controllers: [PreparationController],
  providers: [PreparationService, PreparationSourceService, HrGeneratorService]
})
export class PreparationModule {}
