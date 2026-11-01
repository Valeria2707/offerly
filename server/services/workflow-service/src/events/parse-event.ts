import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { isRecord } from '@offerly/helpers';

export async function parseEvent<T extends object>(
  EventClass: ClassConstructor<T>,
  value: unknown
): Promise<T | null> {
  if (!isRecord(value)) return null;
  const event = plainToInstance(EventClass, value);
  const errors = await validate(event, {
    whitelist: true,
    forbidNonWhitelisted: true
  });
  return errors.length === 0 ? event : null;
}
