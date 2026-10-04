import {
  Injectable,
  ServiceUnavailableException,
  UnprocessableEntityException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isOpenAiResponse, isRecord } from '@offerly/helpers';
import { parsePreparation } from '../output/preparation-output.parser';
import { PREPARATION_OUTPUT_SCHEMAS } from '../output/preparation-output.schema';
import {
  OPENAI_RESPONSES_URL,
  OPENAI_SCHEMA_NAME,
  OPENAI_TIMEOUT_MS
} from '../preparation.constants';
import { PreparationType } from '../preparation.enums';
import { PreparationContext, PreparationData } from '../preparation.types';
import { BASE_INSTRUCTIONS } from '../prompts/preparation-prompts.constants';

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
    if (!this.apiKey || !this.model)
      throw new ServiceUnavailableException('Preparation AI is not configured');
    let response: Response;
    try {
      response = await fetch(OPENAI_RESPONSES_URL, {
        method: 'POST',
        signal: AbortSignal.timeout(OPENAI_TIMEOUT_MS),
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          store: false,
          instructions: `${BASE_INSTRUCTIONS}\n\n${stageInstructions}`,
          input: JSON.stringify(context),
          text: {
            format: {
              type: 'json_schema',
              name: OPENAI_SCHEMA_NAME,
              strict: true,
              schema: PREPARATION_OUTPUT_SCHEMAS[type]
            }
          }
        })
      });
    } catch {
      throw new ServiceUnavailableException('Preparation AI unavailable');
    }
    if (!response.ok)
      throw new ServiceUnavailableException('Preparation AI rejected request');
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new UnprocessableEntityException('Unreadable preparation response');
    }
    if (!isOpenAiResponse(payload))
      throw new UnprocessableEntityException('Invalid preparation response');
    const output = payload.output
      ?.flatMap((item) => item.content ?? [])
      .filter((item) => item.type === 'output_text')
      .map((item) => item.text ?? '')
      .join('');
    let content: unknown;
    try {
      content = JSON.parse(output ?? '');
    } catch {
      throw new UnprocessableEntityException('Invalid preparation result');
    }
    if (type === PreparationType.CUSTOM && isRecord(content))
      content = { ...content, instructions: context.instructions };
    return parsePreparation(type, content);
  }
}
