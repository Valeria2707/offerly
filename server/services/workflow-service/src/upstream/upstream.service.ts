import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { toServiceBaseUrl } from '../utils/upstream.utils';
import {
  PROFILE_PATH,
  UPSTREAM_TIMEOUT_MS,
  VACANCIES_PATH,
  vacancyPath
} from './upstream.constants';

@Injectable()
export class UpstreamService {
  private readonly vacancyUrl: string;
  private readonly profileUrl: string;

  constructor(config: ConfigService) {
    this.vacancyUrl = toServiceBaseUrl(
      config.getOrThrow<string>('VACANCY_SERVICE_URL')
    );
    this.profileUrl = toServiceBaseUrl(
      config.getOrThrow<string>('PROFILE_SERVICE_URL')
    );
  }

  vacancies(authorization: string): Promise<unknown> {
    return this.read(`${this.vacancyUrl}${VACANCIES_PATH}`, authorization);
  }

  vacancy(vacancyId: string, authorization: string): Promise<unknown> {
    return this.read(
      `${this.vacancyUrl}${vacancyPath(vacancyId)}`,
      authorization
    );
  }

  profile(authorization: string): Promise<unknown> {
    return this.read(`${this.profileUrl}${PROFILE_PATH}`, authorization);
  }

  private async read(url: string, authorization: string): Promise<unknown> {
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Authorization: authorization },
        redirect: 'error',
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
      });
    } catch {
      throw new ServiceUnavailableException('Related service unavailable');
    }
    if (response.status === 401) throw new UnauthorizedException();
    if (response.status === 403 || response.status === 404)
      throw new NotFoundException('Related resource not found');
    if (!response.ok)
      throw new ServiceUnavailableException('Related service unavailable');
    try {
      return (await response.json()) as unknown;
    } catch {
      throw new ServiceUnavailableException('Invalid related service response');
    }
  }
}
