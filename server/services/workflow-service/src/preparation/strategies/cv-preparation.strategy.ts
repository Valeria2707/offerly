import { Injectable } from '@nestjs/common';
import { PreparationType } from '../preparation.enums';
import {
  PreparationContext,
  PreparationData,
  PreparationStrategy
} from '../preparation.types';
import { cvPrompt } from '../prompts/preparation-prompts';
import { PreparationGeneratorService } from '../services/preparation-generator.service';

@Injectable()
export class CvPreparationStrategy implements PreparationStrategy {
  constructor(private readonly generator: PreparationGeneratorService) {}
  generate(context: PreparationContext): Promise<PreparationData> {
    return this.generator.generate(
      PreparationType.CV_COVER_LETTER,
      cvPrompt(context),
      context
    );
  }
}
