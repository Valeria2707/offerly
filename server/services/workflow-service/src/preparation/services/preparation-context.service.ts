import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { isRecord } from '@offerly/helpers';
import { UpstreamService } from '../../upstream/upstream.service';
import { pickFields } from '../../utils/record.utils';
import {
  PROFILE_BASICS_CONTEXT_FIELDS,
  PROFILE_CONTEXT_FIELDS,
  VACANCY_CONTEXT_FIELDS
} from '../preparation.constants';
import { PreparationContext } from '../preparation.types';

@Injectable()
export class PreparationContextService {
  constructor(private readonly upstream: UpstreamService) {}

  async load(
    vacancyId: string,
    authorization: string
  ): Promise<Pick<PreparationContext, 'vacancy' | 'profile'>> {
    const [vacancy, profile] = await Promise.all([
      this.upstream.vacancy(vacancyId, authorization),
      this.upstream.profile(authorization)
    ]);
    if (!isRecord(vacancy) || !isRecord(profile) || !isRecord(profile.data))
      throw new ServiceUnavailableException('Invalid preparation context');
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
}
