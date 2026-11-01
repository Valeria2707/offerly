import { randomUUID } from 'node:crypto';

export const KAFKA_TOPICS = {
  VACANCY_CREATED: 'vacancy.vacancy.created.v1',
  VACANCY_DELETED: 'vacancy.vacancy.deleted.v1',
  REMINDER_DUE: 'workflow.reminder.due.v1'
} as const;

export type IntegrationEvent<T> = {
  eventId: string;
  eventType: string;
  occurredAt: string;
  producer: string;
  data: T;
};

export function createIntegrationEvent<T>(
  topic: string,
  producer: string,
  data: T
): IntegrationEvent<T> {
  return {
    eventId: randomUUID(),
    eventType: topic,
    occurredAt: new Date().toISOString(),
    producer,
    data
  };
}
