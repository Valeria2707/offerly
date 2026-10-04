import { Injectable } from '@nestjs/common';
import { PreparationType } from '../preparation.enums';
import {
  PreparationContext,
  PreparationData,
  PreparationStrategy
} from '../preparation.types';
import { customPrompt } from '../prompts/preparation-prompts';
import { PreparationGeneratorService } from '../services/preparation-generator.service';

@Injectable()
export class CustomPreparationStrategy implements PreparationStrategy {
  constructor(private readonly generator: PreparationGeneratorService) {}
  generate(context: PreparationContext): Promise<PreparationData> {
    return this.generator.generate(
      PreparationType.CUSTOM,
      customPrompt(context),
      context
    );
  }
}
