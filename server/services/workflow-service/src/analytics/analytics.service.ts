import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpstreamService } from '../upstream/upstream.service';
import {
  buildAnalytics,
  toProfileSkills,
  toVacancies
} from '../utils/analytics.utils';
import { ApplicationWorkflow } from '../workflow/entities/application-workflow.entity';
import { AnalyticsDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ApplicationWorkflow)
    private readonly workflows: Repository<ApplicationWorkflow>,
    private readonly upstream: UpstreamService
  ) {}

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
      this.upstream.vacancies(authorization),
      this.upstream.profile(authorization)
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
}
