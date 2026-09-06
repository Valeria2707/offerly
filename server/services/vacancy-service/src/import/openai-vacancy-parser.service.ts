import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnprocessableEntityException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { VacancyDraftDto } from '../vacancy/dto/vacancy.dto';
import { VacancyDraftData } from '../vacancy/vacancy.types';
import { isOpenAiResponse } from '../utils/type-guard.utils';
import { getValidationPaths } from '../utils/validation.utils';
import {
  OPENAI_RESPONSES_URL,
  OPENAI_TIMEOUT_MS,
  VACANCY_EXTRACTION_INSTRUCTIONS
} from './import.constants';
import { vacancyJsonSchema } from './vacancy.schema';

@Injectable()
export class OpenAiVacancyParserService {
  private readonly logger = new Logger(OpenAiVacancyParserService.name);
  private readonly apiKey: string;
  private readonly model: string;
  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('OPENAI_API_KEY', '');
    this.model = config.get<string>('OPENAI_MODEL', '');
  }
  async parse(
    content: string,
    sourceUrl: string | null
  ): Promise<VacancyDraftData> {
    if (!this.apiKey || !this.model)
      throw new ServiceUnavailableException(
        'Vacancy AI parsing is not configured'
      );
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
          instructions: VACANCY_EXTRACTION_INSTRUCTIONS,
          input: content,
          text: {
            format: {
              type: 'json_schema',
              name: 'vacancy',
              strict: true,
              schema: vacancyJsonSchema
            }
          }
        })
      });
    } catch {
      throw new ServiceUnavailableException(
        'Vacancy AI provider is unavailable'
      );
    }
    if (!response.ok)
      throw new ServiceUnavailableException(
        'Vacancy AI provider rejected the request'
      );
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new ServiceUnavailableException(
        'Vacancy AI provider returned an unreadable response'
      );
    }
    if (!isOpenAiResponse(payload))
      throw new UnprocessableEntityException(
        'Vacancy AI provider returned an invalid response'
      );
    const outputText = payload.output
      ?.flatMap((item) => item.content ?? [])
      .find((item) => item.type === 'output_text')?.text;
    if (!outputText)
      throw new UnprocessableEntityException(
        'Vacancy AI provider returned no structured result'
      );
    let parsed: unknown;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      throw new UnprocessableEntityException(
        'Vacancy AI provider returned an invalid structured result'
      );
    }
    const validated = plainToInstance(VacancyDraftDto, parsed);
    const errors = validateSync(validated, {
      whitelist: true,
      forbidNonWhitelisted: true
    });
    if (errors.length > 0) {
      this.logger.warn(
        `Vacancy result failed validation at: ${getValidationPaths(errors).join(', ')}`
      );
      throw new UnprocessableEntityException(
        'Vacancy AI provider returned an invalid structured result'
      );
    }
    return {
      title: validated.title,
      company: validated.company,
      location: validated.location ?? null,
      workFormat: validated.workFormat ?? null,
      employmentType: validated.employmentType ?? null,
      level: validated.level ?? null,
      salaryRange: validated.salaryRange ?? null,
      postedAt: validated.postedAt ?? null,
      description: validated.description ?? null,
      requiredSkills: validated.requiredSkills ?? [],
      preferredSkills: validated.preferredSkills ?? [],
      experienceRequirement: validated.experienceRequirement ?? null,
      educationRequirement: validated.educationRequirement ?? null,
      languageRequirements: validated.languageRequirements ?? [],
      sourceUrl
    };
  }
}
