import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowModule } from '../workflow/workflow.module';
import { StagePreparationData } from './entities/stage-preparation.entity';
import { PreparationController } from './preparation.controller';
import { PreparationService } from './preparation.service';
import { PreparationContextService } from './services/preparation-context.service';
import { PreparationGeneratorService } from './services/preparation-generator.service';
import { CustomPreparationStrategy } from './strategies/custom-preparation.strategy';
import { CvPreparationStrategy } from './strategies/cv-preparation.strategy';
import { HrPreparationStrategy } from './strategies/hr-preparation.strategy';
import { PreparationStrategyFactory } from './strategies/preparation-strategy.factory';
import { TechnicalPreparationStrategy } from './strategies/technical-preparation.strategy';
@Module({
  imports: [WorkflowModule, TypeOrmModule.forFeature([StagePreparationData])],
  controllers: [PreparationController],
  providers: [
    PreparationService,
    PreparationContextService,
    PreparationGeneratorService,
    CvPreparationStrategy,
    HrPreparationStrategy,
    TechnicalPreparationStrategy,
    CustomPreparationStrategy,
    PreparationStrategyFactory
  ]
})
export class PreparationModule {}
