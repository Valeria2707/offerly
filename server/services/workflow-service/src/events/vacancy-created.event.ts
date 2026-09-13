import { Type, plainToInstance } from 'class-transformer';
import {
  Equals,
  IsDateString,
  IsString,
  IsUUID,
  ValidateNested,
  validate
} from 'class-validator';
import { VACANCY_CREATED_TOPIC } from './events.constants';
import { isRecord } from '@offerly/helpers';

export class VacancyCreatedData {
  @IsUUID()
  vacancyId!: string;

  @IsUUID()
  userId!: string;
}

export class VacancyCreatedEvent {
  @IsUUID()
  eventId!: string;

  @Equals(VACANCY_CREATED_TOPIC)
  eventType!: typeof VACANCY_CREATED_TOPIC;

  @IsDateString()
  occurredAt!: string;

  @IsString()
  producer!: string;

  @ValidateNested()
  @Type(() => VacancyCreatedData)
  data!: VacancyCreatedData;
}

export async function parseVacancyCreatedEvent(
  value: unknown
): Promise<VacancyCreatedEvent | null> {
  if (!isRecord(value)) return null;
  const event = plainToInstance(VacancyCreatedEvent, value);
  const errors = await validate(event, {
    whitelist: true,
    forbidNonWhitelisted: true
  });
  return errors.length === 0 ? event : null;
}
