import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isRecord } from '@offerly/helpers';
import { parsePreparation } from '../output/preparation-output.parser';
import { PREPARATION_OUTPUT_SCHEMAS } from '../output/preparation-output.schema';
import { OPENAI_SCHEMA_NAME } from '../preparation.constants';
import { PreparationType } from '../preparation.enums';
import { PreparationContext, PreparationData } from '../preparation.types';
import {
  BASE_INSTRUCTIONS,
  LANGUAGE_INSTRUCTIONS
} from '../prompts/preparation-prompts.constants';
import { requestStructuredOutput } from './openai-structured-output';

@Injectable()
export class PreparationGeneratorService {
  private readonly apiKey: string;
  private readonly model: string;
  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('OPENAI_API_KEY', '');
    this.model = config.get<string>('OPENAI_MODEL', '');
  }
  async generate(
    type: PreparationType,
    stageInstructions: string,
    context: PreparationContext
  ): Promise<PreparationData> {
    let content = await requestStructuredOutput({
      apiKey: this.apiKey,
      model: this.model,
      instructions: [
        BASE_INSTRUCTIONS,
        stageInstructions,
        context.language ? LANGUAGE_INSTRUCTIONS[context.language] : ''
      ]
        .filter(Boolean)
        .join('\n\n'),
      input: JSON.stringify(context),
      schemaName: OPENAI_SCHEMA_NAME,
      schema: PREPARATION_OUTPUT_SCHEMAS[type],
      label: 'preparation'
    });
    if (type === PreparationType.CUSTOM && isRecord(content))
      content = { ...content, instructions: context.instructions };
    return parsePreparation(type, content);
  }
}
