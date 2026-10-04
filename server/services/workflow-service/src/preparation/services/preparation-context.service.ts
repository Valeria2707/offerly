import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isRecord } from '@offerly/helpers';
import {
  CONTEXT_TIMEOUT_MS,
  DEFAULT_PROFILE_SERVICE_URL,
  DEFAULT_VACANCY_SERVICE_URL,
  PROFILE_BASICS_CONTEXT_FIELDS,
  PROFILE_CONTEXT_FIELDS,
  PROFILE_PATH,
  VACANCY_CONTEXT_FIELDS,
  VACANCY_PATH
} from '../preparation.constants';
import { PreparationContext } from '../preparation.types';
import { pickFields, toServiceBaseUrl } from '../../utils/preparation.utils';

@Injectable()
export class PreparationContextService {
  private readonly vacancyUrl: string;
  private readonly profileUrl: string;
  constructor(config: ConfigService) {
    this.vacancyUrl = toServiceBaseUrl(
      config.get<string>('VACANCY_SERVICE_URL', DEFAULT_VACANCY_SERVICE_URL)
    );
    this.profileUrl = toServiceBaseUrl(
      config.get<string>('PROFILE_SERVICE_URL', DEFAULT_PROFILE_SERVICE_URL)
    );
  }
  async load(
    vacancyId: string,
    authorization: string
  ): Promise<Pick<PreparationContext, 'vacancy' | 'profile'>> {
    const [vacancy, profile] = await Promise.all([
      this.read(`${this.vacancyUrl}${VACANCY_PATH(vacancyId)}`, authorization),
      this.read(`${this.profileUrl}${PROFILE_PATH}`, authorization)
    ]);
    if (!isRecord(profile.data))
      throw new ServiceUnavailableException('Invalid profile context');
    const data = profile.data;
    const basics = isRecord(data.basics) ? data.basics : {};
    return {
      vacancy: pickFields(vacancy, VACANCY_CONTEXT_FIELDS),
      profile: {
        ...pickFields(data, PROFILE_CONTEXT_FIELDS),
        basics: pickFields(basics, PROFILE_BASICS_CONTEXT_FIELDS)
      }
    };
  }
  private async read(
    url: string,
    authorization: string
  ): Promise<Record<string, unknown>> {
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Authorization: authorization },
        redirect: 'error',
        signal: AbortSignal.timeout(CONTEXT_TIMEOUT_MS)
      });
    } catch {
      throw new ServiceUnavailableException(
        'Preparation context service unavailable'
      );
    }
    if (response.status === 401) throw new UnauthorizedException();
    if (response.status === 403 || response.status === 404)
      throw new NotFoundException('Preparation context not found');
    if (!response.ok)
      throw new ServiceUnavailableException(
        'Preparation context service unavailable'
      );
    try {
      const value: unknown = await response.json();
      if (isRecord(value)) return value;
    } catch {
      /* Map invalid upstream responses below. */
    }
    throw new ServiceUnavailableException('Invalid preparation context');
  }
}
