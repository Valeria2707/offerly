import { Type, plainToInstance } from 'class-transformer';
import {
  Equals,
  IsDateString,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
  validate
} from 'class-validator';
import { isRecord } from '@offerly/helpers';
import { REMINDER_DUE_TOPIC } from './events.constants';

export class ReminderDueData {
  @IsUUID()
  userId!: string;

  @IsString()
  @MaxLength(50)
  kind!: string;

  @IsString()
  @MaxLength(64)
  subjectId!: string;

  @IsString()
  @MaxLength(300)
  title!: string;

  @IsString()
  @MaxLength(20000)
  body!: string;
}

export class ReminderDueEvent {
  @IsUUID()
  eventId!: string;

  @Equals(REMINDER_DUE_TOPIC)
  eventType!: typeof REMINDER_DUE_TOPIC;

  @IsDateString()
  occurredAt!: string;

  @IsString()
  producer!: string;

  @ValidateNested()
  @Type(() => ReminderDueData)
  data!: ReminderDueData;
}

export async function parseReminderDueEvent(
  value: unknown
): Promise<ReminderDueEvent | null> {
  if (!isRecord(value)) return null;
  const event = plainToInstance(ReminderDueEvent, value);
  const errors = await validate(event, {
    whitelist: true,
    forbidNonWhitelisted: true
  });
  return errors.length === 0 ? event : null;
}
