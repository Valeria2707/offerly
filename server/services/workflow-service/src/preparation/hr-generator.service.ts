import {
  Injectable,
  ServiceUnavailableException,
  UnprocessableEntityException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isOpenAiResponse, isRecord } from '@offerly/helpers';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { HrDocumentsDto } from './dto/preparation.dto';
import {
  AI_RESPONSES_URL,
  AI_TIMEOUT_MS,
  HR_DOCUMENTS_SCHEMA,
  HR_PREPARATION_INSTRUCTIONS
} from './preparation.constants';
import {
  HrDocuments,
  PreparationRevision,
  PreparationSources
} from './preparation.types';

@Injectable()
export class HrGeneratorService {
  apiKey: string;
  model: string;
  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('OPENAI_API_KEY', '');
    this.model = config.get<string>('OPENAI_MODEL', '');
  }

  async generate(
    sources: PreparationSources,
    revision?: PreparationRevision
  ): Promise<HrDocuments> {
    if (!this.apiKey || !this.model)
      throw new ServiceUnavailableException(
        'HR AI generation is not configured'
      );
    let payload: unknown;
    try {
      const response = await fetch(AI_RESPONSES_URL, {
        method: 'POST',
        signal: AbortSignal.timeout(AI_TIMEOUT_MS),
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          store: false,
          instructions: HR_PREPARATION_INSTRUCTIONS,
          input: JSON.stringify({ sources, revision: revision ?? null }),
          text: {
            format: {
              type: 'json_schema',
              name: 'hr_documents',
              strict: true,
              schema: HR_DOCUMENTS_SCHEMA
            }
          }
        })
      });
      if (!response.ok) throw new Error('Provider rejected request');
      payload = await response.json();
    } catch {
      throw new ServiceUnavailableException('HR AI provider is unavailable');
    }
    if (!isOpenAiResponse(payload))
      throw new UnprocessableEntityException('Invalid AI response');
    const output = payload.output
      ?.flatMap((item) => item.content ?? [])
      .find((item) => item.type === 'output_text')?.text;
    if (!output)
      throw new UnprocessableEntityException('AI returned no documents');
    let parsed: unknown;
    try {
      parsed = JSON.parse(output);
    } catch {
      throw new UnprocessableEntityException('AI returned invalid JSON');
    }
    if (!isRecord(parsed))
      throw new UnprocessableEntityException('AI returned invalid documents');
    const documents = plainToInstance(HrDocumentsDto, parsed);
    if (
      validateSync(documents, { whitelist: true, forbidNonWhitelisted: true })
        .length
    )
      throw new UnprocessableEntityException('AI returned invalid documents');
    return { cv: documents.cv, coverLetter: documents.coverLetter };
  }
}
