import { Type } from 'class-transformer';
import {
  Equals,
  IsDateString,
  IsString,
  IsUUID,
  ValidateNested
} from 'class-validator';
import { KAFKA_TOPICS } from '@offerly/helpers';
import { parseEvent } from './parse-event';

export class VacancyEventData {
  @IsUUID()
  vacancyId!: string;

  @IsUUID()
  userId!: string;
}

export class VacancyCreatedEvent {
  @IsUUID()
  eventId!: string;

  @Equals(KAFKA_TOPICS.VACANCY_CREATED)
  eventType!: typeof KAFKA_TOPICS.VACANCY_CREATED;

  @IsDateString()
  occurredAt!: string;

  @IsString()
  producer!: string;

  @ValidateNested()
  @Type(() => VacancyEventData)
  data!: VacancyEventData;
}

export class VacancyDeletedEvent {
  @IsUUID()
  eventId!: string;

  @Equals(KAFKA_TOPICS.VACANCY_DELETED)
  eventType!: typeof KAFKA_TOPICS.VACANCY_DELETED;

  @IsDateString()
  occurredAt!: string;

  @IsString()
  producer!: string;

  @ValidateNested()
  @Type(() => VacancyEventData)
  data!: VacancyEventData;
}

export const parseVacancyCreatedEvent = (
  value: unknown
): Promise<VacancyCreatedEvent | null> =>
  parseEvent(VacancyCreatedEvent, value);

export const parseVacancyDeletedEvent = (
  value: unknown
): Promise<VacancyDeletedEvent | null> =>
  parseEvent(VacancyDeletedEvent, value);
