import { BadRequestException, Injectable } from '@nestjs/common';
import { StageType } from '../../stage-type/entities/stage-type.entity';
import { StageCategory } from '../../workflow/workflow.enums';
import {
  CV_STAGE_CODE,
  NO_PREPARATION_CODES,
  TECHNICAL_SCREENING_CODES
} from '../preparation.constants';
import { PreparationType } from '../preparation.enums';
import { PreparationStrategy } from '../preparation.types';
import { CustomPreparationStrategy } from './custom-preparation.strategy';
import { CvPreparationStrategy } from './cv-preparation.strategy';
import { HrPreparationStrategy } from './hr-preparation.strategy';
import { TechnicalPreparationStrategy } from './technical-preparation.strategy';

@Injectable()
export class PreparationStrategyFactory {
  constructor(
    private readonly cv: CvPreparationStrategy,
    private readonly hr: HrPreparationStrategy,
    private readonly tech: TechnicalPreparationStrategy,
    private readonly custom: CustomPreparationStrategy
  ) {}
  resolveType(
    stageType: StageType,
    override?: PreparationType
  ): PreparationType {
    if (stageType.ownerUserId) return override ?? PreparationType.CUSTOM;
    if (stageType.code && NO_PREPARATION_CODES.has(stageType.code))
      throw new BadRequestException('This stage does not need preparation');
    if (override)
      throw new BadRequestException(
        'Format overrides are only supported for personal stage types'
      );
    if (stageType.code === CV_STAGE_CODE)
      return PreparationType.CV_COVER_LETTER;
    if (
      (stageType.code && TECHNICAL_SCREENING_CODES.has(stageType.code)) ||
      stageType.category === StageCategory.TECHNICAL
    )
      return PreparationType.TECHNICAL;
    if (
      stageType.category === StageCategory.SCREENING ||
      stageType.category === StageCategory.BEHAVIORAL
    )
      return PreparationType.HR_SCREENING;
    return PreparationType.CUSTOM;
  }
  getStrategy(type: PreparationType): PreparationStrategy {
    switch (type) {
      case PreparationType.CV_COVER_LETTER:
        return this.cv;
      case PreparationType.HR_SCREENING:
        return this.hr;
      case PreparationType.TECHNICAL:
        return this.tech;
      case PreparationType.CUSTOM:
        return this.custom;
      default:
        throw new BadRequestException('Unknown preparation type');
    }
  }
}
