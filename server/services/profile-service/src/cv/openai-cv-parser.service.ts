import { Injectable, Logger, ServiceUnavailableException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ProfileDataDto } from '../profile/dto/profile.dto';
import { ProfileData } from '../profile/profile.types';
import { toProfileData } from '../utils/profile.utils';
import { normalizeProfileUrls } from '../utils/url.utils';
import { getValidationPaths } from '../utils/validation.utils';
import { isOpenAiResponse } from '../utils/openai-response.utils';
import { CV_EXTRACTION_INSTRUCTIONS, OPENAI_REQUEST_TIMEOUT_MS, OPENAI_RESPONSES_URL } from './cv.constants';
import { cvProfileJsonSchema } from './cv-profile.schema';

@Injectable()
export class OpenAiCvParserService {
  private readonly logger = new Logger(OpenAiCvParserService.name);
  private readonly apiKey: string;
  readonly model: string;

  constructor(config: ConfigService) {
    this.apiKey = config.getOrThrow<string>('OPENAI_API_KEY');
    this.model = config.getOrThrow<string>('OPENAI_MODEL');
  }

  async parse(text: string): Promise<ProfileData> {
    if (!this.apiKey || !this.model) {
      throw new ServiceUnavailableException('CV AI parsing is not configured');
    }

    let response: Response;
    try {
      response = await fetch(OPENAI_RESPONSES_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          store: false,
          instructions: CV_EXTRACTION_INSTRUCTIONS,
          input: text,
          text: {
            format: {
              type: 'json_schema',
              name: 'cv_profile',
              strict: true,
              schema: cvProfileJsonSchema
            }
          }
        }),
        signal: AbortSignal.timeout(OPENAI_REQUEST_TIMEOUT_MS)
      });
    } catch {
      throw new ServiceUnavailableException('CV AI provider is unavailable');
    }

    if (!response.ok) {
      throw new ServiceUnavailableException('CV AI provider rejected the request');
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new ServiceUnavailableException('CV AI provider returned an unreadable response');
    }

    if (!isOpenAiResponse(payload)) {
      throw new UnprocessableEntityException('CV AI provider returned an invalid response');
    }

    const outputText = payload.output
      ?.flatMap((item) => item.content ?? [])
      .find((item) => item.type === 'output_text')
      ?.text;

    if (!outputText) throw new UnprocessableEntityException('CV AI provider returned no structured result');

    let parsed: unknown;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      throw new UnprocessableEntityException('CV AI provider returned an invalid structured result');
    }

    const validated = plainToInstance(ProfileDataDto, parsed);
    const errors = validateSync(validated, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length > 0) {
      this.logger.warn(`CV structured result failed validation at: ${getValidationPaths(errors).join(', ')}`);
      throw new UnprocessableEntityException('CV AI provider returned an invalid structured result');
    }
    const profileData = toProfileData(validated);
    normalizeProfileUrls(profileData);
    return profileData;
  }

}
