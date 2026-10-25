import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DEFAULT_PROFILE_SERVICE_URL,
  DEFAULT_VACANCY_SERVICE_URL,
  PROFILE_PATH
} from '../preparation/preparation.constants';
import {
  buildAnalytics,
  toProfileSkills,
  toVacancies
} from '../utils/analytics.utils';
import { toServiceBaseUrl } from '../utils/preparation.utils';
import { ApplicationWorkflow } from '../workflow/entities/application-workflow.entity';
import { SOURCE_TIMEOUT_MS, VACANCIES_PATH } from './analytics.constants';
import { AnalyticsDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  private readonly vacancyUrl: string;
  private readonly profileUrl: string;
  constructor(
    @InjectRepository(ApplicationWorkflow)
    readonly workflows: Repository<ApplicationWorkflow>,
    config: ConfigService
  ) {
    this.vacancyUrl = toServiceBaseUrl(
      config.get<string>('VACANCY_SERVICE_URL', DEFAULT_VACANCY_SERVICE_URL)
    );
    this.profileUrl = toServiceBaseUrl(
      config.get<string>('PROFILE_SERVICE_URL', DEFAULT_PROFILE_SERVICE_URL)
    );
  }

  async overview(
    userId: string,
    authorization: string,
    period: number | null
  ): Promise<AnalyticsDto> {
    const [workflows, vacancies, profile] = await Promise.all([
      this.workflows.find({
        where: { userId },
        relations: { stages: { stageType: true } }
      }),
      this.read(`${this.vacancyUrl}${VACANCIES_PATH}`, authorization),
      this.read(`${this.profileUrl}${PROFILE_PATH}`, authorization)
    ]);
    if (!Array.isArray(vacancies))
      throw new ServiceUnavailableException('Invalid vacancy list');
    return buildAnalytics({
      vacancies: toVacancies(vacancies),
      workflows,
      profileSkills: toProfileSkills(profile),
      period,
      now: new Date()
    });
  }

  private async read(url: string, authorization: string): Promise<unknown> {
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Authorization: authorization },
        redirect: 'error',
        signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS)
      });
    } catch {
      throw new ServiceUnavailableException('Analytics source unavailable');
    }
    if (response.status === 401) throw new UnauthorizedException();
    if (!response.ok)
      throw new ServiceUnavailableException('Analytics source unavailable');
    try {
      return (await response.json()) as unknown;
    } catch {
      throw new ServiceUnavailableException('Invalid analytics source');
    }
  }
}
