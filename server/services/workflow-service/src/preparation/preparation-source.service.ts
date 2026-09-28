import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
  UnprocessableEntityException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isRecord } from '@offerly/helpers';
import {
  MAX_CONTEXT_CHARACTERS,
  SOURCE_TIMEOUT_MS
} from './preparation.constants';
import { PreparationSources } from './preparation.types';

@Injectable()
export class PreparationSourceService {
  profileUrl: string;
  vacancyUrl: string;

  constructor(config: ConfigService) {
    this.profileUrl = config.get<string>(
      'PROFILE_SERVICE_URL',
      'http://localhost:3002/api/v1/'
    );
    this.vacancyUrl = config.get<string>(
      'VACANCY_SERVICE_URL',
      'http://localhost:3003/api/v1/'
    );
    for (const base of [this.profileUrl, this.vacancyUrl]) {
      const url = new URL(base);
      if (
        !['http:', 'https:'].includes(url.protocol) ||
        url.username ||
        url.password
      )
        throw new Error(
          'Profile and vacancy service URLs must use HTTP(S) without credentials'
        );
    }
  }

  async load(
    vacancyId: string,
    authorization: string
  ): Promise<PreparationSources> {
    const [profile, vacancy] = await Promise.all([
      this.read(this.profileUrl, 'profile', authorization),
      this.read(this.vacancyUrl, `vacancies/${vacancyId}`, authorization)
    ]);
    if (!isRecord(profile.data) || !isRecord(profile.data.basics))
      throw new UnprocessableEntityException('Profile data is unavailable');
    const sections = [
      profile.data.experience,
      profile.data.projects,
      profile.data.skills
    ];
    if (
      !sections.some((section) => Array.isArray(section) && section.length > 0)
    )
      throw new UnprocessableEntityException(
        'Add CV experience, projects or skills to your profile first'
      );
    const sources = { profile: profile.data, vacancy };
    if (JSON.stringify(sources).length > MAX_CONTEXT_CHARACTERS)
      throw new UnprocessableEntityException(
        'Profile and vacancy exceed the AI processing limit'
      );
    return sources;
  }

  async read(
    base: string,
    path: string,
    authorization: string
  ): Promise<Record<string, unknown>> {
    let response: Response;
    try {
      response = await fetch(
        new URL(path, base.endsWith('/') ? base : `${base}/`),
        {
          headers: { Authorization: authorization },
          redirect: 'error',
          signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS)
        }
      );
    } catch {
      throw new ServiceUnavailableException(
        'Profile or vacancy service is unavailable'
      );
    }
    if (response.status === 401 || response.status === 403)
      throw new UnauthorizedException('Profile or vacancy access was denied');
    if (response.status === 404)
      throw new NotFoundException('Profile or vacancy not found');
    if (!response.ok)
      throw new ServiceUnavailableException(
        'Profile or vacancy service failed'
      );
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new ServiceUnavailableException(
        'Source service returned invalid JSON'
      );
    }
    if (!isRecord(data))
      throw new ServiceUnavailableException(
        'Source service returned invalid data'
      );
    return data;
  }
}
